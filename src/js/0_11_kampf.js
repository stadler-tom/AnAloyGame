

/* ================================================================
   SECTION 16  KAMPFSYSTEM
   ================================================================
   Schema:
   $player.combatXp          = rohe Kampf-XP
   $player.knowledge.combat  = Kampfwert 0–10
   $player.fightStats        = berechnete Kampfwerte
   $player.inventory.weapons = Waffeninventar
   $player.equipment.weapon  = ausgerüstete Waffe
   ================================================================ */

/* --- XP-Kurve: combatXp -> knowledge.combat 0..10 --- */
setup.combatXpThresholds = [
    0,      // combat 0
    100,    // combat 1
    250,    // combat 2
    500,    // combat 3
    900,    // combat 4
    1400,   // combat 5
    2100,   // combat 6
    3000,   // combat 7
    4200,   // combat 8
    5600,   // combat 9
    7500    // combat 10
];

setup.getCombatFromXp = function (xp) {
    const thresholds = setup.combatXpThresholds;
    let combat = 0;

    xp = xp || 0;

    for (let i = 0; i < thresholds.length; i++) {
        if (xp >= thresholds[i]) {
            combat = i;
        }
    }

    return Math.min(combat, 10);
};

/* --- Basic Helpers --- */
setup.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

setup.rollDice = function (count, sides) {
    let total = 0;

    count = count || 1;
    sides = sides || 1;

    for (let i = 0; i < count; i++) {
        total += random(1, sides);
    }

    return total;
};

setup.getFightStats = function (unit) {
    if (!unit || !unit.fightStats) {
        console.warn("Einheit ohne fightStats:", unit);
        return null;
    }

    return unit.fightStats;
};

setup.isDead = function (unit) {
    const fs = setup.getFightStats(unit);
    return !fs || fs.hp <= 0;
};

/* --- Waffen-Templates --- */
setup.weaponTemplates = {
    unarmed: {
        id: "unarmed",
        name: "Fäuste",
        skill: null,
        attackBonus: 0,
        damage: { count: 1, sides: 2 },
        damageBonus: 0
    },

    dagger: {
        id: "dagger",
        name: "Dolch",
        skill: "thievery",
        attackBonus: 1,
        damage: { count: 1, sides: 4 },
        damageBonus: 0
    },

    field_knife: {
        id: "field_knife",
        name: "Feldmesser",
        skill: "medicine",
        attackBonus: 0,
        damage: { count: 1, sides: 4 },
        damageBonus: 1
    },

    training_pike: {
        id: "training_pike",
        name: "Übungspike",
        skill: "pike",
        attackBonus: 0,
        damage: { count: 1, sides: 6 },
        damageBonus: 0
    },

    pike: {
        id: "pike",
        name: "Pike",
        skill: "pike",
        attackBonus: 0,
        damage: { count: 1, sides: 8 },
        damageBonus: 0
    },

    sabre: {
        id: "sabre",
        name: "Säbel",
        skill: "pike",
        attackBonus: 1,
        damage: { count: 1, sides: 6 },
        damageBonus: 0
    },

    light_crossbow: {
        id: "light_crossbow",
        name: "Leichte Armbrust",
        skill: "crossbow",
        attackBonus: 1,
        damage: { count: 1, sides: 6 },
        damageBonus: 0
    },

    crossbow: {
        id: "crossbow",
        name: "Armbrust",
        skill: "crossbow",
        attackBonus: 1,
        damage: { count: 1, sides: 8 },
        damageBonus: 0
    },

    hand_cannon: {
        id: "hand_cannon",
        name: "Handrohr",
        skill: "cannon",
        attackBonus: -1,
        damage: { count: 1, sides: 10 },
        damageBonus: 0
    }
};

/* --- Player Data / Inventory / Equipment --- */
setup.ensurePlayerCombatData = function () {
    const player = State.variables.player;

    if (!player) {
        console.warn("Kein Spieler gefunden.");
        return null;
    }

    if (player.combatXp == null) {
        player.combatXp = 0;
    }

    if (!player.knowledge) {
        player.knowledge = {};
    }

    if (player.knowledge.combat == null) {
        player.knowledge.combat = 0;   /* Kampferfahrung läuft jetzt über das Skill-Lernsystem */
    }

    if (!player.fightStats) {
        player.fightStats = {};
    }

    if (!player.inventory) {
        player.inventory = {
            items: [],
            weapons: ["unarmed"]
        };
    }

    if (!Array.isArray(player.inventory.items)) {
        player.inventory.items = [];
    }

    if (!Array.isArray(player.inventory.weapons)) {
        player.inventory.weapons = ["unarmed"];
    }

    if (!player.inventory.weapons.includes("unarmed")) {
        player.inventory.weapons.unshift("unarmed");
    }

    if (!player.equipment) {
        player.equipment = {};
    }

    if (!player.equipment.weapon) {
        player.equipment.weapon = "unarmed";
    }

    return player;
};

