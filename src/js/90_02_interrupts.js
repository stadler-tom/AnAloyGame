
/* ================================================================
   SECTION 02  INTERRUPT-ENGINE
   ================================================================ */

setup.interruptCond = {};   // optional: "Name" -> w => boolean
setup.interruptCooldown = {};   // optional: "Name" -> Tage (sonst Default 3)
setup.interruptPrio = {};   // höher = wird zuerst gefeuert
setup.interruptKapitel = {};   // "Name" -> Kapitelnummer (gesperrt via $world.kapitelN_gesperrt)

setup.kapitel1Abschliessen = function () {
    State.variables.world.kapitel1_gesperrt = true;
};

setup.checkInterrupt = function () {
    const w = State.variables.world;
    if (w.interruptDoneToday) return null;
    const hist = w.interruptHistory;

    setup.interruptKapitel = setup.interruptKapitel || {};

    // Eignung: nicht auf Cooldown, nicht verbrauchter Einmaliger
    const eligible = name => {
        const passage = Story.get(name);
        if (!passage) return false;                                   /* BUGFIX: Null-Check zuerst */
        if (passage.tags.includes("kap1")) { setup.interruptKapitel[name] = 1; }
        const kap = setup.interruptKapitel[name];
        if (kap !== undefined && w["kapitel" + kap + "_gesperrt"] === true) return false;
        if (passage.tags.includes("einmalig") && hist[name]) return false;
        const cd = setup.interruptCooldown[name] || 3;
        if (hist[name] && (w.day - hist[name]) < cd) return false;
        return true;
    };

    // --- NUR Passagen mit dem Tag "interrupt" kommen in den Pool ---
    const pool = Story.lookupWith(p => p.tags.includes("interrupt"))
        .map(p => p.title);

    console.log('[Interrupt] Tag ' + w.day + ' | Pool:', pool);

    // --- 1. PFLICHT: hat eine Bedingung UND sie ist erfüllt -> muss feuern ---
    const pflicht = pool
        .filter(name => setup.interruptCond[name])
        .filter(name => setup.interruptCond[name](w))
        .filter(eligible)
        .sort((a, b) => (setup.interruptPrio[b] || 0) - (setup.interruptPrio[a] || 0));

    console.log('[pflicht] Tag ' + w.day + ' | Pool:', pflicht);

    if (pflicht.length > 0) {
        const winner = pflicht[0];
        hist[winner] = w.day;
        w.interruptDoneToday = true;
        return winner;
    }

    // --- 2. ZUFALL: keine Bedingung -> normaler Pool ---
    const zufall = pool
        .filter(name => !setup.interruptCond[name])
        .filter(eligible);

    console.log('[zufall] Tag ' + w.day + ' | Pool:', zufall);

    if (zufall.length === 0) return null;
    if (Math.random() > (w.interruptChance || 0.35)) return null;

    const winner = zufall[Math.floor(Math.random() * zufall.length)];
    hist[winner] = w.day;
    w.interruptDoneToday = true;
    return winner;
};

/* Rücksprungziele nach Interrupts (Kapitel 1) */
setup.routeTags = {
    nach_hub: "Nachmittag Hub",
    nach_appell: "Abendappell",
    nach_stube: "Auf Stube",
    nach_morgen: "Kap1_Tagesstart",
    nach_Kap2_tag: "Kap2_Tageshub",
    nach_Kap2_abend: "Kap2_Abend",
    nach_Kap2_morgen: "Kap2_Tagesstart"
};

// Liest aus den Tags der aktuellen Passage das Rücksprungziel
// BUGFIX: In Kapitel 2 (kapitel1_gesperrt) routete weiterImTag bisher
// auf Kapitel-1-Passagen ("Nachmittag Hub"). Jetzt: Kap2-Weiche.
setup.routeFromTags = function (tagList) {
    const player = State.variables.player;
    const kap2 = State.variables.world.kapitel1_gesperrt === true;
    for (const t of tagList) {
        player.hasSlept = (t !== "nach_morgen");
        if (t === "nach_abend" && kap2) return "Kap2_Abend";   /* Abendszene: Tag endet, normal geschlafen */
        if (t === "nach_morgen") return kap2 ? "Kap2_Tagesstart" : setup.routeTags[t];
        if (setup.routeTags[t]) return kap2 ? "Kap2_Tageshub" : setup.routeTags[t];
    }
    player.hasSlept = true;
    return kap2 ? "Kap2_Tageshub" : "Nachmittag Hub";
};


