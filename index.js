var app = require("express")();
var express = require("express");
var path = require("path");
var http = require("http").Server(app);
const socketIo = require("socket.io")(http);
var validator = require("express-validator");
const userController = require("./controllers/UserController");
// import controller
var AuthController = require("./controllers/AuthController");

// import Router file
var pageRouter = require("./routers/route");

var session = require("express-session");
var bodyParser = require("body-parser");
var flash = require("connect-flash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
app.use(bodyParser.json());
var urlencodeParser = bodyParser.urlencoded({ extended: true });

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection success");
  });

// Username and password Data Schema

app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1200000,
    },
  })
);

app.use(
  session({ resave: false, saveUninitialized: true, secret: "nodedemo" })
);
app.use(flash());

app.use("/public", express.static("public"));

app.get("/layouts/", function (req, res) {
  res.render("view");
});

// apply controller
AuthController(app);

//For set layouts of html view
var expressLayouts = require("express-ejs-layouts");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);

// Define All Route
pageRouter(app);

const server = http.listen(8000, function () {
  console.log("listening on *:8000");
});

// Socket.io setup
const io = require("socket.io")(server);

let count = 0;
socketIo.on("connection", (socket) => {
  console.log("A user connected.");

  // Listen for the 'counter' event from the client
  socket.on("counter", (count) => {
    console.log(`Counter value received: ${count}`);

    // Update the counter value in the database
    User.findOneAndUpdate({ username: username }, { counter: count }, (err) => {
      if (err) {
        console.error(err);
        socket.emit(
          "counterError",
          "Could not update counter value in database"
        );
      } else {
        console.log("Counter value updated in database");
      }
    });

    // Broadcast the updated count value to all connected clients
    socket.broadcast.emit("counterUpdate", count);
  });
});