setup.addWeaponToInventory = function (weaponId) {
    const player = setup.ensurePlayerCombatData();

    if (!player) {
        return false;
    }

    if (!setup.weaponTemplates[weaponId]) {
        console.warn("Waffen-Template nicht gefunden:", weaponId);
        return false;
    }

    if (!player.inventory.weapons.includes(weaponId)) {
        player.inventory.weapons.push(weaponId);
    }

    return true;
};

setup.equipWeapon = function (weaponId) {
    const player = setup.ensurePlayerCombatData();

    if (!player) {
        return false;
    }

    if (!setup.weaponTemplates[weaponId]) {
        console.warn("Waffen-Template nicht gefunden:", weaponId);
        return false;
    }

    if (!player.inventory.weapons.includes(weaponId)) {
        console.warn("Waffe nicht im Inventar:", weaponId);
        return false;
    }

    player.equipment.weapon = weaponId;

    return true;
};

setup.getEquippedWeapon = function (unit) {
    const player = State.variables.player;

    let weaponRef = null;

    if (unit === player) {
        setup.ensurePlayerCombatData();
        weaponRef = player.equipment?.weapon;
    }
    else {
        weaponRef = unit?.weapon || unit?.equipment?.weapon;
    }

    if (typeof weaponRef === "string") {
        return setup.weaponTemplates[weaponRef] || setup.weaponTemplates.unarmed;
    }

    if (weaponRef && typeof weaponRef === "object") {
        return weaponRef;
    }

    return setup.weaponTemplates.unarmed;
};

/* --- Player Scaling --- */
setup.recalculatePlayerFightStats = function () {
    const player = setup.ensurePlayerCombatData();

    if (!player) {
        return;
    }

    /* Kampfwert kommt aus dem Skill-Lernsystem (knowledge.combat),
       NICHT mehr aus combatXp — sonst würde jeder Render den Wert überschreiben. */
    const combat = player.knowledge.combat || 0;

    const oldMaxHp = player.fightStats.maxHp || 12;
    const oldHp = player.fightStats.hp ?? oldMaxHp;
    const hpRatio = oldMaxHp > 0 ? oldHp / oldMaxHp : 1;

    const proficiency = 2 + Math.floor(combat / 4);
    const attack = Math.floor(combat / 3);
    const maxHp = 12 + combat * 2;
    const armor = 10 + Math.floor(combat / 4);

    player.fightStats.maxHp = maxHp;

    if (oldHp <= 0) {
        player.fightStats.hp = 0;
    }
    else {
        player.fightStats.hp = Math.max(1, Math.round(maxHp * hpRatio));
    }

    player.fightStats.attack = attack;
    player.fightStats.armor = armor;
    player.fightStats.proficiency = proficiency;
};

/* LEGACY-Brücke: leitet auf das Skill-Lernsystem um, damit die alten
   Kampf-Widgets (awardCombatRewards) weiter funktionieren, falls der
   Kampfmodus doch noch genutzt wird. ACHTUNG: enemy.xp-Werte sind auf
   die alte 100er-Kurve skaliert — bei Nutzung auf ~5-15 runterskalieren. */
setup.gainCombatXp = function (amount) {
    const player = setup.ensurePlayerCombatData();

    if (!player) {
        return null;
    }

    amount = amount || 0;

    const oldCombat = player.knowledge.combat || 0;
    setup.gainSkillXp("combat", amount);
    const newCombat = player.knowledge.combat || 0;

    setup.recalculatePlayerFightStats();

    return {
        xpGained: amount,
        oldXp: 0,
        newXp: 0,
        oldCombat: oldCombat,
        newCombat: newCombat,
        combatIncreased: newCombat > oldCombat
    };
};

/* --- Weakness --- */
setup.weaponHitsWeakness = function (attacker, defender) {
    const weapon = setup.getEquippedWeapon(attacker);

    if (!weapon || !weapon.skill) {
        return false;
    }

    return !!(defender && defender.weakness && defender.weakness === weapon.skill);
};

