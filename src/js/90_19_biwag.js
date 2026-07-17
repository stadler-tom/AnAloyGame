setup.biwagKatalog = [
    { key:"rationen",     gruppe:"ueberleben", label:"Volle Rationen",                 last:2, text:"Brot, Pökelfleisch, Erbsen für sieben Tage. Ohne: knappe Rationen — ihr müsst unterwegs jagen." },
    { key:"zelte",        gruppe:"ueberleben", label:"Zelte & Planen",                 last:2, text:"Schutz an den Regentagen. Ohne: Nässe und Krankheitsrisiko." },
    { key:"kessel",       gruppe:"ueberleben", label:"Kochkessel, Zunder & Feuerzeug", last:1, text:"Warmes Essen. Ohne: kalte Kost drückt täglich die Stimmung." },
    { key:"futter",       gruppe:"ueberleben", label:"Zugtierfutter",                  last:1, text:"Der Ochse bleibt bei Kräften. Ohne: zäher Marsch am ersten und letzten Tag." },
    { key:"feldscher",    gruppe:"helfer",     label:"Feldscher-Vorrat",               last:1, text:"Verbände, Kräuter, Branntwein — leichtere Heilkunde-Proben." },
    { key:"schanzzeug",   gruppe:"helfer",     label:"Schanzzeug",                     last:1, text:"Spaten, Beil, Seil — Lager befestigen, Karren bergen." },
    { key:"waffenpflege", gruppe:"helfer",     label:"Waffenpflege",                   last:1, text:"Ersatzsehnen, Wetzsteine, Zündkraut — Waffen bleiben einsatzfähig." },
    { key:"laterne",      gruppe:"helfer",     label:"Laterne & Öl",                   last:1, text:"Licht für die Nachtwache." },
    { key:"angelzeug",    gruppe:"helfer",     label:"Angel- & Fallenzeug",            last:1, text:"Macht die Jagd ergiebig — nur sinnvoll, wenn du keine vollen Rationen nimmst." },
    { key:"branntwein",   gruppe:"helfer",     label:"Branntwein & Spielkarten",       last:1, text:"Hebt die Stimmung am Lagerfeuer." },
    { key:"hygiene",      gruppe:"helfer",     label:"Latrinenspaten & Kalk",          last:1, text:"Hält die Lagerkrankheit fern." },
    { key:"decken",       gruppe:"helfer",     label:"Extra Wolldecken",               last:1, text:"Halber Regen- und Kälteschutz — billiger als Zelte." }
];

setup.biwagItemMod = function (key) {
    var e = State.variables.world.biwagEquipment;
    return (e && e[key]) ? -2 : 0;   /* -2 DC, wenn das Item gepackt ist */
};

/* ===== BIWAK-HELFER ===== */
/* Zentrale Stellschrauben */
setup.BIWAG = { grunddrain: 2, failMalus: 3, critBonus: 2, rastMalus: 2, hunger: 3 };

setup.biwagBeatOnce = function (id) {
    var w = State.variables.world;
    if (!w.biwagBeatsDone) w.biwagBeatsDone = {};
    if (w.biwagBeatsDone[id]) return false;
    w.biwagBeatsDone[id] = true;
    return true;
};

/* GEÄNDERT: Boden bei 0, und == null statt || (sonst wird echte 0 als 100 gelesen) */
setup.biwagMoral = function (d) {
    var w = State.variables.world;
    w.biwagMoral = Math.min(100, Math.max(0, (w.biwagMoral == null ? 100 : w.biwagMoral) + d));
    return "";
};

setup.biwagProviant = function (d) {
    var w = State.variables.world;
    w.biwagProviant = Math.max(0, (w.biwagProviant || 0) + d);
    return "";
};

/* NEU */
setup.biwagVerzug = function (d) {
    var w = State.variables.world;
    w.biwagVerzug = Math.max(0, (w.biwagVerzug || 0) + d);
    return "";
};

