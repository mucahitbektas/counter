var express = require("express");
var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var validator = require("express-validator");

var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");

// This sets the mock adapter on the default instance
var mock = new MockAdapter(axios);

let users = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    email: "admin@themesbrand.com",
  },
];

// Mock GET request to /users when param `searchText` is 'John'
mock.onGet("/users", { params: { searchText: "John" } }).reply(200, {
  users: users,
});

module.exports = function (app) {
  // Inner Auth
  app.get("/pages-login", function (req, res) {
    res.locals = { title: "Login 1" };
    res.render("AuthInner/pages-login");
  });

  // Extra Pages

  app.get("/pages-404", function (req, res) {
    res.locals = { title: "Error 404" };
    res.render("Pages/pages-404");
  });
  app.get("/pages-500", function (req, res) {
    res.locals = { title: "Error 500" };
    res.render("Pages/pages-500");
  });



  app.get("/", function (req, res) {
    res.render("Auth/auth-login", {
      message: req.flash("message"),
      error: req.flash("error"),
    });
  });

  app.post("/post-login", urlencodeParser, function (req, res) {
    const validUser = users.filter(
      (usr) =>
        usr.username === req.body.username && usr.password === req.body.password
    );
    if (validUser["length"] === 1) {
      // Assign value in session
      sess = req.session;
      sess.user = validUser;

      res.redirect("/sayac");
    } else {
      req.flash("error", "Incorrect email or password!");
      res.redirect("/");
    }
  });

  app.get("/logout", function (req, res) {
    // Assign  null value in session
    sess = req.session;
    sess.user = null;

    res.redirect("/");
  });
};
