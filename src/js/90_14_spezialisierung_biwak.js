

/* ================================================================
   SECTION 19  SPEZIALISIERUNG & GATTUNGSDRILL (Kapitel 2)
   ================================================================ */

setup.spezialisierungsWaffe = {
    pike: "pike",
    crossbow: "crossbow",
    cannon: "hand_cannon",
    medicine: "field_knife"
};

setup.spezialisierungsName = {
    pike: "Pike & Hellebarde",
    crossbow: "Armbrust",
    cannon: "Geschütz",
    medicine: "Feldscher"
};

setup.gattungsdrillVault = null;
setup.loadGattungsdrillVault = function () {
    if (!setup.gattungsdrillVault) {
        /* BUGFIX: Guard, falls die Pool-Passage (noch) fehlt */
        if (!Story.has("kap2_texte_drill")) {
            console.warn("Pool-Passage nicht gefunden: kap2_texte_drill");
            setup.gattungsdrillVault = {};
        } else {
            setup.gattungsdrillVault = JSON.parse(Story.get("kap2_texte_drill").text);
        }
    }
    return setup.gattungsdrillVault;
};

/* Ein Drill-Besuch: liefert Szenerie + levelabhängigen Gedanken + Belohnung.
   Fortschritt: bis Skill 4 sicher, bis 7 zäh (60%), darüber selten (30%). */
setup.gattungsdrill = function () {
    var p = State.variables.player;
    var spez = p.spezialisierung;
    var v = setup.loadGattungsdrillVault();
    var g = v[spez];
    if (!g) return { text: "Fehler: Gattung [" + spez + "] nicht im Drill-Vault.", thought: "", reward: "" };

    var skill = p.knowledge[spez] || 0;
    var scenery = g.scenery[Math.floor(Math.random() * g.scenery.length)];
    var thought = skill < 4 ? g.thought.low : (skill < 7 ? g.thought.mid : g.thought.high);

    var reward = "";
    if (skill >= 10) {
        reward = '<div class="system-alert status-info">Mehr kann der Hof dich nicht lehren — nur noch das Feld.</div>';
    } else {
        /* Übungs-XP nach Bracket: früh zügig, später zäh (Lernkosten steigen ohnehin) */
        var xp = skill < 4 ? 14 : (skill < 7 ? 9 : 6);

        /* Abendliche Waffenpflege: der nächste Drill bringt mehr */
        if (State.variables.world.gut_vorbereitet === true) {
            xp = Math.round(xp * 1.5);
            State.variables.world.gut_vorbereitet = false;
            reward += '<div class="system-alert status-info">Die Vorbereitung des Abends zahlt sich aus (x 1.5).</div>';
        }

         /* Abendliche Waffenpflege: der nächste Drill bringt mehr */
        if (State.variables.world.sehr_gut_vorbereitet === true) {
            xp = Math.round(xp * 2.5);
            State.variables.world.sehr_gut_vorbereitet = false;
            reward += '<div class="system-alert status-info">Die Vorbereitung des Abends zahlt sich sehr aus (x 2.5).</div>';
        }

        var name = (setup.knowledgeNames && setup.knowledgeNames[spez]) || spez;
        reward += '<span class="check-hint">' + name + ' geübt. ' + xp + ' XP erhalten.</span>';
        reward += setup.gainSkillXp(spez, xp);   /* meldet selbst, wenn eine Stufe steigt */
    }

    reward += setup.setPlayerCondition(-10);
    p.chosen_activity = spez;
    State.variables.world.wasPracticing = true;

    return { text: scenery, thought: thought, reward: reward };
};