/* --- Combat Start ---
   Usage:
   <<set $combat = setup.startCombat(["mercenary"])>>
   <<set $combat = setup.startCombat(["mercenary", "shooter"])>> */
setup.startCombat = function (types) {
    setup.recalculatePlayerFightStats();

    if (!Array.isArray(types)) {
        console.warn("startCombat erwartet ein Array, z.B. ['mercenary']");
        return null;
    }

    const attackers = [];
    let xpReward = 0;

    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const template = State.variables.enemy[type];

        if (!template) {
            console.warn("Enemy template not found:", type);
            continue;
        }

        const enemyInstance = setup.clone(template);

        enemyInstance.id = type + "_" + i + "_" + random(1000, 9999);

        xpReward += enemyInstance.xp || 0;

        attackers.push(enemyInstance);
    }

    if (attackers.length === 0) {
        console.warn("Keine gültigen Gegner für diesen Kampf gefunden:", types);
        return null;
    }

    return {
        player: State.variables.player,
        attackers: attackers,
        defenders: [],
        log: [
            attackers.length > 1
                ? "Mehrere Gegner erscheinen!"
                : "Ein Gegner erscheint!"
        ],
        xpReward: xpReward,
        rewardsGiven: false,
        active: true,
        victory: false,
        defeat: false
    };
};

/* --- Hit Roll --- */
setup.combatHitRoll = function (attacker, defender) {
    const atk = setup.getFightStats(attacker);
    const def = setup.getFightStats(defender);
    const weapon = setup.getEquippedWeapon(attacker);

    if (!atk || !def) {
        return {
            roll: 0,
            bonus: 0,
            total: 0,
            armor: 0,
            outcome: "miss"
        };
    }

    const roll = random(1, 20);
    const bonus =
        (atk.attack || 0) +
        (atk.proficiency || 0) +
        (weapon.attackBonus || 0);

    const total = roll + bonus;
    const armor = def.armor || 10;

    if (roll === 20) {
        return {
            roll: roll,
            bonus: bonus,
            total: total,
            armor: armor,
            outcome: "crit"
        };
    }

    if (roll === 1) {
        return {
            roll: roll,
            bonus: bonus,
            total: total,
            armor: armor,
            outcome: "miss"
        };
    }

    return {
        roll: roll,
        bonus: bonus,
        total: total,
        armor: armor,
        outcome: total >= armor ? "hit" : "miss"
    };
};

/* --- Damage Roll --- */
setup.damageRoll = function (attacker, defender, hitRoll) {
    const weapon = setup.getEquippedWeapon(attacker);

    if (!weapon || !weapon.damage) {
        return 0;
    }

    if (hitRoll.outcome !== "hit" && hitRoll.outcome !== "crit") {
        return 0;
    }

    const count = weapon.damage.count || 1;
    const sides = weapon.damage.sides || 1;
    const damageBonus = weapon.damageBonus || 0;

    let diceCount = count;

    if (hitRoll.outcome === "crit") {
        diceCount *= 2;
    }

    let damage = setup.rollDice(diceCount, sides) + damageBonus;

    if (setup.weaponHitsWeakness(attacker, defender)) {
        damage += 2;
    }

    return Math.max(0, damage);
};

/* --- Attack Resolution --- */
setup.attack = function (attacker, defender) {
    const def = setup.getFightStats(defender);
    const weapon = setup.getEquippedWeapon(attacker);

    if (!def) {
        return {
            roll: 0,
            bonus: 0,
            total: 0,
            armor: 0,
            outcome: "miss",
            damage: 0,
            targetDead: false,
            weapon: weapon,
            weaknessHit: false
        };
    }

    const hitRoll = setup.combatHitRoll(attacker, defender);
    const damage = setup.damageRoll(attacker, defender, hitRoll);
    const weaknessHit = setup.weaponHitsWeakness(attacker, defender);

    if (damage > 0) {
        def.hp = Math.max(0, def.hp - damage);
    }

    return {
        roll: hitRoll.roll,
        bonus: hitRoll.bonus,
        total: hitRoll.total,
        armor: hitRoll.armor,
        outcome: hitRoll.outcome,
        damage: damage,
        targetDead: def.hp <= 0,
        weapon: weapon,
        weaknessHit: weaknessHit
    };
};

