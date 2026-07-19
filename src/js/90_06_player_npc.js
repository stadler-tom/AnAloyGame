
/* ================================================================
   SECTION 09  PLAYER — WERTE, INVENTAR, GERÜCHTE
   ================================================================ */

setup.clamp = function (val, min, max) {
    return Math.max(min, Math.min(max, val));
};

// Einheitliches Alert-Rendering. Farbe richtet sich nach dem Vorzeichen.
setup.statusAlert = function (text, modifier) {
    if (modifier > 0) return '<div class="system-alert status-positive">' + text + '</div>';
    if (modifier < 0) return '<div class="system-alert status-negative">' + text + '</div>';
    return "";
};

setup.statNames = {
    mercy: "Gnade",
    ambition: "Ehrgeiz",
    honesty: "Ehrlichkeit",
    discipline: "Disziplin",
    faith: "Glaube"
};

setup.knowledgeNames = {
    scholarship: "Gelehrsamkeit",
    pike: "Pike & Hellebarde",
    crossbow: "Armbrust",
    cannon: "Artillerie",
    medicine: "Heilkunde",
    thievery: "Schattenarbeit",
    gossip: "Gerüchteküche",
    combat: "Kampferfahrung",
    gelehrsamkeitProbe: "Gelehrsamkeit",   /* temporäre Probe (Jarek_S4_Befugt) — nur Anzeigename */
    perception: "Wahrnehmung"
};

setup.reputationNames = {
    land: "Ruf beim Land",
    ohm: "Ruf in Ohm",
    church: "Ruf bei der Kirche"
};


setup.getKnowledgeLabel = function (knowledgeKey) {
    return setup.knowledgeNames[knowledgeKey] ?? knowledgeKey;
};


setup.setPlayerStat = function (statKey, modifier) {
    const player = State.variables.player;
    if (!player) { console.warn("Player nicht gefunden"); return ""; }
    if (!player.stats?.hasOwnProperty(statKey)) { console.warn("Stat existiert nicht:", statKey); return ""; }

    player.stats[statKey] = setup.clamp(player.stats[statKey] + modifier, 0, 100);

    const name = setup.statNames[statKey] || statKey;
    return setup.statusAlert(name + (modifier < 0 ? " verringert" : " erhöht"), modifier);
};

setup.setPlayerKnowledge = function (knowledgeKey, modifier) {
    const player = State.variables.player;
    if (!player) { console.warn("Player nicht gefunden"); return ""; }
    if (!player.knowledge?.hasOwnProperty(knowledgeKey)) { console.warn("Fähigkeit existiert nicht:", knowledgeKey); return ""; }

    // scholarship bleibt ungedeckelt (0–100), alle echten Skills bei 10
    const max = (knowledgeKey === "scholarship") ? 100 : 10;
    player.knowledge[knowledgeKey] = setup.clamp(player.knowledge[knowledgeKey] + modifier, 0, max);

    const name = setup.knowledgeNames[knowledgeKey] || knowledgeKey;
    return setup.statusAlert(name + (modifier < 0 ? " verringert" : " verbessert"), modifier);
};

setup.getPlayerKnowledge = function (knowledgeKey) {
    const player = State.variables.player;
    if (!player) { console.warn("Player nicht gefunden"); return ""; }
    if (!player.knowledge?.hasOwnProperty(knowledgeKey)) { console.warn("Fähigkeit existiert nicht:", knowledgeKey); return ""; }

    return player.knowledge[knowledgeKey];

}

setup.setPlayerReputation = function (repKey, modifier) {
    const player = State.variables.player;
    if (!player) { console.warn("Player nicht gefunden"); return ""; }
    if (!player.reputation?.hasOwnProperty(repKey)) { console.warn("Fraktion existiert nicht:", repKey); return ""; }

    player.reputation[repKey] = setup.clamp(player.reputation[repKey] + modifier, -100, 100);

    const name = setup.reputationNames[repKey] || repKey;
    return setup.statusAlert("Dein " + name + (modifier < 0 ? " ist gesunken" : " ist gestiegen"), modifier);
};

setup.setPlayerCondition = function (modifier) {
    const player = State.variables.player;
    if (!player || typeof player.condition !== "number") { console.warn("Kondition nicht gefunden"); return ""; }

    player.condition = setup.clamp(player.condition + modifier, 0, 100);

    const verb = modifier < 0 ? "verschlechtert" : "verbessert";
    const label = setup.getKonditionLabel(player.condition);
    return setup.statusAlert("Kondition " + verb + " (" + label + ")", modifier);
};

