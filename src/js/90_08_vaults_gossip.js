
/* ================================================================
   SECTION 12  TEXT-VAULTS KAPITEL 1
   ================================================================ */

/* --- TrainingsHub --- */
setup.loadTrainingsHubVault = function () {
    if (!setup.trainingsHubTextVault) {
        setup.trainingsHubTextVault = JSON.parse(Story.get("TrainingsHubTexte").text);
    }
};

setup.executeStationRewards = function (stationKey, stationType) {
    var vault = setup.trainingsHubTextVault;
    if (!vault) return "Fehler: TrainingsHub-Daten wurden in StoryInit nicht geladen.";

    var stationData = vault.stations && vault.stations[stationKey] ? vault.stations[stationKey] : null;
    if (!stationData) return "Fehler: Station [" + stationKey + "] nicht gefunden.";

    var rewardAlerts = "";

    // --- AUTOMATISCHE BELOHNUNGS-VERARBEITUNG ---
    // Wir triggern die Wertevergabe nur bei "scenery" (dem ersten Aufruf der Passage)
    if (stationType === "scenery" && stationData.rewards) {
        var r = stationData.rewards;

        // 1. Stat-Box direkt von deiner Funktion abfangen
        var statFeedback = setup.setPlayerStat(r.stat, r.statValue);
        if (statFeedback) {
            rewardAlerts += "\n" + statFeedback;
        }

        // 2. Wissens-Box abfangen oder im exakt selben Stil generieren
        var knowledgeFeedback = setup.setPlayerKnowledge ? setup.setPlayerKnowledge(r.knowledge, r.knowledgeValue) : "";

        if (knowledgeFeedback) {
            rewardAlerts += "\n" + knowledgeFeedback;
        } else {
            // Fallback im exakt identischen Format, falls setPlayerKnowledge keinen String liefert
            var knowledgeNames = {
                pike: "Pikenkampf",
                cannon: "Artillerie",
                medicine: "Feldscherkunst",
                crossbow: "Armbrustschießen",
                thievery: "Diebeskunst"
            };
            var displayKnowledge = knowledgeNames[r.knowledge] || r.knowledge;
            rewardAlerts += '\n<div class="system-alert status-positive">Wissen (' + displayKnowledge + ') erhöht</div>';
        }

        // Aktivität im Player-Objekt speichern
        State.variables.player.chosen_activity = r.knowledge;
        State.variables.world.wasPracticing = true;
    }

    // --- SZENERIE-POOL (Levelunabhängig) ---
    if (stationType === "scenery") {
        var pool = stationData.scenery;
        if (!pool || pool.length === 0) return "";

        // Hängt die reinen HTML-Boxen direkt per Zeilenumbruch an den Text an
        return pool[Math.floor(Math.random() * pool.length)] + rewardAlerts;
    }

    // --- AUTOMATISCHE LEVEL-ERMITTLUNG ---
    var playerObj = State.variables.player;
    var currentSkill = 0;

    if (playerObj && playerObj.knowledge && playerObj.knowledge[stationKey] !== undefined) {
        currentSkill = playerObj.knowledge[stationKey];
    }

    // Stufen-Einteilung
    var levelBracket = "novice"; // Unter Level 4
    if (currentSkill >= 4 && currentSkill <= 7) {
        levelBracket = "medium";
    } else if (currentSkill > 7) {
        levelBracket = "expert";
    }

    // --- TEXT-AUSGABE NACH STUFE ---
    var textPool = stationData[stationType] ? stationData[stationType][levelBracket] : null;

    if (!textPool || textPool.length === 0) {
        return "Fehler: Text-Pool für [" + stationType + "] im Level [" + levelBracket + "] nicht gefunden.";
    }

    return textPool[Math.floor(Math.random() * textPool.length)];
};

// Beibehalten für direkte/alte Hub-Abrufe falls nötig
setup.getRandomText = function (category, subKey, stationType) {
    var vault = setup.trainingsHubTextVault;
    if (!vault) return "Fehler: TrainingsHub-Daten wurden in StoryInit nicht geladen.";

    if (stationType) {
        return setup.executeStationRewards(subKey, stationType);
    }

    if (subKey) {
        var subPool = vault[category] ? vault[category][subKey] : null;
        if (!subPool || subPool.length === 0) return "Fehler: Unterkategorie [" + subKey + "] nicht gefunden.";
        return subPool[Math.floor(Math.random() * subPool.length)];
    }

    var pool = vault[category];
    if (!pool || pool.length === 0) return "Fehler: Kategorie [" + category + "] nicht gefunden.";
    return pool[Math.floor(Math.random() * pool.length)];
};

/* --- Abendappell --- */
setup.abendappellTextVault = null;

setup.loadAbendappellVault = function () {
    if (!setup.abendappellTextVault) {
        setup.abendappellTextVault = JSON.parse(Story.get("AbendappellTexte").text);
    }
};

