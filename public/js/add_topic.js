/**
 * Created by TOSHIBA on 30.5.2016.
 */
$(document).ready(function () {

    console.log("iceri girdi");
    console.log("iceri girdi 2");
    var myMainTopics;
    var mySubTopics;
    var myKeywords;

    $.ajax({
        url: "http://localhost:3000/topic/getValueArray",
        data: {
            format: 'json'
        },
        dataType: 'json',
        error: function () {
            console.log("Hey, there is an fucking error :" + error);
        },
        success: function (data) {
            console.log(data);
            var returnedData = data;
            myMainTopics = returnedData.mainTopics;
            mySubTopics = returnedData.subTopics;
            myKeywords = returnedData.keywords;

            for (var i = 0; myMainTopics.length; i++) {
                var currentMainTopic = myMainTopics[i];
                var name = currentMainTopic.name;
                var id = currentMainTopic._id;
                $('#main_topic_select').append("<option value=\"" + id + "\">" + name + "</option>");
            }

        },
        type: 'GET'

    });
    
    $("#main_topic_select").change(function () {
        console.log("degisti degişti");
        var parent = $(this).val(); //get option value from parent
        $("#sub_topic_select").html("");
        for (var j = 0; j < mySubTopics.length; j++) {
            var currentSubTopic = mySubTopics[j];
            var name = currentSubTopic.name;
            var id = currentSubTopic._id;
            if (currentSubTopic.mainTopic == parent) {
                $("#sub_topic_select").append("<option value=\"" + id + "\">" + name + "</option>");
            }
        }
    });

    $("#sub_topic_select").change(function () {
        console.log("degisti degişti");
        var parent = $(this).val(); //get option value from parent
        $("#keyword_select").html("");

        for (var j = 0; j < myKeywords.length; j++) {
            var currentKeyword = myKeywords[j];
            var name = currentKeyword.name;
            var id = currentKeyword._id;
            if (currentKeyword.subTopic == parent) {
                $("#keyword_select").append("<option value=\"" + id + "\">" + name + "</option>");
            }
        }
    });

});