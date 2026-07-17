
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
    var w = State.variables.world;
    if(w.flags.doneFirstWeeks === true){
        var d = Math.max(1, State.variables.world.day +21);
    }       
    else{
        var d = Math.max(1, State.variables.world.day);
    }
    var jahr = Math.floor((d - 1) / 365) + 1;
    var tagImJahr = ((d - 1) % 365) + 1;
    var woche = Math.ceil(tagImJahr / 3);   // +1 alle 3 Tage
    var wtag = setup.wochentage[d % 7];
    return jahr + ". Jahr · Woche " + woche + " · " + wtag;
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

setup.debugDuellSetzen = function (variante) {
    var V = State.variables;
    if (!V.world.duell) V.world.duell = { flags: {}, wissen: {} };
    if (!V.world.duell.flags) V.world.duell.flags = {};
    var d = V.world.duell;
    d.done = true;
    d.ende_tag = V.world.day;
    d.flags.verrat = false; d.flags.bronko_tot = false; d.flags.pavel_tot = false;
    var mem = "";
    switch (variante) {
        case "A_versoehnt": d.tier = "A"; d.outcome = "A_versoehnt";     mem = "Fehde unblutig beendet"; break;
        case "A_kuehl":     d.tier = "A"; d.outcome = "A_kuehl";         mem = "Fehde unblutig beendet"; break;
        case "B":           d.tier = "B"; d.outcome = "B_bronko_reue";   mem = "Fehde ohne Tote"; break;
        case "verrat":      d.tier = "B"; d.outcome = "B_pavel_verrat";  d.flags.verrat = true; mem = "Hat Zdenka verraten"; break;
        case "C_bronko":    d.tier = "C"; d.outcome = "C"; d.flags.bronko_tot = true; mem = "Fehde mit Totem"; break;
        case "C_pavel":     d.tier = "C"; d.outcome = "C"; d.flags.pavel_tot = true; mem = "Fehde mit Totem"; break;
    }
    if (mem) setup.pushNpcMemory("karla", mem);
    return '<div class="system-alert status-info">Duell: ' + variante + (mem ? ' (+Karla-Memory: „' + mem + '“)' : '') + '</div>';
};