/* ================================================================
   SECTION 03  INTERRUPT-REGISTRY — KAPITEL 1
   ================================================================ */

/* --- Story-Events --- */
setup.interruptCond["Story002_Taverne_mit_Lars_Und_Hadde"] = w => w.day >= 8;
setup.interruptPrio["Story002_Taverne_mit_Lars_Und_Hadde"] = 60;

setup.interruptCond["Story003_ErsterMorgen"] = w => w.day == 2;
setup.interruptKapitel["Story003_ErsterMorgen"] = 1;

setup.interruptCond["04_Sidequest_diplomaten_Auftrag"] = w => w.day >= 18;
setup.interruptPrio["04_Sidequest_diplomaten_Auftrag"] = 45;
setup.interruptKapitel["04_Sidequest_diplomaten_Auftrag"] = 1;

/* Ungetargetete Sidequests an Kapitel 1 binden */
setup.interruptKapitel["03_Sidequest_wenzel_Auftrag"] = 1;
setup.interruptKapitel["Storry006_DrillMitSchinder"] = 1;
setup.interruptKapitel["Story004_Interrupt_Schinder_Stellprobe"] = 1;
setup.interruptKapitel["Story005_Gottesdienst"] = 1;

/* --- EE_Tross_Intro: Schinder-Besorgung führt in den Tross (Easter Egg, spät in Kap 1) --- */
setup.interruptCond["EE_Tross_Intro"] = w => {
    var f = State.variables.npc.schinder.memory.flags;
    var h = w.interruptHistory;
    return f.tross_seen !== true
        && w.day >= 17;
};
setup.interruptPrio["EE_Tross_Intro"] = 20;

/* ===== JAREK-QUESTKETTE (S1–S4, geflaggt + über interruptHistory getaktet) ===== */
setup.interruptCond["Jarek_S1_Vorlesung"] = w => {
    var f = State.variables.npc.jarek.memory.flags;
    return f.s0_done === true && f.s1_seen !== true && w.day >= 20;
};
setup.interruptPrio["Jarek_S1_Vorlesung"] = 90;

setup.interruptCond["Jarek_S2_Angebot"] = w => {
    var f = State.variables.npc.jarek.memory.flags, h = w.interruptHistory;
    return f.s1_seen === true && f.s2_done !== true
        && w.day >= (h["Jarek_S1_Vorlesung"] || 0) + 5;
};
setup.interruptPrio["Jarek_S2_Angebot"] = 50;

setup.interruptCond["Jarek_S3_Start"] = w => {
    var f = State.variables.npc.jarek.memory.flags, h = w.interruptHistory;
    return f.s2_done === true && f.s3_zugesagt !== true
        && w.day >= (h["Jarek_S2_Angebot"] || 0) + 5;
};
setup.interruptPrio["Jarek_S3_Start"] = 50;

setup.interruptCond["Jarek_S4_Archiv"] = w => {
    var f = State.variables.npc.jarek.memory.flags, h = w.interruptHistory;
    return f.s3_zugesagt === true && f.s4_done !== true
        && w.day >= (h["Jarek_S3_Start"] || 0) + 4;
};
setup.interruptPrio["Jarek_S4_Archiv"] = 55;

setup.interruptCond["Jarek_S6_DokVermisst"] = w =>
    w.flags && w.flags.dok_vermisst_armed === true
    && w.flags.dok_vermisst_done !== true
    && w.day >= (w.flags.dok_vermisst_day || 0) + 3;
setup.interruptPrio["Jarek_S6_DokVermisst"] = 60;
/* ===== JAREK-QUESTKETTE ENDE ===== */

/* ===== KARLA-QUESTKETTE (Phase 1–7, geflaggt + getaktet) ===== */
/* --- karla_S1: erste Trainings-Annäherung (Einstieg, Phase 1) --- */
setup.interruptCond["karla_S1"] = w => {
    var f = State.variables.npc.karla.memory.flags;
    return f.s1_seen !== true && w.day >= 4;
};
setup.interruptPrio["karla_S1"] = 50;

/* --- karla_S1b: Vorbote – Karlas linke Schwäche (Hinweis für S2) --- */
setup.interruptCond["karla_S1b"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.s1_seen === true
        && f.s1_done === true
        && f.s1b_seen !== true
        && f.s2_done !== true
        && w.day >= (h["karla_S1"] || 0) + 2;
};
setup.interruptPrio["karla_S1b"] = 50;

