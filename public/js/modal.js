$(function () {
    $("#datepicker").datepicker({ dateFormat: 'dd/mm/yy' });
});

function openmodal() {
    $("#event_edit_container").css('visibility', 'visible');
    var $dialogContent = $("#event_edit_container");

    $dialogContent.dialog({
        modal: true,
        title: "Add This To My Calendar",
        buttons: {
            "Save": function () {
                //    Ajax POST requests to /api/calendar
                // Get value of date input
                var dateInput = $('#datepicker').val()
                //console.log(dateInput)
                var type = $('#type').val()
                var name = $('#name').val()
                var info = $('#info').val()
                var location = $('#location').val()

                var eventObject = {
                    type: type,
                    name: name,
                    start_date: dateInput,
                    info: info,
                    location: location,
                    userid: 1
                };
                //console.log(eventObject);

                $.post("/api/calendars", eventObject, function (res) {
                    $dialogContent.dialog("close");
                    $("#event_edit_container").css('visibility', 'hidden');
                });

            },


            Cancel: function () {
                $(this).dialog("close");
            }
        }
    }).show();
    $("#ui-datepicker-div").css("z-index", "9999");
}
