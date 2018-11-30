var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

function newTodo () {
  let userid = 2; //$('#GLOBAL USERID');
  let name = $('#todoName').val();
  let date = $('#todoDate').val();
  let info = $('#todoInfo').val();
  let location = $('#todoLocation').val();

  var eventObject = {
      name: name,
      date: date,
      info: info,
      location: location,
      userid: userid
  };

  $.post("/api/todos", eventObject, function (res) {
      console.log("todo res came back as "); console.log(res); console.log("===========");
      $("#todoName").val("");
      $("#todoDate").val("");
      $("#todoInfo").val("");
      $("#todoLocation").val("");
  });
} 

function newShopping () {
  let name = $('#shoppingName').val();
  let quantity = $('#shoppingQuantity').val();
  let location = $('#shoppingLocation').val();

  var eventObject = {
      name: name,
      quantity: quantity,
      location: location,
      userid: 1
  };

  $.post("/api/shopping", eventObject, function (res) {
      console.log("res came back as "); console.log(res); console.log("===========");
      // $dialogContent.dialog("close");
      // $("#event_edit_container").css('visibility', 'hidden');
  });
} 