/* --- karla_S2: vertieftes Training (an s1b_seen gekoppelt) --- */
setup.interruptCond["karla_S2"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.s1b_seen === true
        && f.s1b_done === true
        && f.s2_done !== true
        && w.day >= (h["karla_S1b"] || 0) + 2;
};
setup.interruptPrio["karla_S2"] = 50;

/* --- karla_S3: Dokumente-Nacht (Phase 2, Wendepunkt) --- */
setup.interruptCond["karla_S3"] = w => {
    var k = State.variables.npc.karla, f = k.memory.flags, h = w.interruptHistory;
    return f.s2_done === true
        && f.kennt_geheimnis !== true
        && f.p2_zweiter_anlauf !== true
        && k.affection >= 3
        && w.day >= (h["karla_S2"] || 0) + 3;
};
setup.interruptPrio["karla_S3"] = 55;

/* --- karla_S3b: zweiter Anlauf (nach Frage-Pfad in S3) --- */
setup.interruptCond["karla_S3b"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.p2_zweiter_anlauf === true
        && f.kennt_geheimnis !== true
        && f.p2_quest_zu !== true
        && w.day >= (h["karla_S3"] || 0) + 3;
};
setup.interruptPrio["karla_S3b"] = 55;

/* --- karla_S_Verhaftung: Konsequenz, wenn Quest verpatzt wurde --- */
setup.interruptCond["karla_S_Verhaftung"] = w => {
    var f = State.variables.npc.karla.memory.flags;
    return f.p2_quest_zu === true
        && f.verhaftung_seen !== true
        && w.day >= (f.p2_quest_zu_tag || 0) + 8;
};
setup.interruptPrio["karla_S_Verhaftung"] = 60;

/* --- karla_S4: die Suche nach dem Zeugennamen (Phase 3) --- */
setup.interruptCond["karla_S4"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.kennt_geheimnis === true
        && f.s3_done === true
        && f.zeuge_gefunden !== true
        && w.day >= (h["karla_S3"] || h["karla_S3b"] || 0) + 2;
};
setup.interruptPrio["karla_S4"] = 55;

/* karla_S4_karla_loest_selbst: KEINE Condition – wird per <<goto>> aus karla_S4 aufgerufen */

/* --- karla_S5: Dilemma + Brief (Phase 3.5 / 4) --- */
setup.interruptCond["karla_S5"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.zeuge_gefunden === true
        && f.s4_done === true
        && f.dilemma_done !== true
        && w.day >= (h["karla_S4"] || h["karla_S4_karla_loest_selbst"] || 0) + 2;
};
setup.interruptPrio["karla_S5"] = 60;

/* --- karla_S7: Luigis Ankunft (Phase 5) --- */
setup.interruptCond["karla_S7"] = w => {
    var f = State.variables.npc.karla.memory.flags;
    return f.brief_gesendet === true
        && f.s5_done === true
        && f.luigi_done !== true
        && w.day >= (f.brief_tag || 0) + 6;
};
setup.interruptPrio["karla_S7"] = 70;

/* --- karla_S8: Rückkehr & Auflösung (Phase 6) --- */
setup.interruptCond["karla_S8"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.luigi_done === true
        && f.s7_done === true
        && f.aufloesung_done !== true
        && w.day >= (h["karla_S7"] || 0) + 4;
};
setup.interruptPrio["karla_S8"] = 70;

/* --- karla_S9: Thomas berichtet Karla (Phase 6, Abschluss) --- */
setup.interruptCond["karla_S9"] = w => {
    var f = State.variables.npc.karla.memory.flags, h = w.interruptHistory;
    return f.aufloesung_done === true
        && f.s8_done === true
        && f.karla_erfahren !== true
        && w.day >= (h["karla_S8"] || 0) + 1;
};
setup.interruptPrio["karla_S9"] = 70;

/* --- karla_S10: die Umkehrung (Phase 7) --- */
setup.interruptCond["karla_S10"] = w => {
    var fj = State.variables.npc.jarek.memory.flags;
    var k = State.variables.npc.karla;
    return fj.katastrophe === true
        && k.trust === true
        && k.memory.flags.umkehrung_done !== true
        && w.day >= (w.flags && w.flags.jarek_ausgang_tag ? w.flags.jarek_ausgang_tag : 0) + 2;
};
setup.interruptPrio["karla_S10"] = 65;
/* ===== KARLA-QUESTKETTE ENDE ===== */