setup.getAbendappellText = function (category) {
    setup.loadAbendappellVault();

    var vault = setup.abendappellTextVault;
    if (!vault || !vault[category]) {
        return "Fehler: Abendappell-Kategorie [" + category + "] nicht gefunden.";
    }

    var day = State.variables.world ? State.variables.world.day : 1;
    var activity = State.variables.player ? State.variables.player.chosen_activity : "";

    var pool = vault[category];

    var contextMatches = pool.filter(function (entry) {
        var ctx = entry.context || {};
        if (ctx.minDay !== undefined && day < ctx.minDay) return false;
        if (ctx.maxDay !== undefined && day > ctx.maxDay) return false;
        if (ctx.activity !== undefined) return ctx.activity === activity;
        return false;
    });

    var genericPool = pool.filter(function (entry) {
        var ctx = entry.context || {};
        if (ctx.minDay !== undefined && day < ctx.minDay) return false;
        if (ctx.maxDay !== undefined && day > ctx.maxDay) return false;
        if (ctx.activity !== undefined) return false;
        return true;
    });

    var finalPool = contextMatches.length > 0 ? contextMatches : genericPool;
    if (finalPool.length === 0) finalPool = pool;

    var pick = finalPool[Math.floor(Math.random() * finalPool.length)];
    return pick ? pick.text : "";
};

/* --- Der nächste Tag (Kapitel 1) --- */
setup.naechsterTagTextVault = null;

setup.loadNaechsterTagVault = function () {
    if (!setup.naechsterTagTextVault) {
        setup.naechsterTagTextVault = JSON.parse(Story.get("Kap1_Der_naechste_Tag_Texte").text);
    }
};

setup.getNaechsterTagText = function (category) {
    setup.loadNaechsterTagVault();

    var vault = setup.naechsterTagTextVault;
    if (!vault || !vault[category]) {
        return "";
    }

    var day = State.variables.world ? State.variables.world.day : 1;
    var weather = State.variables.world ? State.variables.world.weather : "";
    var activity = State.variables.player ? State.variables.player.chosen_activity : "";

    var pool = vault[category];

    // luigi_schatten: nur selten, ca. 25% Chance, und nur wenn Kontext passt
    if (category === "luigi_schatten") {
        var luigiPool = pool.filter(function (entry) {
            var ctx = entry.context || {};
            if (!ctx.luigi_chance) return false;
            if (ctx.minDay !== undefined && day < ctx.minDay) return false;
            if (ctx.maxDay !== undefined && day > ctx.maxDay) return false;
            return true;
        });

        // 25% Chance, einen Luigi-Moment anzuzeigen
        if (luigiPool.length > 0 && Math.random() < 0.25) {
            var pick = luigiPool[Math.floor(Math.random() * luigiPool.length)];
            return pick ? pick.text : "";
        }
        return ""; // meistens: kein Luigi-Moment
    }

    // Für alle anderen Kategorien: Kontext-Match bevorzugen
    var contextMatches = pool.filter(function (entry) {
        var ctx = entry.context || {};
        if (ctx.luigi_chance) return false; // luigi-Einträge nur über eigenen Zweig
        if (ctx.minDay !== undefined && day < ctx.minDay) return false;
        if (ctx.maxDay !== undefined && day > ctx.maxDay) return false;

        // Wetter-Match (nur wenn weather im context angegeben)
        if (ctx.weather !== undefined) return ctx.weather === weather;

        // Aktivitäts-Match (nur wenn activity im context angegeben)
        if (ctx.activity !== undefined) return ctx.activity === activity;

        return false; // kein generischer Treffer über diesen Pfad
    });

    var genericPool = pool.filter(function (entry) {
        var ctx = entry.context || {};
        if (ctx.luigi_chance) return false;
        if (ctx.minDay !== undefined && day < ctx.minDay) return false;
        if (ctx.maxDay !== undefined && day > ctx.maxDay) return false;
        if (ctx.weather !== undefined) return false;
        if (ctx.activity !== undefined) return false;
        return true;
    });

    var finalPool = contextMatches.length > 0 ? contextMatches : genericPool;
    if (finalPool.length === 0) finalPool = pool.filter(function (e) { return !e.context || !e.context.luigi_chance; });

    var pick = finalPool[Math.floor(Math.random() * finalPool.length)];
    return pick ? pick.text : "";
};


/* ================================================================
   SECTION 13  GOSSIP-SYSTEM
   ================================================================ */

// Vault laden
setup.gossipTextVault = null;

setup.loadGossipVault = function () {
    if (!setup.gossipTextVault) {
        setup.gossipTextVault = JSON.parse(
            Story.get("GossipTexte").text
        );
    }
};

