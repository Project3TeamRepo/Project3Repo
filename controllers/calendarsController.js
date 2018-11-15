var path = require('path');
var express = require("express");

var router = express.Router();

var db = require("../models");

module.exports = function (app) {
  app.get("/", function (req, res) {
    var condition = 2; //req.params.id;

    db.calendars.findAll({where:{For_Whom: condition}})
        .then(function(resultC) {
          for(let i=0; i<resultC.length; i++){
            let typeId = resultC[i].Event_Type;
            var typeText = "";
            switch(typeId){
              case 1: typeText = "(birthday)";
              break;
              case 2: typeText = "(appointment)";
              break;
              case 3: typeText = "(meeting)";
              break;
              case 4: typeText = "(social)";
              break;
              case 5: typeText = "(school work)";
              break;
              default: typeText = "(meeting)";
              break;
            }
            resultC[i].Event_Type = typeText;
          }

          db.todos.findAll({where:{User_Id: condition}})
          .then(function(resultT) {
            db.shopping_items.findAll({where:{User_Id: condition}})
            .then(function(resultS) {
                res.render("index", {
                  calendars: resultC,
                  todos: resultT,
                  shopping: resultS
                });
            });//end then of shopping.findAll which is innermost
        });//end then of todos.findAll which is middle of nest
    });//end then of calendars.findAll which is outermost
  
  });

  // app.get("/calendars/:id", function(req, res) {
  //   var searchId = req.params.id;

  //   db.calendars.findAll({where:{id: searchId}})
  //   .then(function(result) {
  //     res.json({ detail: result });
  //   });
  // });

  app.get("/todos/:id", function(req, res) {
    var searchId = req.params.id;

    db.todos.findAll({where:{id: searchId}})
    .then(function(result) {
      res.json({ detail: result });
    });
  });

  
  app.get("/shopping/:id", function(req, res) {
    var searchId = req.params.id;

    db.shopping_items.findAll({where:{id: searchId}})
    .then(function(result) {
      res.json({ detail: result });
    });
  });

  app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, "../public/images/favicon.ico"));
  });

  app.get('/home.html', function (req, res) {
    res.sendFile(path.join(__dirname, "../public/home.html"));
  });

  app.post("/api/calendars", function (req, res) {

    db.calendars.create(
      {
        Event_Name: req.body.name,
        Start_Date: req.body.date,
        Event_Info: req.body.info,
        Location: req.body.where,
        Event_Type: req.body.type,
        For_Whom: req.body.userid
      })
      .then(function (result) {
        res.json({ id: result.insertId });
      });
  });

  app.post("/api/todos", function (req, res) {
    
    db.todos.create(
      {
        Todo_Name: req.body.name,
        Todo_Date: req.body.date,
        Todo_Info: req.body.info,
        Todo_Location: req.body.where,
        Todo_Status: 'Pending',
        User_Id: req.body.userid
      })
      .then(function (result) {
        res.json({ id: result.insertId });
      });
  });

  app.post("/api/shopping", function (req, res) {
    
    db.shopping_items.create(
      {
        List_Name: req.body.name,
        List_Quantity: req.body.quantity,
        List_Location: req.body.where,
        User_Id: req.body.userid
      })
      .then(function (result) {
        res.json({ id: result.insertId });
      });
  });

  app.post("/todos/:id", function(req,res){ console.log("inside PUT yay! req.body = ");
    let updateId = req.params.id;
    console.log("req===="); console.log(updateId);
    db.todos.update(
      { Todo_Status: 1 },
      {
        where: {
          id: updateId
        }
      })
    .then(function(dbTodo) {
      res.json(dbTodo);
    });
  });

  app.post("/shopping/:id", function(req,res){
    let updateId = req.params.id;
    db.shopping_items.update(
      { List_Status: 1 },
      {
        where: {
          id: updateId
        }
      })
    .then(function(dbShopping) {
      res.json(dbShopping);
    });
  });


  app.put("/calendars/:id", function (req, res) {
    var condition = "id = " + req.params.id; console.log("condition", condition);
    console.log("===req.params===="); console.log(req.params);
    // calendar.updateOne({
    //   Event_Start_Date: req.body.newStartDate
    // }, condition, function (result) { console.log(result);
    //   if (result.changedRows == 0) {
    //     // If no rows were changed, then the ID must not exist, so 404
    //     return res.status(404).end();
    //   } else {
    //     res.status(200).end();
    //   }
    // });
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