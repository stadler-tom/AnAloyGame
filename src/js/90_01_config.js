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

// Hier kein <script>-Tag verwenden, sondern den Code direkt so:
var script = document.createElement('script');
script.setAttribute('data-goatcounter', 'https://stadler-tom.goatcounter.com/count');
script.setAttribute('async', 'true');
script.setAttribute('src', '//gc.zgo.at/count.js');
document.head.appendChild(script);
