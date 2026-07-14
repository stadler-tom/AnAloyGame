
/* ================================================================
   SECTION 11  SKILL-CHECKS
   ================================================================ */

// Wirft d20 + Skill gegen eine Schwierigkeit.
// Gibt ein Ergebnis-Objekt zurück - kein Text, keine Alerts.
// skillKey: z.B. "combat", "gossip", "thievery"
// difficulty: feste Schwierigkeit (AC), z.B. 13
// modifier: optionaler Auf-/Abschlag auf die Schwierigkeit (z.B. +3 erschwert, -2 erleichtert)
setup.skillCheck = function (skillKey, difficulty, modifier) {
    const player = State.variables.player;
    const skill = player?.knowledge?.[skillKey] || 0;
    const dc = difficulty + (modifier || 0);

    const roll = random(1, 20);            // SugarCubes random, save-sicher
    const total = roll + skill;

    let outcome;
    if (roll === 20) outcome = "crit";       // natürliche 20: immer Erfolg
    else if (roll === 1) outcome = "fumble";     // natürliche 1: immer Fehlschlag
    else if (total >= dc) outcome = "success";
    else outcome = "fail";

    return {
        outcome: outcome,
        success: (outcome === "success" || outcome === "crit"),
        roll: roll,
        skill: skill,
        skillKey: skillKey,
        skillName: setup.knowledgeNames[skillKey] || skillKey,
        total: total,
        dc: dc
    };
};

/* Sichtbare Info-Box zu einer Probe. Direkt nach dem Check ausgeben:
   <<set _r to setup.skillCheck("thievery", 14)>>
   <<= setup.skillCheckAlert(_r)>> */
setup.skillCheckAlert = function (r) {
    if (!r) return "";
    var detail = 'Wurf ' + r.roll + ' + ' + r.skill + ' = ' + r.total + ' gegen ' + r.dc;
    var lern = r.lernHTML || "";   /* Stufenanstieg aus skillCheckXp, falls vorhanden */
    var box;

    if (r.outcome === "crit") {
        box = '<div class="system-alert status-positive">🎲 Probe auf ' + r.skillName + ' — meisterhaft gelungen! (Natürliche 20)</div>';
    } else if (r.outcome === "fumble") {
        box = '<div class="system-alert status-negative">🎲 Probe auf ' + r.skillName + ' — gründlich misslungen. (Natürliche 1)</div>';
    } else if (r.success) {
        box = '<div class="system-alert status-positive">🎲 Probe auf ' + r.skillName + ' — gelungen (' + detail + ')</div>';
    } else {
        box = '<div class="system-alert status-negative">🎲 Probe auf ' + r.skillName + ' — misslungen (' + detail + ')</div>';
    }

    return box + lern;
};

/* ===== SKILL-LERNSYSTEM: Lernen durch Anwendung =====
   Kein stumpfes +1 pro Erfolg — jede Probe zahlt Übung in einen Pool,
   der Skill steigt erst, wenn die Lernkosten der Stufe gedeckt sind. */

setup.skillLernbar = ["pike", "crossbow", "cannon", "medicine", "thievery", "gossip", "combat", "perception"];

/* Lernkosten für den Schritt von Stufe -> Stufe+1 */
setup.skillLernkosten = function (stufe) {
    return 10 + stufe * 8;   /* 0->1: 10 XP · 4->5: 42 XP · 9->10: 82 XP */
};

setup.ensureSkillXp = function () {
    var p = State.variables.player;
    if (!p.skillXp) p.skillXp = {};
    setup.skillLernbar.forEach(function (k) {
        if (typeof p.skillXp[k] !== "number") p.skillXp[k] = 0;
    });
    return p.skillXp;
};

/* Übung gutschreiben; gibt Alert-HTML zurück, wenn eine Stufe steigt (sonst "") */
setup.gainSkillXp = function (skillKey, xp) {
    if (setup.skillLernbar.indexOf(skillKey) === -1) return "";
    var p = State.variables.player;
    var pool = setup.ensureSkillXp();
    pool[skillKey] += Math.max(0, Math.round(xp));

    var out = "";
    var guard = 0;
    while (p.knowledge[skillKey] < 10
        && pool[skillKey] >= setup.skillLernkosten(p.knowledge[skillKey])
        && guard++ < 10) {
        pool[skillKey] -= setup.skillLernkosten(p.knowledge[skillKey]);
        out += setup.setPlayerKnowledge(skillKey, 1);
    }
    return out;
};

