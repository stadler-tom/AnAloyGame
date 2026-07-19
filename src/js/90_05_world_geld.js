

/* ================================================================
   SECTION 07  WORLD & TAGESWECHSEL
   ================================================================ */

setup.weatherConditions = [
    "sonnig", "klar", "heiter",
    "wolkig", "bewoelkt", "stark_bewoelkt",
    "regen", "schauer", "nieselregen",
    "frostig", "windig", "gewitter", "neblig", "schwuel"
];

setup.resetDailyVariables = function () {
    const world = State.variables.world;
    const player = State.variables.player;
    world.weather = setup.weatherConditions[Math.floor(Math.random() * setup.weatherConditions.length)];
    world.wasPracticing = false;
    world.day += 1;

    // Werte VOR der Änderung merken
    const condBefore = player.condition;
    const suspBefore = player.suspicion;
    const konditionDelta = player.hasSlept ? 10 : -10;
    var konditionDeltaBinge = 0;
    switch (player.trinken) {
        case 1: konditionDeltaBinge = -5; break;
        case 2: konditionDeltaBinge = -10; break;
        case 3: konditionDeltaBinge = -15; break;
        default: konditionDeltaBinge = 0; break;
    }
    
    player.condition = setup.clamp(player.condition + konditionDelta + konditionDeltaBinge, 0, 100);

    /* Disziplin formt den Tag: Ordnung schenkt Schlaf, Schlamperei kostet den Vormittag */
    var disziplinBonus = false;
    var zusatzdienst = false;
    var disziplin = (player.stats && typeof player.stats.discipline === "number") ? player.stats.discipline : 50;
    if (player.hasSlept && disziplin >= 65) {
        player.condition = setup.clamp(player.condition + 2, 0, 100);
        disziplinBonus = true;
    }
    if (disziplin <= 35 && random(1, 100) <= 20) {
        zusatzdienst = true;
    }

    setup.tickSidequestDruck();

    // Suspicion nur abbauen, wenn sie heute NICHT gestiegen ist
    const startOfDay = (world.suspicionDayStart !== undefined) ? world.suspicionDayStart : suspBefore;
    const roseToday = player.suspicion > startOfDay;
    if (!roseToday) {
        player.suspicion = setup.clamp(player.suspicion - 2, 0, 100);
    }
    // Startwert für den neuen Tag festhalten
    world.suspicionDayStart = player.suspicion;

    // Tagesbericht ablegen: echte Differenzen (nach dem Clampen)
    world.tagesbericht = {
        condition: player.condition - condBefore,
        suspicion: player.suspicion - suspBefore,
        hasSlept: player.hasSlept,
        disziplinBonus: disziplinBonus,
        zusatzdienst: zusatzdienst
    };
    world.interruptDoneToday = false;
    world.tagesAktionen = 0;    /* Kap2: zwei freie Unternehmungen pro Tag */
    if (zusatzdienst) { world.tagesAktionen = 1; }  /* der Vormittag gehört dem Weibel */
    world.abendAktion = false;  /* Kap2: eine Abend-Aktion pro Tag */
    world.schenkeRueckweg = ""; /* Kap2: Schenke-Rücksprung (Tag/Abend) zurücksetzen */
    world.wuerfelSpiel.gespielt = 0; /* Kap2: WürfelspielCounter zurücksetzen */
    world.wuerfelSpiel.cheat = 0; /* Kap2: WürfelspielCheat zurücksetzen */
    world.kirchenBesuch = false; /* Kap2: Kirchenbesuch zurücksetzen */
    world.flags.barsingerEncounter = false; /* Barsinger encounter in schenke zurücksetzten */
    player.trinken = 0; /* Kap2: Trinken zurücksetzen */

    setup.tickKarlaDruck();
};

setup.renderTagesbericht = function () {
    const b = State.variables.world?.tagesbericht;
    if (!b) return "";

    let out = "";

    if (b.condition > 0) {
        out += '<div class="system-alert status-positive">Erholsamer Schlaf — Kondition +' + b.condition + ' (' + setup.getKonditionLabel(State.variables.player.condition) + ')</div>';
    } else if (b.condition < 0) {
        out += '<div class="system-alert status-negative">Unruhige Nacht — Kondition ' + b.condition + ' (' + setup.getKonditionLabel(State.variables.player.condition) + ')</div>';
    }

    if (b.suspicion < 0) {
        out += '<div class="system-alert status-positive">Du bist eine Weile nicht aufgefallen — Verdacht ' + b.suspicion + '</div>';
    }

    if (b.disziplinBonus) {
        out += '<div class="system-alert status-positive">Geordnetes Zeug, geordneter Schlaf — deine Disziplin schenkt dir Kraft (+2 Kondition)</div>';
    }

    if (b.zusatzdienst) {
        out += '<div class="system-alert status-negative">Der Weibel hat deinen Spind gesehen. Zusatzdienst — der Vormittag gehört nicht dir (eine Unternehmung weniger)</div>';
    }

    return out;
};




/* Passagen mit Tag "tagesstart" lösen den Tageswechsel aus */
predisplay["tagesstart"] = function () {
    if (tags().includes("tagesstart")) {
        setup.resetDailyVariables();
    }
};

/* Journal-Sperrliste */
setup.noJournalPages = [
    "Intro",
    "Das Erwachen",
    "journalAnsicht",
    "Nachmittag Pike",
    "Nachmittag Cannon",
    "Nachmittag Medicine",
    "Nachmittag Crossbow",
    "Nachmittag Thievery"
];

