/* ================================================================
   SECTION 01  CONFIG
   ================================================================ */

Config.history.maxStates = 2;
Config.debug = false;
Config.passages.nobr = true;

$(document).on(':passagedisplay', function (ev) {
    if (State.variables.world.debug) {
        $(ev.detail.content).prepend(
            '<div style="color:red;font-weight:bold;">Passage: ' +
            ev.detail.passage.name +
            '</div>'
        );
    }
});
