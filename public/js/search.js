/**
 * Created by TOSHIBA on 1.6.2016.
 */

/** Examples
 * http://www.runningcoder.org/jquerytypeahead/demo/
 * https://github.com/biggora/bootstrap-ajax-typeahead
 *
 *
 * */
$(document).ready(function () {
    console.log("search e girdi");

    $("#search_input").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                url: "http://localhost:3000/topic/getJustTopic",
                data: {
                    q: request.term
                },
                dataType: "json",
                success: function (msg) {
                    console.log("data geemiş : " + msg);
                    var myTopicArray = msg.topics;
                    console.log("myTopicArray :" + myTopicArray);
                    var myTopicss = [];
                    for (var i = 0; i < myTopicArray.length; i++) {
                        myTopicss.push(myTopicArray[i].name);
                    }
                    console.log(myTopicss);
                    response(myTopicss);
                },
                error: function (msg) {
                    alert(msg.status + ' ' + msg.statusText);
                }
            })
        }
    });


});
