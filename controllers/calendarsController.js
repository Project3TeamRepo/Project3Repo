var path = require('path');
var express = require("express");

var router = express.Router();

// Import the model (cat.js) to use its database functions.
var db = require("../models");

module.exports = function (app) {
  // Create all our routes and set up logic within those routes where required.
  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

  app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, "../public/images/favicon.ico"));;
  });

  app.get('/login', function (req, res) {
    //i want to run the linkded in code here

    //res.render('login', { user: req.user });
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get("/calendars", function (req, res) {
    // db.calendars.findAll({})
    // .then(function(result) {
    //   var hbsObject = {
    //     calendars: result
    //   };
    //   res.render("calendar", hbsObject);
    //});
    res.render("calendar", { user: req.user });
  });

  app.get("/api/calendar", function (req, res) {
    db.calendars.findAll({})
      .then(function (result) {
        res.json(result);
      });
  });

  app.post("/api/calendars", function (req, res) {
    //console.log(req.body);
    db.calendars.create(
      {
        eventTypeId: req.body.type,
        Event_Name: req.body.name,
        Start_Date: req.body.start_date,
        Event_Info: req.body.info,
        Location: req.body.location,
        userId: req.body.userid
      })
      .then(function (result) {
        // Send back the ID of the new quote
        res.json({ id: result.insertId });
      });
  });

  app.put("/api/calendars/:id", function (req, res) {
    var condition = "id = " + req.params.id; console.log("condition", condition);
    calendar.updateOne({
      Event_Start_Date: req.body.newStartDate
    }, condition, function (result) {
      if (result.changedRows == 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      } else {
        res.status(200).end();
      }
    });
  });

  app.delete("/api/calendar/:id", function (req, res) {
    var condition = "id = " + req.params.id;

    calendar.deleteOne(condition, function (result) {
      if (result.affectedRows == 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      } else {
        res.status(200).end();
      }
    });


  });
}