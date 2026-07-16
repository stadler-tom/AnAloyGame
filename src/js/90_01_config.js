/* ================================================================
   SECTION 01  CONFIG
   ================================================================ */

Config.history.maxStates = 2;
Config.debug = false;
Config.passages.nobr = true;

$(document).on('change', '#debug-toggle input', function () {
    if (setup.debugTitleAktualisieren) setup.debugTitleAktualisieren();
});

$(document).on(':passagedisplay', function (ev) {
    if (State.variables.world.debug) {
        $(ev.detail.content).prepend('<div class="debug-passagentitel">Passage: ' + ev.detail.passage.name + '</div>');
    }
});

setup.debugTitleAktualisieren = function () {
    var $p = $('#passages .passage').last();
    $p.find('.debug-passagentitel').remove();
    if (State.variables.world.debug) {
        $p.prepend('<div class="debug-passagentitel">Passage: ' + State.passage + '</div>');
    }
};

(function () {
  var url = 'https://aloystorycounter.stadler-tom.workers.dev/';
  try {
    if (!localStorage.getItem('anAloyGezaehlt')) {
      fetch(url, { keepalive: true });
      localStorage.setItem('anAloyGezaehlt', '1');
    }
  } catch (e) {
    try { fetch(url, { keepalive: true }); } catch (e2) {}
  }
})();

/* Titelbilder vorab laden, damit sie beim ersten Rendern schon im Cache liegen */
(function () {
    [
        "images/Thomas_Kap0.png",
        "images/Thomas_Kap1.png",
        "images/Thomas_Kap1_scar.png",
        "images/Thomas_Kap2.png",
        "images/Thomas_Kap2_scar.png"
    ].forEach(function (src) { var img = new Image(); img.src = src; });
})();
