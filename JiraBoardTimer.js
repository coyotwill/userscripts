// ==UserScript==
// @name     JiraBoardTimer
// @version  2.0
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

let quickFilterClickHandler = function(evt) {
    var statusNode = $("#tmTimeSpan");
    var activeFilters = $(".js-quickfilter-button.ghx-active")
    var shouldStart = activeFilters.length === 1;

    //-- Stop the timer, if any
    if(gblTimerId) clearInterval(gblTimerId);

    if(shouldStart && /^[A-Za-z]/.test(activeFilters[0].text) )
    {
        var speaker = activeFilters[0].text;
        gblTimerStart = performance.now();
        // Start timer
        gblTimerId = setInterval(() => glbUpdateStatus(statusNode, speaker), 1000);
    }
    else
    {
        glbStopStatus(statusNode)
    }
};

// Wait for quickFilters to appear before binding the click handler
let observer = new MutationObserver(function(mutations) {
    // Same as "each" but will break out of the loop if the inner function returns true.
    mutations.some(function(mutation) {
        if (mutation.target.id === "ghx-controls-work" && mutation.type === "childList") {
            var quickfilters = $(".js-quickfilter-button");
            if (quickfilters.length > 0) {
                // Assign click handler and stop observing
                quickfilters.click(quickFilterClickHandler);
                observer.disconnect();
                return true; // Break out of the `some` loop.
            }
        }
    });
});

observer.observe(document.getElementById("ghx-controls"), {
 childList: true,
 subtree: true,
});


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
