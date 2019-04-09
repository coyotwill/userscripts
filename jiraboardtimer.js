// ==UserScript==
// @name     JiraBoardTimer
// @description Adds a timer to Jira sprint boards that starts when a quick filter is selected. Usefull to track talk time during scrum meetings.
// @match    https://*/secure/RapidBoard.jspa*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant    GM_addStyle
// ==/UserScript==

// Test values, to be adjusted for your own use-case
var glbWarnValueSec = 5;
var glbOverValueSec = 10;

var glbOkColor = "lightgreen";
var glbWarnColor = "khaki";
var glbOverColor = "tomato";

var gblTimerStart;
var gblTimerId;

function glbUpdateStatus(elt, speaker) {
    var elapsed = ((performance.now() - gblTimerStart) / 1000);
    if(elapsed < glbWarnValueSec) {
        elt.css("background-color", glbOkColor);
        elt.text(speaker);
    } else if(elapsed < glbOverValueSec) {
        elt.css("background-color", glbWarnColor);
        elt.text(speaker);
    } else {
        elt.css("background-color", glbOverColor);
        elt.text(elapsed.toFixed(0) + "s - " + speaker);
    }
}

function glbStopStatus(elt) {
    elt.text("");
    elt.css("background-color", "initial");
}

$("#content").before(`
    <div id="tmStopWatchDiv">
        <p id="tmTimeSpan">&nbsp;</p>
    </div>
`);

$(".js-quickfilter-button").click(zEvent => {
    var statusNode = $("#tmTimeSpan");
    var shouldStart = $(".js-quickfilter-button.ghx-active").length === 1;

    //-- Stop the timer, if any
    if(gblTimerId) clearInterval(gblTimerId);

    if(shouldStart)
    {
        var speaker = $(".js-quickfilter-button.ghx-active")[0].text;
        gblTimerStart = performance.now();
        // Start timer
        gblTimerId = setInterval(() => glbUpdateStatus(statusNode, speaker), 1000);
    }
    else
    {
        glbStopStatus(statusNode)
    }
} );

GM_addStyle(`
#tmTimeSpan {
    padding: 5px;
    text-align: center;
    font-size: 2em;
}
#tmTimeSpan::before {
  content: "\u23F1 "; // StopWatch emoji
}

#tmStopWatchDiv {
    clear: both;
    border-bottom: solid 1px lightgrey;
}
`);

