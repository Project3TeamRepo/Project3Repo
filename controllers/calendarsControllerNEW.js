var path = require('path');
var express = require("express");

var router = express.Router();

// Import the model (cat.js) to use its database functions.
var db = require("../models");

module.exports = function (app) {
  // Create all our routes and set up logic within those routes where required.
  app.get("/", function (req, res) {
    var hbsObject = [];
    var condition = 2; //req.params.id;

    db.calendars.findAll({where:{For_Whom: condition}})
        .then(function(resultC) { console.log(resultC);

        db.todos.findAll({where:{User_Id: condition}})
        .then(function(resultT) { console.log(resultT);

            db.shopping_items.findAll({where:{User_Id: condition}})
            .then(function(resultS) { console.log(resultS);

                res.render("index", {
                  calendars: resultC,
                  todos: resultT,
                  shopping: resultS
                });
            });//end shopping.findAll which is innermost
        });//end todos.findAll which is middle of nest
    });//end then calendars.findAll which is outermost
  
  });

  app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, "../public/images/favicon.ico"));
  });

  app.post("/api/calendars", function (req, res) {
    console.log(req.body);
    db.calendars.create(
      {
        Event_Name: req.body.name,
        Start_Date: req.body.start_date,
        Event_Info: req.body.info,
        Location: req.body.location,
        Event_Type: req.body.type,
        User_Id: req.body.userid
      })
      .then(function (result) {
        // Send back the ID of the new quote
        res.json({ id: result.insertId });
      });
  });

  app.post("/api/todos", function (req, res) {
    console.log(req.body);
    db.todos.create(
      {
        Todo_Name: req.body.name,
        Todo_Date: req.body.date,
        Todo_Info: req.body.info,
        Todo_Location: req.body.location,
        User_Id: req.body.userid
      })
      .then(function (result) {console.log("=====FINISHED==========="); console.log(res); console.log("============");
        // Send back the ID of the new quote
        res.json({ id: result.insertId });
      });
  });

  app.post("/api/shopping", function (req, res) {
    console.log(req.body);
    db.shopping_items.create(
      {
        List_Name: req.body.name,
        List_Quantity: req.body.quantity,
        List_Location: req.body.location,
        User_Id: req.body.userid
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