/* Probe MIT Lerneffekt — Verwendung exakt wie skillCheck:
   <<set _r to setup.skillCheckXp("thievery", 14)>>
   <<= setup.skillCheckAlert(_r)>>     (zeigt einen Stufenanstieg automatisch mit an)
   Übung: Erfolg = DC−8 (min. 2), Krit = DC−6 (min. 4), Fehlschlag = 2, Patzer = 0. */
setup.skillCheckXp = function (skillKey, difficulty, modifier) {
    var r = setup.skillCheck(skillKey, difficulty, modifier);
    var xp = 0;
    if (r.outcome === "crit") xp = Math.max(4, r.dc - 6);
    else if (r.success) xp = Math.max(2, r.dc - 8);
    else if (r.outcome === "fail") xp = 2;   /* aus Fehlern lernt man — ein wenig */
    /* fumble: 0 — Patzer lehren nur Demut */

    var hinweis = xp > 0
        ? '<span class="check-hint">' + r.skillName + ' geübt. ' + xp + ' XP erhalten' + '</span>'
        : "";
    r.lernHTML = hinweis + setup.gainSkillXp(skillKey, xp);
    return r;
};

// Erfolgswahrscheinlichkeit eines skillChecks in Prozent (0-100)
setup.checkChance = function (skillKey, difficulty, modifier) {
    const skill = State.variables.player?.knowledge?.[skillKey] || 0;
    const dc = difficulty + (modifier || 0);

    // benötigter Wurf, damit roll + skill >= dc
    let need = dc - skill;

    // Würfe 2..19 zählen normal; 20 immer Erfolg, 1 immer Fehlschlag
    let successFaces = 0;
    for (let r = 1; r <= 20; r++) {
        if (r === 20) { successFaces++; continue; }   // Krit: immer
        if (r === 1) { continue; }                    // Patzer: nie
        if (r >= need) successFaces++;
    }

    return Math.round((successFaces / 20) * 100);
};

// Prozent -> sprachliches Label
setup.chanceLabel = function (pct) {
    if (pct <= 0) return "aussichtslos";
    if (pct < 8) return "Eine schlechte Idee";
    if (pct < 20) return "ein echtes Wagnis";
    if (pct < 35) return "schlechte Karten";
    if (pct < 45) return "eher dagegen";
    if (pct < 56) return "ausgeglichen";
    if (pct < 70) return "stehen gut";
    if (pct < 85) return "gute Karten";
    if (pct < 95) return "ziemlich sicher";
    if (pct < 100) return "fast schon sicher";
    return "ein Selbstläufer";
};

setup.checkHint = function (skillKey, difficulty, modifier) {
    const skill = State.variables.player?.knowledge?.[skillKey] || 0;
    const name = setup.knowledgeNames[skillKey] || skillKey;
    const pct = setup.checkChance(skillKey, difficulty, modifier);
    const label = setup.chanceLabel(pct);
    return '<span class="check-hint"> Wurf auf ' + name + ' — ' + label + '</span>';
};

/* Faith-Probe: stats.faith (0–100) -> 0–10-Wert, dann wie ein Skill gegen die DC gewürfelt. */
setup.faithCheck = function (difficulty, modifier) {
    var faith = (State.variables.player.stats.faith) || 0;
    var skill = Math.round(faith / 10);              /* 100er-Wert -> 10er-Wert */
    var dc = difficulty + (modifier || 0);
    var roll = random(1, 20);
    var total = roll + skill;
    var outcome;
    if (roll === 20) outcome = "crit";
    else if (roll === 1) outcome = "fumble";
    else if (total >= dc) outcome = "success";
    else outcome = "fail";
    return { outcome: outcome, success: (outcome === "success" || outcome === "crit"),
             roll: roll, skill: skill, skillKey: "faith", skillName: "Glaube", total: total, dc: dc };
};