
/* ================================================================
   SECTION 21  DEBUG & LOGGING
   ================================================================
   - Loggt JEDEN Passagenbesuch automatisch
   - Loggt JEDEN Klick auf einen Story-Link (SugarCube [[...]] / <<link>>)
   - Kein manueller Eingriff in bestehenden Passagen-Code nötig
   - Speichert in $world.decisionLog (persistiert im Save)
   - Unbegrenztes Wachstum, kein Auto-Cleanup (bewusst)
   ================================================================ */

/* --- Sicherstellen, dass das Log existiert --- */
setup.ensureDecisionLog = function () {
    if (!Array.isArray(State.variables.world.decisionLog)) {
        State.variables.world.decisionLog = [];
    }
};

/* --- Internen Log-Eintrag schreiben --- */
setup.pushLogEntry = function (entry) {
    setup.ensureDecisionLog();
    entry.day = State.variables.world.day;
    entry.timestamp = new Date().toISOString();
    State.variables.world.decisionLog.push(entry);
};

/* 1) Automatisches Passagen-Tracking */
$(document).on(":passagestart", function (ev) {
    setup.pushLogEntry({
        type: "visit",
        passage: ev.passage.title,
        choice: null
    });
});

/* 2) Automatisches Klick-Tracking */
$(document).on("click", "a.link-internal", function (ev) {
    var $el = $(this);
    var label = $el.text().trim();

    // Zielpassage ermitteln, falls vorhanden (bei <<link>> ohne Ziel oft leer/undefined)
    var target = $el.attr("data-passage") || null;

    setup.pushLogEntry({
        type: "click",
        passage: State.passage,   // Passage, IN der geklickt wurde
        target: target,           // Zielpassage, falls bekannt (kann null sein)
        choice: label || "(ohne Text)"
    });
});

/* 3) Konsolen-Ausgabe */
setup.printDecisionLog = function (filterDay) {
    setup.ensureDecisionLog();
    var log = State.variables.world.decisionLog;
    var data = filterDay != null ? log.filter(e => e.day === filterDay) : log;

    if (data.length === 0) {
        console.log("Kein Log vorhanden" + (filterDay != null ? " für Tag " + filterDay : "") + ".");
        return;
    }

    console.table(data.map(function (e, i) {
        return {
            "#": i,
            Tag: e.day,
            Typ: e.type,
            Passage: e.passage,
            Ziel: e.target || "",
            Entscheidung: e.choice || "",
            Zeit: e.timestamp
        };
    }));
};

setup.printClicksOnly = function (filterDay) {
    setup.ensureDecisionLog();
    var log = State.variables.world.decisionLog.filter(e => e.type === "click");
    var data = filterDay != null ? log.filter(e => e.day === filterDay) : log;

    if (data.length === 0) {
        console.log("Keine Klicks geloggt" + (filterDay != null ? " für Tag " + filterDay : "") + ".");
        return;
    }

    console.table(data.map(function (e, i) {
        return { "#": i, Tag: e.day, Passage: e.passage, Ziel: e.target || "", Entscheidung: e.choice, Zeit: e.timestamp };
    }));
};

setup.printVisitsOnly = function (filterDay) {
    setup.ensureDecisionLog();
    var log = State.variables.world.decisionLog.filter(e => e.type === "visit");
    var data = filterDay != null ? log.filter(e => e.day === filterDay) : log;

    if (data.length === 0) {
        console.log("Keine Besuche geloggt" + (filterDay != null ? " für Tag " + filterDay : "") + ".");
        return;
    }

    console.table(data.map(function (e, i) {
        return { "#": i, Tag: e.day, Passage: e.passage, Zeit: e.timestamp };
    }));
};

setup.printLogForPassagePrefix = function (prefix) {
    setup.ensureDecisionLog();
    var log = State.variables.world.decisionLog.filter(e => e.passage && e.passage.indexOf(prefix) === 0);

    if (log.length === 0) {
        console.log("Keine Einträge für Passagen-Präfix '" + prefix + "'.");
        return;
    }

    console.table(log.map(function (e, i) {
        return {
            "#": i,
            Tag: e.day,
            Typ: e.type,
            Passage: e.passage,
            Ziel: e.target || "",
            Entscheidung: e.choice || "",
            Zeit: e.timestamp
        };
    }));
};

setup.dumpDecisionLog = function () {
    setup.ensureDecisionLog();
    console.log(JSON.stringify(State.variables.world.decisionLog, null, 2));
};

