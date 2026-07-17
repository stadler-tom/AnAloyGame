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


(function () {
    var PATCH_VERSION = "0.9.5";   // bei neuen Patchnotes hochzählen -> zeigt sie erneut

    $(document).one(":passageend", function () {
        var gesehen = null;
        try { gesehen = localStorage.getItem("anAloyPatchnotes"); } catch (e) {}
        if (gesehen === PATCH_VERSION) return;          // schon gesehen -> nichts tun

        setTimeout(function () {
            Dialog.setup("Neuigkeiten", "notizbuch-dialog patchnotes-dialog");
            Dialog.wiki(Story.get("Patchnotes").text);
            Dialog.open();
            try { localStorage.setItem("anAloyPatchnotes", PATCH_VERSION); } catch (e) {}
        }, 150);
    });
})();