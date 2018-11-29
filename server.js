require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const passport = require('passport');
const cookieParser = require('cookie-parser');

const db = require("./models");

function ignoreFavicon(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({nope: true});
  } else {
    next();
  }
}

var app = express();
var PORT = process.env.PORT || 3006;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(ignoreFavicon);
    
// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require('./controllers/calendarsController.js')(app);
require('./controllers/login.js')(app, passport);
require('./controllers/home.js')(app);
require('./controllers/chat.js')(app, passport);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function () {
  app.listen(PORT, function () {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;