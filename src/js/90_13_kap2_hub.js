
/* ================================================================
   SECTION 18  KAPITEL 2 — TAGESHUB, STORYLETS & TEXTPOOLS
   ================================================================ */

setup.getKap2NaechsterTagText = function (key) {
    const passageName = "kap2_texte_" + key; // z.B. "kap2_texte_morgen"
    if (!Story.has(passageName)) {
        console.warn("Pool-Passage nicht gefunden:", passageName);
        return "";
    }
    const pool = JSON.parse(Story.get(passageName).text);
    const weather = State.variables.world.weather;
    const k = State.variables.player.condition;
    const day = State.variables.world.day;
    var candidates = pool;

    if (key == "morgen") {
        // Erst nach passendem Wetter filtern, sonst kontextfreie Einträge nehmen
        candidates = pool.filter(entry => entry.context && entry.context.weather === weather);
        if (candidates.length === 0) {
            candidates = pool.filter(entry => !entry.context || Object.keys(entry.context).length === 0);
        }
        if (candidates.length === 0) candidates = pool; // Fallback
    }
    else if (key == "koerper") {
        let tier;

        if (k >= 90) tier = "bestform";
        else if (k >= 70) tier = "fit";
        else if (k >= 50) tier = "angeschlagen";
        else if (k >= 30) tier = "erschoepft";
        else if (k >= 10) tier = "amlimit";
        else tier = "zusammenbruch";

        candidates = pool.filter(entry => entry.context && entry.context.condition === tier);
        if (candidates.length === 0) {
            candidates = pool.filter(entry => !entry.context || Object.keys(entry.context).length === 0);
        }
        if (candidates.length === 0) candidates = pool; // Fallback
    }
    else if (key == "gedanke") {
        candidates = pool.filter(entry => {
            const c = entry.context || {};
            if (c.minDay !== undefined && day < c.minDay) return false;
            if (c.maxDay !== undefined && day > c.maxDay) return false;
            return true;
        });
    }
    else {
        return "";
    }

    /* BUGFIX: Crash bei leerem Kandidaten-Pool abfangen */
    if (!candidates || candidates.length === 0) return "";

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    return (chosen && chosen.text) ? chosen.text : "";
};

/* --- Storylets für den Kap2-Tageshub ---
   BUGFIX: Syntaxfehler behoben (fehlende schließende Klammer bei gattungsdrill)
   + doppelten karla_zeit-Eintrag entfernt */
setup.kap2Storylets = [
    {
        id: "rindler_besuch",
        text: "Sich beim Hauptmann Rindler blicken lassen",
        target: "Tageshub_Rindler",
        available: function () {
            // Rindler hat laut Dienstplan nicht jeden Tag Zeit
            return State.variables.world.day % 2 === 0
                && State.variables.npc.hauptmann.affection > -5; // bei zu starker Ablehnung meidet er einen
        }
    },
    {
        id: "halm_besuch",
        text: "Beim Magister Halm vorsprechen",
        target: "Tageshub_Halm",
        available: function () {
            // Halm hält nur an bestimmten Tagen Sprechstunde
            return [1, 4].includes(State.variables.world.day % 7)
                && State.variables.npc.magister.affection > -10; // bei Feindseligkeit verweigert er komplett
        }
    },
    {
        id: "stadt_besuch",
        text: "In die Stadt gehen",
        target: "Tageshub_Stadt",
        available: function () { return true; }
    },
    {
        id: "buch_pruefen",
        text: "Das Ausgabebuch der Waffenstube erneut prüfen",
        target: "Ermittlung_S8_Zugang",
        available: function () {
            var e = State.variables.world.ermittlung;
            if (!e) return false;
            return e.spuren.includes("nachtfuhre")
                && !e.flags.s8_done
                && ((e.verdacht && e.verdacht.orenmalk) || 0) < 6;
    }
    },
    {
        id: "karla_zeit",
        text: "Zeit mit Karla verbringen",
        target: "Tageshub_Karla",
        available: function () {
            return State.variables.npc.karla.memory.flags.verhaftung_seen !== true
                && State.variables.npc.karla.affection >= 10
                && State.variables.world.karla_zeit_tag !== State.variables.world.day;
        }
    },
    {
        id: "nachtfuhre",
        text: "Die nächste Nachtfuhre abpassen",
        target: "Ermittlung_S9_Nachtfuhre",
        available: function () {
            var e = State.variables.world.ermittlung;
            if (!e || !e.flags.s8_done || e.flags.s9_done) return false;
            return State.variables.world.day >= e.flags.naechste_fuhre_tag;
        }
  	},
  	{
        id: "s10_finale",
        text: "Rindler die Beweise vorlegen",
        target: "Ermittlung_S10_Rindler",
        available: function () {
            var e = State.variables.world.ermittlung;
            return !!(e && e.flags.s9_done && !e.flags.s10_done);
        }
    },
    {
        id: "gattungsdrill",
        text: "Zum Gattungsdrill antreten",
        target: "Kap2_Gattungsdrill",
        available: function () {
            return State.variables.player.condition >= 20;
        }
    }
];

