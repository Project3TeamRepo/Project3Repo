function openmodalAC() {
    $("#event_add_container").css('visibility', 'visible');
}
function openmodalVC() {
    $("#event_view_container").css('visibility', 'visible');
}

function newEvent(e) {
    //    Ajax POST requests to /api/calendar
    // Get value of date input
    let dateInput = $('#datepicker').val()
    //console.log(dateInput)
    let type = $('#type').val()
    let name = $('#name').val()
    let info = $('#info').val()
    let location = $('#location').val()

    let eventObject = {
        type: type,
        name: name,
        start_date: dateInput,
        info: info,
        location: location,
        userid: 1
    };

    $.post("/api/calendars", eventObject, function (res) {
        console.log("res came back as "); console.log(res); console.log("===========");
        $("#event_edit_container").css('visibility', 'hidden');
    });
}