setup.setPlayerSuspicion = function (modifier) {
    const player = State.variables.player;
    if (!player || typeof player.suspicion !== "number") { console.warn("Verdacht nicht gefunden"); return ""; }

    player.suspicion = setup.clamp(player.suspicion + modifier, 0, 100);

    // Mehr Verdacht = schlecht -> Farbe gegen das Vorzeichen drehen
    if (modifier > 0) return '<div class="system-alert status-negative">Verdacht gegen dich gestiegen</div>';
    if (modifier < 0) return '<div class="system-alert status-positive">Verdacht gegen dich gesunken</div>';
    return "";
};

setup.setPlayerRel = function (npcKey, modifier) {
    const player = State.variables.player;
    if (!player || !player.rel) { console.warn("Beziehungen nicht gefunden"); return ""; }

    if (!player.rel.hasOwnProperty(npcKey)) player.rel[npcKey] = 0;  // Altstände heilen sich

    player.rel[npcKey] = setup.clamp(player.rel[npcKey] + modifier, -100, 100);

    const npc = State.variables.npc?.[npcKey];
    const name = (npc && npc.name) ? npc.name : npcKey;
    return setup.statusAlert("Verhältnis zu " + name + (modifier < 0 ? " verschlechtert" : " verbessert"), modifier);
};

/* player.rel für alle bekannten NPCs synchron halten */
setup.syncPlayerRel = function () {
    var V = State.variables;
    if (!V.player) return;
    if (!V.player.rel) V.player.rel = {};

    var rel = V.player.rel;
    var npcs = V.npc || {};   // dein initNPC füllt $npc – ggf. Namen anpassen

    Object.keys(npcs).forEach(function (key) {
        if (typeof rel[key] === "undefined") {
            rel[key] = 0;     // neutraler Startwert, bestehende Werte bleiben unangetastet
        }
    });
};



$(document).on(":passagestart", function () {
    setup.syncPlayerRel();
    setup.reconcileState();
    setup.migriereJarekBruch();
    setup.migriereEnttarnung();
    var known = State.variables.npc && State.variables.npc.sergeant && State.variables.npc.sergeant.known === true;
    jQuery("html").toggleClass("hat-titelbild", known);
});

/* --- Inventar --- */
setup.addItem = function (itemName) {
    const player = setup.ensurePlayerCombatData
        ? setup.ensurePlayerCombatData()
        : State.variables.player;
    if (!player) { console.warn("Player nicht gefunden"); return ""; }
    if (!player.inventory || !Array.isArray(player.inventory.items)) {
        console.warn("player.inventory.items nicht gefunden"); return "";
    }

    player.inventory.items.push(itemName);
    return '<div class="system-alert status-positive">Gegenstand erhalten: ' + itemName + '</div>';
};

setup.hasItem = function (itemName) {
    const player = State.variables.player;
    if (!player || !player.inventory || !Array.isArray(player.inventory.items)) return false;

    return player.inventory.items.includes(itemName);
};

setup.removeItem = function (itemName) {
    var inv = State.variables.player.inventory;
    if (!inv || !Array.isArray(inv.items)) return false;
    var i = inv.items.indexOf(itemName);
    if (i === -1) return false;
    inv.items.splice(i, 1);
    return true;
};

/* --- Gerüchte --- */
setup.renderRumors = function () {
    var p = State.variables.player;
    var rumors = p.rumors || [];
    if (rumors.length === 0) return "Noch keine Gerüchte notiert.";

    // rumorText -> Story-id, um die Kategorie aus dem Präfix zu ziehen
    var textZuId = {};
    (setup.getAllGossipStories ? setup.getAllGossipStories() : []).forEach(function (s) {
        if (s && s.rumorText) textZuId[s.rumorText] = s.id;
    });
    var catMap = p.rumorCat || {};      // Fallback für Nicht-Gossip-Gerüchte (z.B. Straßennews)
    var gueltig = setup.rumorKategorien.map(function (k) { return k.id; });

    var groups = {};
    rumors.forEach(function (text) {
        var cat = setup.rumorKatAusId(textZuId[text]) || catMap[text] || "sonstige";
        if (gueltig.indexOf(cat) === -1) cat = "sonstige";
        (groups[cat] = groups[cat] || []).push(text);
    });

    var out = "";
    setup.rumorKategorien.forEach(function (k) {
        var list = groups[k.id];
        if (!list || !list.length) return;
        out += '<div class="rumor-cat"><div class="rumor-cat-titel">' + k.label + '</div>';
        list.forEach(function (text) { out += '<div class="rumor-eintrag">' + text + '</div>'; });
        out += '</div>';

    });
    return out;
};

