$(document).ready(function(){

  function doneTodo(e) { 
    event.preventDefault();
    let url = "/todos/" + e;
    $.post(url,  function (res) {
      window.location.reload();
    });//end function doneTodo
  }

  function doneShopping(e) { 
    event.preventDefault();
    let url = "/shopping/" + e;
    $.post(url,  function (res) {
      window.location.reload();  
    });
  }//end function doneShopping

  // function calendarDetail(e) {
  //   event.preventDefault();
  //   var url = "/calendars/2"; //get id from event
  //   $.get(url, function (result) {
  //     console.log(result);
  //   });
  // }//end function calendarDetail

  $(function () {
    $(".T").on("click", function () {
      event.preventDefault();
      let todoId = this.attributes[0].value;
      doneTodo(todoId);
    });
  });//end listen to class T

  $(function () {
    $(".S").on("click", function () {
      event.preventDefault();
      let shoppingId = this.attributes[0].value;
      doneShopping(shoppingId);
    });
  });//end listen to class S

  // $(function () {
  //   $(".C").on("click", function () {
  //     event.preventDefault();
  //     let calendarId = this.attributes[0].value;
  //     calendarDetail(calendarId);
  //   });
  // });//end listen to class C

  var calendarButton = document.getElementById('calendarButton');
  calendarButton.addEventListener('click', newCalendar, false);

  function newCalendar() {
    event.preventDefault();
    let date = $('#calendarDate').val()
    let type = $('#calendarType').val()
    let name = $('#calendarName').val()
    let info = $('#calendarInfo').val()
    let where = $('#calendarLocation').val()

    let eventObject = {
      type: type,
      name: name,
      date: date,
      info: info,
      where: where,
      userid: 2 //global user id
    };

    $.post("/api/calendars", eventObject, function (res) {
      window.location.reload();
    });
  }//end function newCalendar

  var todoButton = document.getElementById('todoButton');
  todoButton.addEventListener('click', newTodo, false);

  function newTodo() {
    event.preventDefault();
    let userid = 2; //$('#GLOBAL USERID');
    let name = $('#todoName').val();
    let date = $('#todoDate').val();
    let info = $('#todoInfo').val();
    let where = $('#todoLocation').val();

    var eventObject = {
      name: name,
      date: date,
      info: info,
      where: where,
      userid: userid
    };

    $.post("/api/todos", eventObject, function (req, res) {
      $("#todoName").val("");
      $("#todoDate").val("");
      $("#todoInfo").val("");
      $("#todoLocation").val("");
    })
      .then(function () {
        window.location.reload();
      });
  }//end function newTodo

  var shoppingButton = document.getElementById('shoppingButton');
  shoppingButton.addEventListener('click', newShopping, false);

  function newShopping() {
    event.preventDefault();
    let userid = 2; //$('#GLOBAL USERID');
    let name = $('#shoppingName').val();
    let quantity = $('#shoppingQuantity').val();
    let where = $('#shoppingLocation').val();

    var eventObject = {
      name: name,
      quantity: quantity,
      where: where,
      userid: userid
    };

    $.post("/api/shopping", eventObject, function (res) {
      $("#shoppingName").val("");
      $("#shoppingQuantity").val("");
      $("#shoppingLocation").val("");
    })
      .then(function () {
        window.location.reload();
      });
  }//end function newShopping

});//end document ready