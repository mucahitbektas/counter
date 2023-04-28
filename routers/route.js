var express = require("express");
var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var validator = require("express-validator");
const userController = require("../controllers/UserController");
const User = require("../models/UserModel");
const session = require("express-session");
const { MongoClient } = require("mongodb");

module.exports = function (app) {
  let username = "";

  app.post("/", urlencodeParser, function (req, res) {
    const maxAge = 1000 * 60 * 60 * 24; // Set cookie max age to 1 day (in milliseconds)

    // Make sure the username and password fields are not empty
    if (!req.body.username || !req.body.password) {
      return res.redirect("/");
    }

    userController.getAllUsers(req, res).then((result) => {
      let loggedIn = false;
      for (let i = 0; i < result.length; i++) {
        if (
          result[i].username === req.body.username &&
          result[i].password === req.body.password
        ) {
          loggedIn = true;
          req.session.username = req.body.username; // Set the username as a property of the session object
          break;
        }
      }
      if (loggedIn) {
        res.cookie("loggedIn", true, { maxAge: maxAge }); // Set a cookie to indicate that the user is logged in
        username = req.session.username; // set the username variable
        res.redirect("/sayac");
      } else {
        res.redirect("/");
      }
    });
  });

  app.get("/sayac", isUserAllowed, async (req, res) => {
    try {
      const user = await User.findOne({ username: req.session.username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const counter = user.counter;
      res.locals = { title: "Dashboard", counter: counter };
      res.render("Pages/sayac");
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app.post("/sayac", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.session.username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let newCounter = user.counter;

      if (req.body.operation === "increase") {
        newCounter++;
      } else if (req.body.operation === "decrease" && newCounter > 0) {
        newCounter--;
      }

      user.counter = newCounter;
      await user.save();

      console.log("User updated: ", user);

      res.json({ counter: newCounter });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  function isUserAllowed(req, res, next) {
    if (res.cookie("loggedIn")) {
      return next();
    } else {
      res.redirect("/login");
    }
  }

  async function getUsersFromUserLists() {
    try {
      const client = await MongoClient.connect(
        "mongodb+srv://t3sayacadmin:uPgrmRjhjoMgC0WM@t3sayac-cluster.5vazmpm.mongodb.net/t3-counter"
      );
      const db = client.db("t3-counter"); // veritabanı nesnesi oluşturuldu
      const collection = db.collection("user-lists"); // koleksiyona erişildi
      const users = await collection
        .find({}, { projection: { _id: 0, counter: 1 } })
        .toArray();
      client.close();
      return users;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // Report
  app.get("/report", isUserAllowed, function (req, res) {
    getUsersFromUserLists()
      .then((users) => {
        let parkingArea1Count = users[0].counter;
        let parkingArea2Count = users[1].counter;
        let parkingArea3Count = users[2].counter;
        let parkingArea4Count = users[3].counter;
        let parkingArea5Count = users[4].counter;
        let parkingArea6Count = users[5].counter;
        res.render("Pages/report", {
          parkingArea1Count: parkingArea1Count,
          parkingArea2Count: parkingArea2Count,
          parkingArea3Count: parkingArea3Count,
          parkingArea4Count: parkingArea4Count,
          parkingArea5Count: parkingArea5Count,
          parkingArea6Count: parkingArea6Count,
        });
      })
      .catch((error) => {
        console.error(error);
        res.render("Pages/report", {
          parkingArea1Count: -1,
          parkingArea2Count: -1,
          parkingArea3Count: -1,
          parkingArea4Count: -1,
          parkingArea5Count: -1,
          parkingArea6Count: -1,
        });
      });
  });

  // Chat
  app.get("/apps-chat", isUserAllowed, function (req, res) {
    res.locals = { title: "Chat" };
    res.render("Chat/apps-chat");
  });
  app.get("/pages-404", isUserAllowed, function (req, res) {
    res.locals = { title: "Error 404" };
    res.render("Pages/pages-404");
  });
  app.get("/pages-500", isUserAllowed, function (req, res) {
    res.locals = { title: "Error 500" };
    res.render("Pages/pages-500");
  });
};