setup.addRumor = function (rumorText) {
    const player = State.variables.player;
    if (!player || !Array.isArray(player.rumors)) return "";

    if (!player.rumors.includes(rumorText)) {
        player.rumors.push(rumorText);
        return '<div class="system-alert status-info">Neues Gerücht im Notizbuch vermerkt.</div>';
    }
    return "";
};


setup.rumorKategorien = [
    { id: "lagerklatsch", label: "🍺 Lagerklatsch" },
    { id: "landesinfo",   label: "🗺️ Landesinfos" },
    { id: "knaller",      label: "💥 Knaller" },
    { id: "sonstige",     label: "📎 Sonstiges" }
];

setup.rumorKatAusId = function (id) {
    if (!id) return null;
    var pre = String(id).slice(0, 3).toLowerCase();   // "lk_", "li_", "kn_"
    if (pre === "lk_") return "lagerklatsch";
    if (pre === "li_") return "landesinfo";
    if (pre === "kn_") return "knaller";
    return null;
};

setup.getRumor = function (rumorText) {
    const player = State.variables.player;
    if (!player || !Array.isArray(player.rumors)) return "";

    if (player.rumors.includes(rumorText)) {
        return {hasRumor: true, text: rumorText};
    }
    return {hasRumor: false, text: ""};
};

/* --- Labels --- */
setup.getKonditionLabel = function (k) {
    if (k >= 90) return "💪 Bestform";
    if (k >= 70) return "🟢 Fit";
    if (k >= 50) return "🟡 Angeschlagen";
    if (k >= 30) return "🟠 Erschöpft";
    if (k >= 10) return "🔴 Am Limit";
    return "💀 Zusammenbruch";
};

setup.getReputationLabel = function (r) {
    r = Number(r) || 0;
    if (r >= 8) return "★ Hochgeschätzt";
    if (r >= 4) return "✦ Angesehen";
    if (r >= 1) return "✚ Wohlgelitten";
    if (r <= -8) return "✖ Verfemt";
    if (r <= -1) return "▽ Beargwöhnt";
    return "○ Unbeschrieben";
};

setup.getAffectionLabel = function (a) {
    a = Number(a) || 0;
    if (a >= 16) return "❤️ Enge Bindung";
    if (a >= 10) return "💛 Vertraut";
    if (a >= 5) return "🙂 Wohlgesonnen";
    if (a >= 1) return "🔹 Bekannt";
    if (a <= -10) return "💢 Feindselig";
    if (a <= -5) return "😠 Ablehnend";
    if (a <= -1) return "❄️ Distanziert";
    return "➖ Neutral";
};



/* ================================================================
   SECTION 10  NPC — ZUNEIGUNG, MEMORY, VERDACHT
   ================================================================ */

setup.setNpcAffection = function (npcKey, modifier) {
    const npc = State.variables.npc?.[npcKey];
    if (!npc) { console.warn("NPC nicht gefunden:", npcKey); return ""; }

    npc.affection = setup.clamp(npc.affection + modifier, -20, 20);

    return setup.statusAlert("Zuneigung von " + npc.name + (modifier < 0 ? " verringert" : " erhöht"), modifier);
};

setup.pushNpcMemory = function (npcKey, event) {
    const npc = State.variables.npc?.[npcKey];
    if (!npc?.memory || !Array.isArray(npc.memory.events)) return "";

    npc.memory.events.push(event);
    return '<div class="system-alert status-info">' + npc.name + ' wird sich das merken</div>';
};

setup.hasNpcMemory = function (npcKey, event) {
    const npc = State.variables.npc?.[npcKey];
    if (!npc?.memory || !Array.isArray(npc.memory.events)) return false;

    return npc.memory.events.includes(event);
};

setup.removeNpcMemory = function (npcKey, event) {
    const npc = State.variables.npc?.[npcKey];
    if (!npc?.memory || !Array.isArray(npc.memory.events)) return false;

    const i = npc.memory.events.indexOf(event);
    if (i === -1) return false;
    npc.memory.events.splice(i, 1);
    return true;
};


