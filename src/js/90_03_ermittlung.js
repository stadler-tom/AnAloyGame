
/* ================================================================
   SECTION 05  ERMITTLUNG — HELPER
   ================================================================ */

/* Defensiv: legt $world.ermittlung an, falls es im Save noch fehlt (save-sicher). */
setup.ermInit = function () {
    var w = State.variables.world;
    if (!w.ermittlung) {
        w.ermittlung = {
            active: false, gesperrt: false, stufe: 0, motiv: "",
            fruehestens_tag: 0, spuren: [], spurenText: {}, verdacht: {}, flags: {}
        };
    }
    return w.ermittlung;
};

/* Spur einmalig aufnehmen; gibt Alert-HTML zurück (oder "" wenn schon bekannt). */
setup.ermFund = function (id, label) {
    var e = setup.ermInit();
    if (e.spuren.indexOf(id) !== -1) return "";
    e.spuren.push(id);
    if (label) e.spurenText[id] = label;
    return '<div class="system-alert status-info">Neue Spur: ' + (label || id) + '</div>';
};

/* Verdacht gegen einen Verdächtigen anheben/senken (lazy, namespace-sauber). */
setup.ermVerdacht = function (key, mod) {
    var e = setup.ermInit();
    e.verdacht[key] = setup.clamp((e.verdacht[key] || 0) + mod, -10, 10);
    return "";
};

/* Sub-Stufe abschließen: setzt sN_done + hebt stufe. */
setup.ermStufeFertig = function (n) {
    var e = setup.ermInit();
    e.flags["s" + n + "_done"] = true;
    e.active = true;
    if (n > e.stufe) e.stufe = n;
    return "";
};

/* Ist Karla gerade verfügbar (Hubs, allgemeine Kap-2-Texte)? — Live-Check */
setup.karlaDa = function () {
    return State.variables.npc.karla.memory.flags.verhaftung_seen !== true;
};

/* Ermittlungs-Modus, beim Auftakt eingefroren — für ALLE Ermittlungs-Texte */
setup.ermMit = function () {
    var e = State.variables.world.ermittlung;
    return !!e && e.flags.modus === "mit";
};

