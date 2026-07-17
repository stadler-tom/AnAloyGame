setup.ambientTracks = ["amb01","amb02","amb03","amb04","amb05","amb06","amb07","amb08","amb09","amb10"];

setup.musikSpiele = function (i) {
    var M = State.variables.world.musik;
    var n = setup.ambientTracks.length;
    M.i = ((i % n) + n) % n;     // wrappt -> Endlosschleife
    SimpleAudio.select(":all").off("ended").stop();
    var run = SimpleAudio.select(setup.ambientTracks[M.i]);
    run.volume(M.vol);
    run.one("ended", function () { setup.musikSpiele(State.variables.world.musik.i + 1); });
    run.play();
    M.an = true;
    setup._musikPausiert = false;
};

setup.musikToggle = function () {
    var M = State.variables.world.musik;
    if (M.an) {                                    // läuft -> pausieren
        SimpleAudio.select(":all").pause();
        M.an = false;
        setup._musikPausiert = true;
    } else if (setup._musikPausiert) {             // pausiert -> selben Titel fortsetzen
        SimpleAudio.select(setup.ambientTracks[M.i]).play();
        M.an = true;
        setup._musikPausiert = false;
    } else {
        setup.musikSpiele(Math.floor(Math.random() * setup.ambientTracks.length));   // Zufallsindex
    }
};

setup.musikNext = function () { setup.musikSpiele((State.variables.world.musik.i || 0) + 1); };
setup.musikPrev = function () { setup.musikSpiele((State.variables.world.musik.i || 0) - 1); };

setup.musikVol = function (v) {
    var M = State.variables.world.musik;
    M.vol = Math.max(0, Math.min(1, Number(v) || 0));
    SimpleAudio.select(":all").volume(M.vol);
};

$(document).on("input", "#musik-regler", function () {
    setup.musikVol(this.value / 100);
    $("#musik-vol").text(Math.round(this.value) + "%");
});

$(document).one(":storyready", function () {
    if (State.variables.world && State.variables.world.musik) State.variables.world.musik.an = false;
    setup._musikPausiert = false;
});