setup.isJournalBlocked = function () {
    const p = passage();

    // feste Sperrliste
    if (setup.noJournalPages.includes(p)) {
        return true;
    }

    // dynamisch: Kapitel 1, Kapitel 2, ...
    if (p.startsWith("Kapitel")) {
        return true;
    }

    return false;
};


/* ================================================================
   SECTION 08  GELD
   ================================================================ */

setup.money = {
    copperPerSilver: 7,
    silverPerGold: 10
};

setup.getMoney = function (copper) {
    let silver = Math.floor(copper / setup.money.copperPerSilver);
    let gold = Math.floor(silver / setup.money.silverPerGold);

    silver = silver % setup.money.silverPerGold;
    copper = copper % setup.money.copperPerSilver;

    return {
        gold,
        silver,
        copper
    };
};

setup.canAffordMoney = function (copperAmount) {
    const player = State.variables.player;
    return !!(player && player.money && player.money.copper >= Math.abs(copperAmount));
};

setup.addMoney = function (copperAmount) {
    const player = State.variables.player;
    if (!player || !player.money || typeof player.money.copper !== "number") {
        console.warn("player.money.copper nicht gefunden");
        return "";
    }

    player.money.copper = Math.max(0, player.money.copper + Math.abs(copperAmount));

    const m = setup.getMoney(Math.abs(copperAmount));
    const parts = [];
    if (m.gold > 0) parts.push(m.gold + " Gold");
    if (m.silver > 0) parts.push(m.silver + " Silber");
    if (m.copper > 0 || parts.length === 0) parts.push(m.copper + " Kupfer");

    return '<div class="system-alert status-positive">' + parts.join(", ") + " erhalten</div>";
};

setup.removeMoney = function (copperAmount) {
    const player = State.variables.player;
    if (!player || !player.money || typeof player.money.copper !== "number") {
        console.warn("player.money.copper nicht gefunden");
        return "";
    }

    const amount = Math.abs(copperAmount);
    const affordable = setup.canAffordMoney(amount);

    player.money.copper = Math.max(0, player.money.copper - amount);

    const m = setup.getMoney(amount);
    const parts = [];
    if (m.gold > 0) parts.push(m.gold + " Gold");
    if (m.silver > 0) parts.push(m.silver + " Silber");
    if (m.copper > 0 || parts.length === 0) parts.push(m.copper + " Kupfer");

    if (!affordable) {
        return '<div class="system-alert status-negative">Nicht genug Geld — ' + parts.join(", ") + " wären nötig gewesen, das meiste ausgegeben</div>";
    }
    return '<div class="system-alert status-negative">' + parts.join(", ") + " ausgegeben</div>";
};

/* Geld verlieren (nur was da ist, ohne Vorwurf) */
setup.loseMoneyBak = function (copperAmount) {
    const player = State.variables.player;
    if (!player || !player.money || typeof player.money.copper !== "number") {
        console.warn("player.money.copper nicht gefunden");
        return "";
    }

    const amount = Math.abs(copperAmount);
    const actuallyLost = Math.min(amount, player.money.copper);

    player.money.copper = Math.max(0, player.money.copper - amount);

    if (actuallyLost <= 0) {
        return ""; // nichts zu verlieren, keine Meldung nötig
    }

    const m = setup.getMoney(actuallyLost);
    const parts = [];
    if (m.gold > 0) parts.push(m.gold + " Gold");
    if (m.silver > 0) parts.push(m.silver + " Silber");
    if (m.copper > 0 || parts.length === 0) parts.push(m.copper + " Kupfer");

    return '<div class="system-alert status-negative">' + parts.join(", ") + " verloren</div>";
};

setup.loseMoney = function (copperAmount) {
    const player = State.variables.player;

    if (!player?.money || typeof player.money.copper !== "number") {
        console.warn("player.money.copper nicht gefunden");
        return "";
    }

    const amount = Math.abs(copperAmount);
    const actuallyLost = Math.min(amount, player.money.copper);

    console.log

    player.money.copper -= actuallyLost;

    if (actuallyLost <= 0) return "";

    const m = setup.getMoney(actuallyLost);

    const parts = [];
    if (m.gold > 0) parts.push(m.gold + " Gold");
    if (m.silver > 0) parts.push(m.silver + " Silber");
    if (m.copper > 0 || parts.length === 0) parts.push(m.copper + " Kupfer");

    return `<div class="system-alert status-negative">${parts.join(", ")} verloren</div>`;
};

/* ===== ALERT-WARTESCHLANGE =====
   Für Effekte unmittelbar vor einem <<goto>>: Meldung merken,
   sie erscheint automatisch oben auf der NÄCHSTEN Passage.
   Verwendung: <<run setup.queueAlert(setup.setPlayerStat("discipline", 1))>> */
setup.queueAlert = function (html) {
    if (!html) return "";
    var w = State.variables.world;
    if (!Array.isArray(w.pendingAlerts)) w.pendingAlerts = [];
    w.pendingAlerts.push(html);
    return "";
};

postrender["pending-alerts"] = function (content) {
    var w = State.variables.world;
    if (w && Array.isArray(w.pendingAlerts) && w.pendingAlerts.length) {
        jQuery(content).prepend(w.pendingAlerts.join(""));
        w.pendingAlerts = [];
    }
};
