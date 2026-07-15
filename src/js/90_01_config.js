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

(function () {
    var s = document.createElement('script');
    s.setAttribute('data-goatcounter', 'https://stadler-tom.goatcounter.com/count');
    s.async = true;
    s.src = '//gc.zgo.at/count.js';
    document.head.appendChild(s);
})();
