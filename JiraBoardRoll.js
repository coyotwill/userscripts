// ==UserScript==
// @name     JiraBoardRoll
// @version  1.0
// @description Randomize order of Quick Filters in a jira board for more fun in the morning scrum.
// @match    https://*/secure/RapidBoard.jspa*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant    GM_addStyle
// ==/UserScript==

var glbInterval;

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

$("#ghx-view-presentation").prepend(
    `<button id="tmTimeShuf" class="aui-button ghx-cursor-help" data-tooltip="Randomize order of quick-filters">&#127922; Roll</button>`
);

$("#tmTimeShuf").click(zEvent => {
    // Get all quick-filters starting with a Letter
    var list = $(".js-quickfilter-button").filter(function() {
        return /^[A-Za-z]/.test($(this).text())
    })
    glbInterval = 40;
    glbRoll(list);
} );