/* --- Kapitel1_Ende: Jarek-Katastrophe IST der Abschluss; ein paar Tage Stille davor --- */
setup.interruptCond["Kapitel1_Ende"] = w => {
    var npc = State.variables.npc || {};
    var k = ((npc.karla && npc.karla.memory) || {}).flags || {};
    var j = ((npc.jarek && npc.jarek.memory) || {}).flags || {};
    var f = w.flags || {};

    if (k.kapitel1_ende_seen === true) return false;

    // Voller Durchlauf (Umkehrung impliziert Jarek-Katastrophe) – ohne Extra-Wartezeit
    if (k.umkehrung_done === true) return true;

    // Sonst: Jarek-Katastrophe durch + Schamfrist, egal in welchem Zustand Karla ist
    return j.katastrophe === true
        && w.day >= (f.jarek_ausgang_tag || 0) + 4;
};
setup.interruptPrio["Kapitel1_Ende"] = 90;

["karla_S1", "karla_S1b", "karla_S2", "karla_S3", "karla_S3b", "karla_S_Verhaftung",
    "karla_S4", "karla_S5", "karla_S7", "karla_S8", "karla_S9", "karla_S10",
    "Jarek_S1_Vorlesung", "Jarek_S2_Angebot", "Jarek_S3_Start", "Jarek_S4_Archiv",
    "Jarek_S6_DokVermisst", "Kapitel1_Ende"
].forEach(n => setup.interruptKapitel[n] = 1);


/* ================================================================
   SECTION 04  INTERRUPT-REGISTRY — KAPITEL 2
   ================================================================ */

/* ===== VERDACHT-ESKALATION (player.suspicion) — Kap 2 ===== */
setup.interruptCond["Suspicion_Rapport_Rindler"] = w => {
    if (w.kapitel1_gesperrt !== true) return false;
    var p = State.variables.player;
    return p && p.suspicion >= 50;
};
setup.interruptPrio["Suspicion_Rapport_Rindler"] = 85;
setup.interruptCooldown["Suspicion_Rapport_Rindler"] = 5;

setup.interruptCond["Suspicion_Spinddurchsuchung"] = w => {
    if (w.kapitel1_gesperrt !== true) return false;
    var p = State.variables.player;
    return p && p.suspicion >= 80;
};
setup.interruptPrio["Suspicion_Spinddurchsuchung"] = 95;   /* höher als Rapport: die härtere Eskalation gewinnt bei >=80 */
setup.interruptCooldown["Suspicion_Spinddurchsuchung"] = 7;




/* --- Halms Warnung: feuert, wenn Oren zu viel Verdacht geschöpft hat --- */
setup.interruptCond["Halm_S1_Ruft_Thomas"] = w => {
    /* BUGFIX: defensiv — die Condition läuft auch in Kapitel 1 mit,
       wenn $world.ermittlung / $world.flags noch nicht existieren */
    const e = w.ermittlung;
    const wf = w.flags;
    if (!e || !wf) return false;
    const verdachtOren = (e.verdacht && e.verdacht.orenmalk) || 0;
    const f = State.variables.npc.magister.memory.flags;
    return verdachtOren > 3
        && wf.jarek_ausgang === "schande"
        && f.hat_thomas_gerufen !== true;
};
setup.interruptPrio["Halm_S1_Ruft_Thomas"] = 90;


setup.interruptCond["Kurt_Bead_1"] = w => {
    if (w.kapitel1_gesperrt !== true) return false;              
    var f = State.variables.npc.kurt.memory.flags;
    return !f.kurt_stufe && w.day >= 372;
};
setup.interruptCond["Kurt_Faden_2"] = w => {
    if (w.kapitel1_gesperrt !== true) return false;
    var f = State.variables.npc.kurt.memory.flags;
    return f.kurt_stufe === 1 && w.day >= (f.kurt_stufe1_tag || 0) + 4;
};
setup.interruptCond["Kurt_Faden_3"] = w => {
    if (w.kapitel1_gesperrt !== true) return false;
    var f = State.variables.npc.kurt.memory.flags;
    return f.kurt_stufe === 2 && w.day >= (f.kurt_stufe2_tag || 0) + 4;
};


setup.interruptCond["Duell_S0_Fruehstueck"] = w => {
    if (w.kapitel1_gesperrt !== true) return false;                 
    return  w.day >= 382;
}
    
    



/* ===== ERMITTLUNG "DIE SECHSTE HAND" — Interrupt-Takt =====
   Voraussetzung: Jarek fort (Katastrophe) UND Karla frei.
   Karla verhaftet => Strang gesperrt. */

