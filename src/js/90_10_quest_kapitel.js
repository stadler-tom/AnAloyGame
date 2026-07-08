
/* ================================================================
   SECTION 15  QUEST-HELPER & KAPITELWECHSEL
   ================================================================ */

/* Wieviel weiß Thomas über die Transportüberfälle?
   0 = nichts | 1 = ein bisschen (Gerücht aufgeschnappt) | 2 = viel (Karla hat erzählt) */
setup.ueberfallWissen = function () {
    var npc = State.variables.npc;
    var player = State.variables.player;

    // Stufe 2: Karla hat es in ihrer Sidequest ausführlich erzählt
    if (npc && npc.karla && npc.karla.memory && npc.karla.memory.flags &&
        npc.karla.memory.flags.erzaehlte_von_ueberfaellen) {
        return 2;
    }

    // Stufe 1: nur ein Gerücht aus dem Minigame aufgeschnappt
    if (player && Array.isArray(player.rumors)) {
        var hat = player.rumors.some(function (r) {
            var t = (r || "").toLowerCase();
            return t.indexOf("transport") !== -1 || t.indexOf("überf") !== -1;
        });
        if (hat) return 1;
    }

    return 0;
};

/* Höchste(r) Kampfwert(e) aus den fünf Ausbildungsdisziplinen */
setup.hoechsteKampfwerte = function () {
    var p = State.variables.player;
    var keys = ["pike", "crossbow", "cannon", "medicine", "thievery"];
    var max = -1;
    keys.forEach(function (k) {
        var v = p.knowledge[k] || 0;
        if (v > max) max = v;
    });
    return keys.filter(function (k) { return (p.knowledge[k] || 0) === max; });
};

/* Würdigungstext pro Disziplin (Prosa, kein Zahlwert) */
setup.kampfwertWuerdigung = function (key) {
    var texte = {
        pike: "Mit Pike und Hellebarde hast du dich hervorgetan — wo andere noch den Schaft umklammerten, hieltest du die Linie. Der Schinder hat es gesehen, auch wenn er es nie zugäbe.",
        crossbow: "An der Armbrust wurdest du zu einer ruhigen Hand. Wo andere zappelten, lagst du still und triffst, was du anvisierst. Eine Kunst, die im Feld Leben rettet.",
        cannon: "Die schweren Geschütze haben dir ihr Geheimnis preisgegeben. Pulver, Winkel, Geduld — du verstehst die Sprache der Artillerie, und das verstehen nur wenige.",
        medicine: "Du hast gelernt, zu flicken statt zu zerstören. Die Feldscherkunst macht dich zu jemandem, den das Banner nicht verlieren will — denn ein Heiler ist mehr wert als zehn Klingen.",
        thievery: "In den Schatten hinter den Stallungen hast du eine Kunst gelernt, die in keinem Ausbildungsplan steht. Flinke Finger, leise Schritte, ein Blick für das, was andere übersehen."
    };
    return texte[key] || "";
};

/* Affektions-Vermerk in vier Stufen */
setup.ausbilderVermerk = function (npcKey, satzKuehl, satzNeutral, satzModerat, satzEuphorisch) {
    var npc = State.variables.npc[npcKey];
    var a = npc ? npc.affection : 0;
    if (a < 0) return satzKuehl;
    if (a === 0) return satzNeutral;
    if (a < 10) return satzModerat;
    return satzEuphorisch;
};

/* Skill-Squash beim Kapitelwechsel: ceil(sqrt(x)) — aus 10 wird 4 */
setup.rebuildKnowledgeForChapter2 = function () {
    const player = State.variables.player;
    const keys = ["scholarship", "pike", "crossbow", "cannon", "medicine", "thievery", "gossip", "combat"];

    for (const key of keys) {
        player.knowledge[key] = Math.ceil(Math.sqrt(player.knowledge[key] || 0));
    }
};

setup.getPeakKnowledgeAfterKapOne = function () {
    const ignore = ["thievery", "gossip", "combat"];
    const knowledge = State?.variables?.player?.knowledge;

    if (!knowledge || typeof knowledge !== "object") return [];

    const filteredEntries = Object.entries(knowledge)
        .filter(([key, value]) =>
            !ignore.includes(key) && typeof value === "number" && value > 0
        );

    if (filteredEntries.length === 0) return [];

    const maxValue = Math.max(...filteredEntries.map(([, value]) => value));

    return filteredEntries
        .filter(([, value]) => value === maxValue)
        .map(([key]) => setup.knowledgeNames[key] || key);
};