setup.clearDecisionLog = function () {
    State.variables.world.decisionLog = [];
    console.log("Decision-Log geleert.");
};


/* Diegetische Datumsanzeige statt nackter Tageszahl */
setup.wochentage = ["Manda", "Irda", "Migga", "Pfinsta", "Freida", "Samsda", "Sunda"];


setup.datumAnzeige = function () {
    var d = Math.max(1, State.variables.world.day);
    var jahr = Math.floor((d - 1) / 365) + 1;
    var tagImJahr = ((d - 1) % 365) + 1;
    var woche = Math.ceil(tagImJahr / 3);   // +1 alle 3 Tage
    var wtag = setup.wochentage[d % 7];
    return jahr + ". Jahr · Woche " + woche + " · " + wtag;
};

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

setup.hatBelastendes = function () {
    var e = State.variables.world.ermittlung;
    if (!e || !e.spuren) return false;
    var belastend = ["fuhre_dokumentiert", "fuhren_muster", "westhof_krebs", "westhof_ladung"];
    return belastend.some(function (id) { return e.spuren.indexOf(id) !== -1; });
};

setup.beweiskraft = function () {
    var e = State.variables.world.ermittlung;
    if (!e || !e.spuren) return 0;
    var relevant = ["fuhren_muster", "westhof_krebs", "westhof_ladung",
                    "fuhrmann_hinweis", "fuhre_dokumentiert", "fuhre_detail", "familia_geruecht"];
    return relevant.filter(function (id) { return e.spuren.indexOf(id) !== -1; }).length;
};

setup.ermFallStaerke = function () {
    var e = State.variables.world.ermittlung;
    if (e && e.flags && e.flags.beweis_stark) return "stark";
    if (setup.beweiskraft() >= 4) return "indizien";
    return "duenn";
};

/* ===========================
   DEV LOGIN
   =========================== */

setup.dev = {

    // <-- Hier deinen SHA-256 Hash eintragen
    hash: "DEIN_HASH_HIER",

    async sha256(text) {

        const data = new TextEncoder().encode(text);

        const digest = await crypto.subtle.digest(
            "SHA-256",
            data
        );

        return [...new Uint8Array(digest)]
            .map(x => x.toString(16).padStart(2, "0"))
            .join("");

    },

    async login(password) {

        const hash = await this.sha256(password);

        if (hash === this.hash) {

            State.variables.devAccess = true;

            return true;
        }

        return false;
    },

    logout() {
        State.variables.devAccess = false;
    },

    openDialog() {

        Dialog.create("Developer Login");

        Dialog.append(`
            <div class="devLogin">

                <p>Developer Passwort</p>

                <input
                    id="devPassword"
                    type="password"
                    autocomplete="off"
                    style="width:100%;">

                <div id="devError"
                     style="color:#d44;margin-top:8px;"></div>

                <p style="margin-top:1em;text-align:right;">
                    <button id="devLoginButton">
                        Login
                    </button>
                </p>

            </div>
        `);

        Dialog.open();

        setTimeout(() => {

            $("#devPassword").trigger("focus");

            $("#devPassword").on("keydown", function(e){

                if(e.key === "Enter"){
                    $("#devLoginButton").click();
                }

            });

            $("#devLoginButton").on("click", async function(){

                const ok = await setup.dev.login(
                    $("#devPassword").val()
                );

                if(ok){

                    Dialog.close();

                    Engine.play("DEV");

                } else {

                    $("#devError").text("Falsches Passwort.");

                    $("#devPassword").val("").focus();

                }

            });

        },20);

    }

};

/* Konsole: setup.debugAlleGossipsBekannt() */
setup.debugAlleGossipsBekannt = function () {
    var stories = setup.getAllGossipStories();
    stories.forEach(function (s) {
        setup.markGossipSeen(s.id, true);      // gesehen + Probe bestanden
        if (s.rumorText) setup.addRumor(s.rumorText);   // Notizbuch-Eintrag
    });
    console.log("[debug] " + stories.length + " Gossips als bekannt gesetzt.");
    return stories.length + " Gossips als bekannt gesetzt.";
};

/* Konsole: setup.debugAlleNpcBekannt() */
setup.debugAlleNpcBekannt = function () {
    var npc = State.variables.npc, n = 0;
    for (var k in npc) {
        if (npc[k] && typeof npc[k] === "object" && "known" in npc[k]) {
            npc[k].known = true;
            n++;
        }
    }
    console.log("[debug] " + n + " NPC auf known gesetzt.");
    return n + " NPC auf known gesetzt.";
};