setup.setNpcsuspicion = function (npcKey, modifier) {
    const npc = State.variables.npc?.[npcKey];
    if (!npc) { console.warn("NPC nicht gefunden:", npcKey); return ""; }

    /* BUGFIX: legt $world.ermittlung bei Bedarf an, statt zu crashen */
    const investigation = setup.ermInit();

    if (!investigation.verdacht[npcKey]) investigation.verdacht[npcKey] = 0;
    investigation.verdacht[npcKey] = setup.clamp(investigation.verdacht[npcKey] + modifier, -10, 10);

    if (modifier > 0) {
        return '<div class="verdacht-alert">' + npc.name + ' schöpft Verdacht gegen dich.</div>';
    } else {
        return '<div class="system-alert status-info">' + npc.name + 's Argwohn lässt nach.</div>';
    }
};

setup.enoughNpcAffection = function (npcKey, requiredValue) {
    const npc = State.variables.npc?.[npcKey];
    if (!npc) return false;

    return npc.affection >= requiredValue;
};

setup.isFactionKnown = function (factionString) {
    return Object.values(State.variables.npc).some(npc =>
        npc.faction === factionString && npc.known === true
    );
};

setup.getRandomKnownNpcByFaction = function (factionString) {
    const known = Object.values(State.variables.npc).filter(npc =>
        npc.known === true && npc.faction === factionString
    );
    if (known.length === 0) return null;
    return known[Math.floor(Math.random() * known.length)].name;
};

/* Der bekannte 84.-Banner-Mann mit der höchsten affection holt Thomas ins Lager. */
setup.bannerHolt = function () {
    var npc = State.variables.npc, best = null;
    for (var k in npc) {
        var n = npc[k];
        if (n && n.faction === "84. Banner" && n.known === true) {
            if (best === null || n.affection > npc[best].affection) best = k;
        }
    }
    return best;   // npc-Key oder null
};

/* Erfolgreich aufgedeckte Gossips, die an eine bestimmte Person geknüpft sind. */
setup.gossipsFuerNpc = function (npcKey) {
    return setup.getAllGossipStories().filter(function (s) {
        if (s.npcKey !== npcKey) return false;
        return setup.wasGossipSuccessful(s.id)
            || (State.variables.player.rumors || []).includes(s.rumorText);
    });
};

/* Alle „ansprechbaren" Gossips für die am Feuer Anwesenden. */
setup.gossipsFuerAnwesende = function (npcKeys) {
    var out = [];
    npcKeys.forEach(function (k) {
        setup.gossipsFuerNpc(k).forEach(function (s) { out.push({ npc: k, story: s }); });
    });
    return out;
};


/* Alle 84.-Banner-Söldner, die Thomas noch nicht kennt. */
setup.unbekannteSoeldner = function () {
    var npc = State.variables.npc, out = [];
    for (var k in npc) {
        if (npc[k] && npc[k].faction === "84. Banner" && npc[k].known !== true) {
            out.push(k);
        }
    }
    return out;
};




/* ===== WESENSZUG: wie die Welt Thomas liest =====
   Die am stärksten ausgeprägte Eigenschaft (Abstand von 50, mindestens 15).
   Liefert null, wenn Thomas (noch) unauffällig ist. */
setup.wesenszug = function () {
    var s = State.variables.player.stats;
    var keys = ["mercy", "ambition", "honesty", "discipline", "faith"];
    var best = null;
    keys.forEach(function (k) {
        var wert = (typeof s[k] === "number") ? s[k] : 50;
        var abstand = Math.abs(wert - 50);
        if (abstand >= 15 && (!best || abstand > best.abstand)) {
            best = { key: k, wert: wert, richtung: (wert >= 50 ? "hoch" : "niedrig"), abstand: abstand };
        }
    });
    return best;
};

setup.wesenszugLabel = function () {
    var w = setup.wesenszug();
    if (!w) return "Unbeschrieben";
    var labels = {
        mercy:      { hoch: "Gnädig",        niedrig: "Hartherzig" },
        ambition:   { hoch: "Ehrgeizig",     niedrig: "Genügsam" },
        honesty:    { hoch: "Aufrichtig",    niedrig: "Gerissen" },
        discipline: { hoch: "Diszipliniert", niedrig: "Aufsässig" },
        faith:      { hoch: "Fromm",         niedrig: "Gottlos" }
    };
    return labels[w.key][w.richtung];
};