/* --- Tracking --- */
setup.markGossipSeen = function (storyId, success = false) {
    if (!State.variables.world.seenGossip) {
        State.variables.world.seenGossip = {};
    }
    const existing = State.variables.world.seenGossip[storyId];
    if (existing) {
        existing.success = success;
    } else {
        State.variables.world.seenGossip[storyId] = {
            id: storyId,
            success: success
        };
    }
};

setup.hasSeenGossip = function (storyId) {
    const seen = State.variables.world.seenGossip || {};
    return Object.prototype.hasOwnProperty.call(seen, storyId);
};

setup.wasGossipSuccessful = function (storyId) {
    const seen = State.variables.world.seenGossip || {};
    const entry = seen[storyId];
    return entry ? entry.success === true : false;
};

/* --- Hilfsfunktion --- */
setup.getAllGossipStories = function () {
    setup.loadGossipVault();
    const vault = setup.gossipTextVault;
    if (!vault || !vault.stories) {
        return [];
    }
    return [
        ...(vault.stories.lagerklatsch || []),
        ...(vault.stories.landesinfos || []),
        ...(vault.stories.knaller || [])
    ];
};

/* --- Neue Geschichten --- */
setup.getGossipStory = function () {
    const gossipLevel = State.variables.player.knowledge.gossip || 0;
    const allStories = setup.getAllGossipStories();
    const seen = State.variables.world.seenGossip || {};


    /*
    Altes System
    const available = allStories.filter(function (story) {
        if (Object.prototype.hasOwnProperty.call(seen, story.id)) {
            return false;
        }
        if (gossipLevel < story.minLevel) {
            return false;
        }
        if (gossipLevel > story.maxLevel) {
            return false;
        }
        return true;
    });*/

    const available = allStories.filter(function (story) {
        if (Object.prototype.hasOwnProperty.call(seen, story.id)) return false;
        var diff = (story.probe && typeof story.probe.difficulty === "number")
            ? story.probe.difficulty : 0;
        return diff - gossipLevel <= 3;   // max. 3 über dem Gossip-Level, keine Obergrenze
    });

    if (available.length === 0) {
        return null;
    }

    return available[Math.floor(Math.random() * available.length)];
};

/* --- Fehlgeschlagene Geschichten --- */
setup.getFailedGossipStory = function () {
    const gossipLevel = State.variables.player.knowledge.gossip || 0;
    const allStories = setup.getAllGossipStories();
    const seen = State.variables.world.seenGossip || {};

    const failed = allStories.filter(function (story) {
    const entry = seen[story.id];
    if (!entry) return false;
    if (entry.success === true) return false;
    var diff = (story.probe && typeof story.probe.difficulty === "number")
        ? story.probe.difficulty : 0;
    return diff - gossipLevel <= 3;
});


    if (failed.length === 0) {
        return null;
    }

    return failed[Math.floor(Math.random() * failed.length)];
};

/* --- Probe berechnen --- */
setup.rollGossipProbe = function (skill, difficulty) {
    if (difficulty === 0) return true;

    const dice = Math.floor(Math.random() * 10) + 1;

    // Einsteigerbonus: skill 1-2 hat immer mindestens 80% Chance
    if (skill >= 1 && skill < 3) {
        return dice <= 8; // 8 von 10 = 80%
    }

    return dice + skill >= difficulty + 5;
};

setup.getProbeThoughtText = function (skill, difficulty) {
    const vorsprung = skill - difficulty;

    if (skill < difficulty - 2) return null; // kein Link

    if (vorsprung >= 4) return "Du kennst diese Sorte Gespräch. Der Typ will reden — er braucht nur den richtigen Moment. Den kannst du ihm geben.";
    if (vorsprung >= 2) return "Da ist noch was. Du bist dir nicht sicher ob er redet, aber die Chance ist da. Die Frage ist wie du fragst.";
    return "Vielleicht steckt mehr dahinter. Vielleicht auch nicht. Nachhaken könnte klappen — oder den Abend beenden.";
};

/* --- Probe geschafft: Gedankenbox --- */
setup.getSuccessThought = function (skill, difficulty) {
    const texts = {
        1: "Du weißt nicht genau was du richtig gemacht hast. Aber es hat funktioniert.",
        3: "Die Stimmen um euch herum werden lauter. Oder ihr werdet leiser. Schwer zu sagen. Er redet jedenfalls.",
        5: "Da ist es. Der Moment wo jemand aufhört abzuwägen ob er redet — und einfach redet.",
        7: "Der Mann lehnt sich vor. Kaum merklich — aber es ist da. Du hast den richtigen Nerv getroffen.",
        9: "Du hast es nicht mal wirklich versucht. Und trotzdem redet er."
    };

    const thresholds = Object.keys(texts)
        .map(Number)
        .sort((a, b) => a - b);

    let result = texts[thresholds[0]];

    for (const threshold of thresholds) {
        if (skill >= threshold) {
            result = texts[threshold];
        }
    }

    return '<div class="thought-box">' + result + '</div>';
};