setup.interruptCond["Ermittlung_S0_Auftakt"] = w => {
    var je = State.variables.npc.jarek.memory.flags;
    var e = w.ermittlung || { flags: {} };
    return je.katastrophe === true
        && e.gesperrt !== true
        && w.day >= (e.fruehestens_tag || 367);
};
setup.interruptPrio["Ermittlung_S0_Auftakt"] = 58;



setup.interruptCond["Ermittlung_S1_Intro_in_Waffenstube"] = w => {
    var h = w.interruptHistory;
    return (h["Ermittlung_S0_Auftakt"] || 0) > 0
        && w.day >= h["Ermittlung_S0_Auftakt"] + 4;
};
setup.interruptPrio["Ermittlung_S1_Intro_in_Waffenstube"] = 58;

/* S2: nur der in S1 gewählte Weg feuert, 3 Tage Vorbereitung */
setup.ermS2Passage = {
    einbruch: "Ermittlung_S2_Einbruch",
    hauptmann: "Ermittlung_S2_Hauptmann",
    trick: "Ermittlung_S2_Verwaltungstrick"
};
Object.keys(setup.ermS2Passage).forEach(function (weg) {
    var name = setup.ermS2Passage[weg];
    setup.interruptCond[name] = w => {
        var f = (w.ermittlung && w.ermittlung.flags) || {};
        var h = w.interruptHistory;
        return f.s2_weg === weg
            && f.s2_done !== true
            && w.day >= (h["Ermittlung_S1_Intro_in_Waffenstube"] || 0) + 3;
    };
    setup.interruptPrio[name] = 58;
});

setup.interruptCond["Ermittlung_S4_Magister_Halm"] = w => {
    var f = (w.ermittlung && w.ermittlung.flags) || {};
    var h = w.interruptHistory;
    var vorher = setup.ermS2Passage[f.s2_weg];
    return f.s2_done === true
        && f.s4_done !== true
        && w.day >= ((vorher && h[vorher]) || 0) + 3;
};
setup.interruptPrio["Ermittlung_S4_Magister_Halm"] = 58;

setup.interruptCond["Ermittlung_S5_Westhof"] = w => {
    var f = (w.ermittlung && w.ermittlung.flags) || {};
    var h = w.interruptHistory;
    return f.westhof_plan === true
        && f.westhof_done !== true
        && w.day >= (h["Ermittlung_S4_Magister_Halm"] || 0) + 4;
};
setup.interruptPrio["Ermittlung_S5_Westhof"] = 58;

/* S7: nur der in S6 gewählte Weg feuert, 3 Tage Vorbereitung */
setup.ermS7Passage = {
    protokolle: "Ermittlung_S7_Wachprotokolle",
    posten: "Ermittlung_S7_Wachposten_Befragung",
    route: "Ermittlung_S7_Route_Ablaufen"
};
Object.keys(setup.ermS7Passage).forEach(function (weg) {
    var name = setup.ermS7Passage[weg];
    setup.interruptCond[name] = w => {
        var f = (w.ermittlung && w.ermittlung.flags) || {};
        var h = w.interruptHistory;
        return f.s7_weg === weg
            && f.s7_done !== true
            && w.day >= (h["Ermittlung_S5_Westhof"] || 0) + 3;
    };
    setup.interruptPrio[name] = 58;
});

/* ===== ERMITTLUNG – La-Familia-Faden (nur Story, liefert Gerüchte, keinen Kopf) =====
   "Wort an Luigi schicken" setzt: $world.ermittlung.flags.familia_kontaktiert = true
   + $world.ermittlung.flags.familia_kontakt_tag = $world.day */
setup.interruptCond["Ermittlung_Familia_Antwort"] = w => {
    var e = w.ermittlung || { flags: {} };
    var f = e.flags || {};
    return State.variables.npc.luigi.known === true   /* Linie zu Luigi muss bestehen */
        && f.sendLetterToLuigi === true
        && f.familia_antwort !== true
        && w.day >= (f.familia_kontakt_tag || 0) + 5;
};
setup.interruptPrio["Ermittlung_Familia_Antwort"] = 56;

setup.interruptCond["Ermittlung_Nachspiel_Grodaus"] = w => {
    var e = w.ermittlung;
    if (!e || !e.flags) return false;
    return e.flags.abgeschlossen === true
        && e.flags.nachspiel_done !== true
        && w.day >= (e.flags.s10_tag || 0) + 3;
};
setup.interruptPrio["Ermittlung_Nachspiel_Grodaus"] = 88;
