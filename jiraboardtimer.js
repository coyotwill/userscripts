// ==UserScript==
// @name     JiraBoardTimer
// @description Adds a timer to Jira sprint boards that starts when a quick filter is selected. Usefull to track talk time during scrum meetings.
// @match    https://*/secure/RapidBoard.jspa*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant    GM_addStyle
// ==/UserScript==

// Test values, to be adjusted for your own use-case
var glbWarnValueSec = 90;
var glbOverValueSec = 120;

var glbOkColor = "lightgreen";
var glbWarnColor = "khaki";
var glbOverColor = "tomato";

var gblTimerStart;
var gblTimerId;
var glbInterval;

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

function glbShuffle(list, insertTgt) {
    insertTgt = insertTgt || list.first().prev();
    // Randomize list
    list.sort(function(){
        return Math.random() - 0.5;
    }).detach().insertAfter(insertTgt); // Detach and reinsert to update dom.
}

function glbRoll(list, insertTgt) {
    setTimeout(function(){
        glbShuffle(list, insertTgt);
        glbInterval = glbInterval * 115 / 100
        if(glbInterval<400) {
            glbRoll(list, insertTgt)
        }
    }, glbInterval);
}

$("#content").before(`
    <div id="tmStopWatchDiv">
        <p id="tmTimeSpan">&nbsp;</p>
    </div>
`);

$("#ghx-view-presentation").prepend(`
    <button id="tmTimeShuf" class="aui-button">&#127922 Roll</button>
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

$("#tmTimeShuf").click(zEvent => {
    var elt = $("#js-work-quickfilters");
    // Get all quick-filters starting with a Letter
    var list = elt.children("dd:not(.ghx-quickfilter-trigger)").filter(function() {
        return /^[A-Za-z]/.test($(this).text())
    })
    glbInterval = 40;
    glbRoll(list);
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