/* --- Abend-Storylets für Kap2_Abend (eine Aktion pro Abend) --- */
setup.kap2AbendStorylets = [
    {
        id: "abend_schenke",
        text: "In die Schenke gehen",
        target: "Kap2_Abend_Schenke",
        available: function () { return true; }
    },
    {
        id: "abend_lesen",
        text: "Bei Kerzenlicht lesen",
        target: "Kap2_Abend_Lesen",
        available: function () { return true; }
    },
    {
        id: "abend_pflege",
        text: "Waffen und Zeug pflegen",
        target: "Kap2_Abend_Waffenpflege",
        available: function () {
            return State.variables.world.gut_vorbereitet !== true;
        }
    },
    {
        id: "abend_karla",
        text: "Karla auf der Mauer treffen",
        target: "Kap2_Abend_Karla",
        available: function () {
            return State.variables.npc.karla.memory.flags.verhaftung_seen !== true
                && setup.romanzeStufe() >= 1;
        }
    }
];

/* --- NPC-Interaktions-Pools (JSON-Passagen mit requires/outcome) --- */
setup.applyOutcome = function (outcome) {
    if (!outcome || !outcome.fields || !outcome.fields.length) return "";
    let out = "";
    outcome.fields.forEach(function (f) {
        if (!f.chance) return;
        const roll = Math.floor(Math.random() * 100) + 1;
        if (roll > f.chance) return;
        console.log("applyOutcome", JSON.stringify(outcome));
        switch (f.field) {
            case "affection":
                out += setup.setNpcAffection(outcome.npc, f.value);
                break;
            case "verdacht":
                out += setup.setNpcsuspicion(outcome.npc, f.value);
                break;
            case "condition":
                State.variables.player.condition = setup.clamp(
                    State.variables.player.condition + f.value, 0, 100);
                out += '<div class="system-alert status-info">Kondition verändert (' + f.value + ')</div>';
                break;
            case "trust":
                State.variables.npc[outcome.npc].trust = f.value;
                break;
            case "known":
                State.variables.npc[outcome.npc].known = f.value;
                break;
            case "money":
                out += (f.value >= 0) ? setup.addMoney(f.value) : setup.removeMoney(Math.abs(f.value));
                break;
            case "moneyLoss":
                out += setup.loseMoney(f.value);
                break;
            default:
                console.warn("Unbekanntes outcome-Feld:", f.field);
        }
    });
    return out;
};

setup.getNpcInteraction = function (poolName) {
    if (!Story.has(poolName)) {
        console.warn("Pool-Passage nicht gefunden:", poolName);
        return "";
    }
    const pool = JSON.parse(Story.get(poolName).text);

    const eligible = pool.filter(entry => {
        if (!entry.requires) return true;
        return setup.checkRequirement(entry.requires);
    });

    /* BUGFIX: Crash bei leerem eligible-Pool abfangen */
    if (eligible.length === 0) return "";

    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    let out = "<p>" + chosen.text + "</p>";

    if (chosen.checkOn != null) {
        var result = setup.skillCheckXp(chosen.checkOn, 15, 0);

        out += result.lernHTML;
        out += '\n'
        if (result.outcome === "success" || result.outcome === "crit") {
            out += setup.applyOutcome(chosen.checkSuccessText); 
        }
        else {
            if (chosen.outcome) out += setup.applyOutcome(chosen.outcome);
        }


    } else {
        if (chosen.outcome) out += setup.applyOutcome(chosen.outcome);
    }

    

    return out;
};

setup.checkRequirement = function (req) {
    if (req.flag === "schande" && State.variables.world.flags.jarek_ausgang !== "schande") return false;
    if (req.minAffection !== undefined || req.maxAffection !== undefined) {
        const a = State.variables.npc[req.npc].affection;
        if (req.minAffection !== undefined && a < req.minAffection) return false;
        if (req.maxAffection !== undefined && a > req.maxAffection) return false;
    }
    if (req.notFlag) {
        const f = State.variables.npc[req.npc].memory.flags;
        if (f[req.notFlag] === true) return false;
    }
    return true;
};