/* --- Player Attack --- */
setup.combatAttackEnemy = function (enemyId) {
    const combat = State.variables.combat;
    const player = State.variables.player;

    if (!combat) {
        console.warn("Kein Kampf aktiv.");
        return;
    }

    if (!combat.active) {
        return;
    }

    if (!player) {
        console.warn("Spieler nicht gefunden.");
        return;
    }

    const enemy = combat.attackers.find(e => e.id === enemyId);

    if (!enemy) {
        console.warn("Gegner nicht gefunden:", enemyId);
        return;
    }

    if (setup.isDead(enemy)) {
        combat.log.push(enemy.name + " ist bereits besiegt.");
        setup.trimCombatLog();
        return;
    }

    const result = setup.attack(player, enemy);

    if (result.outcome === "crit") {
        combat.log.push(
            "Kritischer Treffer mit " + result.weapon.name + " gegen " +
            enemy.name + "! (" + result.damage + " Schaden)"
        );
    }
    else if (result.outcome === "hit") {
        combat.log.push(
            "Treffer mit " + result.weapon.name + " gegen " +
            enemy.name + ". (" + result.damage + " Schaden)"
        );
    }
    else {
        combat.log.push(
            "Du verfehlst " + enemy.name + " mit " + result.weapon.name + "."
        );
    }

    if (result.weaknessHit && result.damage > 0) {
        combat.log.push(enemy.name + " ist gegen diese Waffe verwundbar!");
    }

    if (result.targetDead) {
        combat.log.push(enemy.name + " wurde besiegt!");
        combat.attackers = combat.attackers.filter(e => !setup.isDead(e));
    }

    if (combat.attackers.length === 0) {
        combat.active = false;
        combat.victory = true;
        combat.log.push("Der Kampf ist gewonnen.");

        setup.awardCombatRewards();

        setup.trimCombatLog();
        return;
    }

    setup.combatEnemyTurn();

    setup.trimCombatLog();
};

/* --- Enemy Turn --- */
setup.combatEnemyTurn = function () {
    const combat = State.variables.combat;
    const player = State.variables.player;

    if (!combat || !combat.active) {
        return;
    }

    if (!player || !player.fightStats) {
        console.warn("Spieler oder player.fightStats fehlt.");
        return;
    }

    if (setup.isDead(player)) {
        combat.active = false;
        combat.defeat = true;
        combat.log.push("Du gehst zu Boden.");
        return;
    }

    const livingEnemies = combat.attackers.filter(e => e && !setup.isDead(e));

    /*
       Balance:
       1 = ein Gegner greift pro Gegenzug an
       2 = maximal zwei Gegner greifen an
       Infinity = alle Gegner greifen an
    */
    const maxEnemyAttacks = 1;

    for (let i = 0; i < livingEnemies.length && i < maxEnemyAttacks; i++) {
        const enemy = livingEnemies[i];
        const result = setup.attack(enemy, player);

        if (result.outcome === "crit") {
            combat.log.push(
                enemy.name + " trifft dich kritisch mit " +
                result.weapon.name + "! (" + result.damage + " Schaden)"
            );
        }
        else if (result.outcome === "hit") {
            combat.log.push(
                enemy.name + " trifft dich mit " +
                result.weapon.name + ". (" + result.damage + " Schaden)"
            );
        }
        else {
            combat.log.push(
                enemy.name + " verfehlt dich mit " + result.weapon.name + "."
            );
        }

        if (result.targetDead) {
            combat.active = false;
            combat.defeat = true;
            combat.log.push("Du gehst zu Boden.");
            return;
        }
    }
};

/* --- Rewards --- */
setup.awardCombatRewards = function () {
    const combat = State.variables.combat;

    if (!combat || combat.rewardsGiven) {
        return;
    }

    combat.rewardsGiven = true;

    const xp = combat.xpReward || 0;

    if (xp <= 0) {
        return;
    }

    const result = setup.gainCombatXp(xp);

    combat.log.push("Du erhältst " + xp + " Kampferfahrung.");

    if (result && result.combatIncreased) {
        combat.log.push(
            "Dein Kampfwert steigt auf " + result.newCombat + "."
        );
    }
};

/* --- Log --- */
setup.trimCombatLog = function () {
    const combat = State.variables.combat;

    if (!combat || !combat.log) {
        return;
    }

    const maxEntries = 8;

    if (combat.log.length > maxEntries) {
        combat.log = combat.log.slice(combat.log.length - maxEntries);
    }
};

