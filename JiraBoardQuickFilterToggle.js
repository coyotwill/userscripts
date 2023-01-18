// ==UserScript==
// @name     JiraBoardQuickFilterToggle
// @version  1.0
// @description Deselect previous quick-filter when one is selected
// @match    https://*/secure/RapidBoard.jspa*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant    GM_addStyle
// ==/UserScript==

var glbForceSingleFilter = true;

$("#ghx-view-presentation").prepend(
    `<button id="tmSingleBtn" class="aui-button ghx-cursor-help" data-tooltip="Force selection of a single quick-filter">
         <input id="tmSingleSelect" type="checkbox" checked> &#128587;
     </button>`);

$("#tmSingleSelect").click(zEvent => {
    glbForceSingleFilter = $("#tmSingleSelect").is(':checked');
    console.info("XXX single "+glbForceSingleFilter)
    zEvent.stopPropagation()
} );

$("#tmSingleBtn").click(zEvent => {
    $("#tmSingleSelect").click();
} );


let quickFilterClickHandler = function(evt) {
    // Only act on real user click to avoid recursion
    if(glbForceSingleFilter && evt.originalEvent && evt.originalEvent.isTrusted) {
        // Find all other "active" quick filters
        var otherSelectedFilters = $(".js-quickfilter-button.ghx-active");
        var targetIndex = otherSelectedFilters.index(evt.target);
        if (targetIndex > -1) {
            otherSelectedFilters.splice(targetIndex, 1);
        }
        // .. and deselect them
        otherSelectedFilters.each(function(i, f) {
            f.click()
        });
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
#tmSingleSelect {
    vertical-align: text-top;
}
`);