/* NEU: Tagesbeginn — Grunddrain + Ration; kein Vorrat -> Hunger */
setup.biwagTagStart = function () {
    var w = State.variables.world;
    setup.biwagMoral(-setup.BIWAG.grunddrain);
    if ((w.biwagProviant || 0) <= 0) {
        setup.biwagMoral(-setup.BIWAG.hunger);
    } else {
        setup.biwagProviant(-1);
    }
    return "";
};

/* NEU: Tagesende — Rast-Malus, falls heute gerastet */
setup.biwagTagEnde = function () {
    var w = State.variables.world;
    if (w.biwagRastHeute) {
        setup.biwagMoral(-setup.BIWAG.rastMalus);
        w.biwagRastHeute = false;
    }
    return "";
};

/* NEU: Rast-Entscheidung — kostet Zeit jetzt (Tages-Flag) und später (Verzug) */
setup.biwagRast = function () {
    setup.biwagVerzug(1);
    State.variables.world.biwagRastHeute = true;
    return "";
};

/* NEU: zentraler Check — crit(20) +2 · success 0 · fail -X · fumble(1) -X UND +Zeit */
setup.biwagCheck = function (skill, dc, mod, failMalus) {
    failMalus = (failMalus == null) ? setup.BIWAG.failMalus : failMalus;
    var r = setup.skillCheckXp(skill, dc, mod || 0);
    if (r.outcome === "crit") {
        setup.biwagMoral(setup.BIWAG.critBonus);
    } else if (r.outcome === "fumble") {
        setup.biwagMoral(-failMalus);
        setup.biwagVerzug(1);
    } else if (!r.success) {
        setup.biwagMoral(-failMalus);
    }
    return r;   /* Passage verzweigt auf _r.success für die Prosa */
};

setup.biwagItemMod = function (key) {
    var e = State.variables.world.biwagEquipment;
    return (e && e[key]) ? -2 : 0;
};

setup.biwagAngel = function () {
    return setup.biwagItemMod("angelzeug");
};

setup.biwagWetterMalus = function (gebaut) {   /* Regen */
    var e = State.variables.world.biwagEquipment;
    if (e && e.zelte) return 0;
    if (gebaut && e && e.schanzzeug) return -2;
    if (e && e.decken) return -3;
    return -6;
};

setup.biwagKaelteMalus = function () {         /* Kälte */
    var e = State.variables.world.biwagEquipment;
    if (e && (e.zelte || e.decken)) return 0;
    return -6;
};

/* GEÄNDERT: rechnet Verzug einmalig ein, ehe die Stufe fällt */
setup.biwagVerdikt = function () {
    var w = State.variables.world;
    if (!w.biwagVerzugAbgerechnet) {
        setup.biwagMoral(-Math.max(0, (w.biwagVerzug || 0) - 1));
        w.biwagVerzugAbgerechnet = true;
    }
    var m = w.biwagMoral || 0;
    var stufe = m >= 85 ? "ausgezeichnet" : m >= 65 ? "bestanden" : m >= 45 ? "knapp" : "durchgefallen";
    var p = State.variables.player;
    p.flags = p.flags || {};
    p.flags.biwagErgebnis = { stufe: stufe, wert: m };
    return stufe;
};

/* --- Biwak-Wochenprotokoll --- */
setup.biwagLogInit = function () {
    var w = State.variables.world;
    if (!Array.isArray(w.biwagLog)) w.biwagLog = [];
    return w.biwagLog;
};

setup.biwagLogPush = function (text, good) {
    var log = setup.biwagLogInit();
    log.push({ text: text, good: (good !== false) });   // good = true (Standard), false = Rückschlag
    return "";
};

setup.biwagLogRender = function () {
    var log = setup.biwagLogInit();
    if (log.length === 0) {
        return '<p class="journal-empty">Noch hat die Woche keine Spuren hinterlassen.</p>';
    }
    var out = '<ul class="biwag-log">';
    log.forEach(function (e) {
        var cls = e.good ? 'biwag-log-gut' : 'biwag-log-schlecht';
        var zeichen = e.good ? '✔' : '✘';
        out += '<li class="' + cls + '"><span class="biwag-log-mark">' + zeichen + '</span> ' + e.text + '</li>';
    });
    return out + '</ul>';
};