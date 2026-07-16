
/* ================================================================
   SECTION 17  CHARAKTERBOGEN & JOURNAL
   ================================================================ */

/* --- Display Helpers --- */
setup.escapeHtml = function (value) {
    return String(value ?? "").replace(/[&<>"']/g, function (ch) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[ch];
    });
};

setup.formatSignedBonus = function (value) {
    value = Number(value || 0);

    if (value > 0) {
        return "+" + value;
    }

    return String(value);
};

setup.formatWeaponDamage = function (weapon) {
    if (!weapon || !weapon.damage) {
        return "—";
    }

    const count = weapon.damage.count || 1;
    const sides = weapon.damage.sides || 1;
    const bonus = weapon.damageBonus || 0;

    let text = count + "W" + sides;

    if (bonus > 0) {
        text += " + " + bonus;
    }
    else if (bonus < 0) {
        text += " - " + Math.abs(bonus);
    }

    return text;
};

setup.getInventoryItems = function (player) {
    if (!player || !player.inventory) {
        return [];
    }

    /*
       Altes Format:  inventory: ["Apfel", "Seil"]
       Neues Format:  inventory: { items: [], weapons: [] }
    */
    if (Array.isArray(player.inventory)) {
        return player.inventory;
    }

    return player.inventory.items || [];
};

setup.getInventoryWeapons = function (player) {
    if (!player || !player.inventory) {
        return [];
    }

    if (Array.isArray(player.inventory)) {
        return [];
    }

    return player.inventory.weapons || [];
};

setup.refreshPlayerTable = function () {
    const el = document.getElementById("player-table");

    if (el) {
        el.innerHTML = setup.renderPlayerTable();
    }
};

/* --- Pip-Leiste --- */
setup.meter = function (value, max, pips) {
    const total = Math.max(1, pips || 10);
    const cap = Math.max(1, Number(max) || 100);
    const v = Math.max(0, Math.min(cap, Number(value) || 0));
    const full = Math.round((v / cap) * total);
    let out = "";
    for (let i = 0; i < total; i++) {
        out += `<span class="pip ${i < full ? "pip-full" : "pip-empty"}"></span>`;
    }
    return `<span class="meter">${out}</span>`;
};

/* Obergrenzen der WERTE (nicht der Pip-Anzahl) — an eure Skalen anpassen */
setup.meterMax = { stat: 100, knowledge: 10 };

setup.renderSkillXpBar = function (key) {
    if (setup.skillLernbar.indexOf(key) === -1) return "";
    var p = State.variables.player;
    var pool = setup.ensureSkillXp();
    var lvl = (p.knowledge && p.knowledge[key]) || 0;
    if (lvl >= 10) {
        return `<div class="skill-xp skill-xp-max">Meisterschaft — kein weiterer Fortschritt möglich</div>`;
    }
    var xp = pool[key] || 0;
    var need = setup.skillLernkosten(lvl);
    var pct = Math.max(0, Math.min(100, Math.round(xp / need * 100)));
    return `
        <div class="skill-xp">
            <div class="skill-xp-track"><div class="skill-xp-fill" style="width:${pct}%"></div></div>
            <span class="skill-xp-num">${xp} / ${need} XP</span>
        </div>`;
};

/* --- Kampf-XP-Balken --- */
/* Fortschrittsbalken im Charakterbogen — liest jetzt den Übungs-Pool
   des Skill-Lernsystems (skillXp.combat) statt der alten combatXp-Kurve. */
setup.getCombatXpProgress = function (player) {
    if (!player) {
        return {
            combat: 0, xp: 0, currentThreshold: 0, nextThreshold: 10,
            xpIntoLevel: 0, xpNeeded: 10, percent: 0, isMax: false
        };
    }

    const pool = setup.ensureSkillXp();
    const combat = player.knowledge?.combat || 0;
    const isMax = combat >= 10;

    if (isMax) {
        return {
            combat: 10, xp: pool.combat, currentThreshold: 0, nextThreshold: 0,
            xpIntoLevel: 0, xpNeeded: 0, percent: 100, isMax: true
        };
    }

    const xpIntoLevel = pool.combat;
    const xpNeeded = Math.max(1, setup.skillLernkosten(combat));
    const percent = Math.max(0, Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)));

    return {
        combat: combat,
        xp: pool.combat,
        currentThreshold: 0,
        nextThreshold: xpNeeded,
        xpIntoLevel: xpIntoLevel,
        xpNeeded: xpNeeded,
        percent: percent,
        isMax: false
    };
};

setup.renderCombatXpBar = function (player) {
    const progress = setup.getCombatXpProgress(player);

    if (progress.isMax) {
        return `
            <div class="combat-xp-display">
                <div class="combat-xp-bar">
                    <div class="combat-xp-fill" style="width: 100%;"></div>
                </div>
                <span class="combat-xp-text">
                    Maximum
                </span>
            </div>
        `;
    }

    return `
        <div class="combat-xp-display">
            <div class="combat-xp-bar">
                <div class="combat-xp-fill" style="width: ${progress.percent}%;"></div>
            </div>
            <span class="combat-xp-text">
                ${progress.xpIntoLevel}/${progress.xpNeeded} XP · ${progress.percent}%
            </span>
        </div>
    `;
};

/* Kompakte Personenliste: nur Name + Zuneigung, gruppiert nach Fraktion */
setup.renderPersonListCompact = function (list, emptyMsg) {
    if (!list || list.length === 0) {
        return `<p class="journal-empty">${emptyMsg || "Noch kenne ich niemanden näher."}</p>`;
    }
    const groups = {};
    list.forEach(n => {
        const f = n.faction || "Akademie zu Ohm";
        (groups[f] = groups[f] || []).push(n);
    });
    const byAffThenName = (a, b) =>
        (b.affection - a.affection) || a.name.localeCompare(b.name, "de");
    let out = "";
    Object.keys(groups).sort((a, b) => a.localeCompare(b, "de")).forEach(faction => {
        out += `<div class="journal-group"><div class="journal-group-title">${faction}</div>`;
        groups[faction].sort(byAffThenName).forEach(n => {
            const aff = setup.getAffectionLabel(n.affection);
            out += `
                <div class="npc-row-compact">
                    <span class="npc-name">${n.name}</span>
                    <span class="npc-meta">${aff} <span class="npc-affection-val">(${n.affection})</span></span>
                </div>`;
        });
        out += `</div>`;
    });
    return out;
};

setup.renderJournalCompact = function () {
    const npcs = State.variables.npc || {};
    const list = Object.keys(npcs).map(k => npcs[k])
        .filter(n => n.known === true && n.isRealPlayer !== true);
    return setup.renderPersonListCompact(list, "Noch kenne ich niemanden näher.");
};

setup.renderRealPlayersCompact = function () {
    const npcs = State.variables.npc || {};
    const list = Object.keys(npcs).map(k => npcs[k])
        .filter(n => n.known === true && n.isRealPlayer === true);
    return setup.renderPersonListCompact(list, "Noch bist du keinem dieser Namen begegnet.");
};

/* Ermittlungstagebuch */
setup.ermittlungBekannt = function () {
    const e = State.variables.world.ermittlung;
    return !!(e && (e.active || (e.spuren && e.spuren.length > 0)));
};

setup.verdachtLabel = function (v) {
    v = Number(v) || 0;
    if (v >= 8) return "dringend verdächtig";
    if (v >= 4) return "verdächtig";
    if (v >= 1) return "auffällig";
    if (v <= -4) return "entlastet";
    if (v <= -1) return "eher unverdächtig";
    return "unklar";
};
/* Ermittlungsakte — visueller Aktendeckel aus world.ermittlung */
setup.renderErmittlungsakte = function () {
    const e = State.variables.world.ermittlung;
    if (!e || (!e.active && (!e.spuren || e.spuren.length === 0))) {
        return `<p class="journal-empty">Noch liegt keine Akte an.</p>`;
    }
    const npcs = State.variables.npc || {};
    let out = `<div class="akte">`;

    /* Aktendeckel */
    out += `<div class="akte-kopf">`;
    out += `<div class="akte-stempel">Vertraulich</div>`;
    out += `<div class="akte-titel">Ermittlungsakte</div>`;
    out += `<div class="akte-sub">84. Banner &middot; Stufe ${e.stufe || 0}</div>`;
    if (e.motiv) out += `<div class="akte-motiv">Vermutetes Motiv: <span>${e.motiv}</span></div>`;
    out += `</div>`;

    /* Verdächtige */
    const vKeys = e.verdacht ? Object.keys(e.verdacht).filter(k => (e.verdacht[k] || 0) !== 0) : [];
    out += `<div class="akte-block"><div class="akte-block-titel">Verdächtige</div>`;
    if (vKeys.length === 0) {
        out += `<div class="akte-leer">Noch fällt der Verdacht auf niemanden.</div>`;
    } else {
        out += `<div class="akte-karten">`;
        vKeys.sort((a, b) => (e.verdacht[b] || 0) - (e.verdacht[a] || 0)).forEach(k => {
            const npc = npcs[k] || {};
            const name = npc.name || k;
            const v = setup.clamp(e.verdacht[k] || 0, -10, 10);
            const pct = Math.round(((v + 10) / 20) * 100);
            const stufe = v >= 8 ? "akut" : v >= 4 ? "hoch" : v >= 1 ? "leicht" : v <= -1 ? "entlastet" : "neutral";
            const img = npc.imageKap2 || npc.image || "";
            const fotoStyle = img ? ` style="background-image:url('${img}')"` : "";
            out += `<div class="akte-karte akte-karte-${stufe}">`;
            out += `<div class="akte-foto"${fotoStyle}></div>`;
            out += `<div class="akte-karte-txt">`;
            out += `<div class="akte-name">${name}</div>`;
            out += `<div class="akte-vlabel">${setup.verdachtLabel(v)}</div>`;
            out += `<div class="akte-meter"><div class="akte-meter-fill akte-meter-${stufe}" style="width:${pct}%"></div></div>`;
            out += `</div></div>`;
        });
        out += `</div>`;
    }
    out += `</div>`;

    /* Gesicherte Spuren — angepinnte Zettel */
    out += `<div class="akte-block"><div class="akte-block-titel">Gesicherte Spuren</div>`;
    if (!e.spuren || e.spuren.length === 0) {
        out += `<div class="akte-leer">Noch keine Spur gesichert.</div>`;
    } else {
        out += `<div class="akte-zettel-feld">`;
        e.spuren.forEach((id, i) => {
            const label = (e.spurenText && e.spurenText[id]) || id;
            out += `<div class="akte-zettel akte-zettel-${i % 3}"><span class="akte-pin"></span>${label}</div>`;
        });
        out += `</div>`;
    }
    out += `</div>`;

    /* Erledigte Schritte (aus sN_done-Flags) */
    const steps = Object.keys(e.flags || {})
        .filter(f => /^s\d+_done$/.test(f) && e.flags[f])
        .map(f => Number(f.match(/^s(\d+)_done$/)[1]))
        .sort((a, b) => a - b);
    if (steps.length) {
        out += `<div class="akte-block"><div class="akte-block-titel">Erledigte Schritte</div><div class="akte-schritte">`;
        steps.forEach(n => { out += `<span class="akte-schritt">&#10004; S${n}</span>`; });
        out += `</div></div>`;
    }

    out += `</div>`;
    return out;
};

setup.renderErmittlungstagebuch = function () {
    const e = State.variables.world.ermittlung;
    if (!e || (!e.active && (!e.spuren || e.spuren.length === 0))) {
        return `<p class="journal-empty">Noch gibt es nichts zu ermitteln.</p>`;
    }
    const npcs = State.variables.npc || {};
    let out = "";

    out += `<div class="erm-section"><div class="erm-title">Stand der Ermittlung</div>`;
    out += `<div class="erm-line">Stufe: <b>${e.stufe || 0}</b></div>`;
    if (e.motiv) out += `<div class="erm-line">Vermutetes Motiv: ${e.motiv}</div>`;
    out += `</div>`;

    out += `<div class="erm-section"><div class="erm-title">Spuren &amp; Funde</div>`;
    if (!e.spuren || e.spuren.length === 0) {
        out += `<div class="erm-line erm-empty">Noch keine Spur gesichert.</div>`;
    } else {
        e.spuren.forEach(id => {
            const label = (e.spurenText && e.spurenText[id]) || id;
            out += `<div class="erm-fund">🔍 ${label}</div>`;
        });
    }
    out += `</div>`;

    const vKeys = e.verdacht ? Object.keys(e.verdacht) : [];
    if (vKeys.length > 0) {
        out += `<div class="erm-section"><div class="erm-title">Verdacht</div>`;
        vKeys.sort((a, b) => (e.verdacht[b] || 0) - (e.verdacht[a] || 0)).forEach(k => {
            const name = (npcs[k] && npcs[k].name) || k;
            const v = e.verdacht[k] || 0;
            out += `<div class="erm-line"><span class="erm-name">${name}</span> — ${setup.verdachtLabel(v)} <span class="npc-affection-val">(${v})</span></div>`;
        });
        out += `</div>`;
    }
    return out;
};

setup.noJournalPages = [
    "Intro",
    "Das Erwachen",
    "journalAnsicht",
    "Notizbuch_Personen",
    "Notizbuch_Kameraden",
    "Notizbuch_Geruechte",
    "Notizbuch_Ermittlung",
    "Nachmittag Pike",
    "Nachmittag Cannon",
    "Nachmittag Medicine",
    "Nachmittag Crossbow",
    "Nachmittag Thievery"
];

/* --- Player Table Render ---
   Ohne: Fullname, Kampfwerte-Block, Ausgerüstete-Waffe-Block
   Mit:  Waffenliste, Radio-Button zum Ausrüsten, kein inline onchange */
setup.renderPlayerTable = function () {
    const p = State.variables.player;

    if (!p) {
        return `
            <div class="stat-section">
                <div class="stat-section-title">Spieler</div>
                <div class="stat-row stat-empty">Kein Spieler gefunden.</div>
            </div>
        `;
    }

    /*
       Combat-Daten absichern und Kampfwerte neu berechnen.
       Die Werte werden NICHT angezeigt, aber intern aktuell gehalten.
    */
    if (setup.ensurePlayerCombatData) {
        setup.ensurePlayerCombatData();
    }

    if (setup.recalculatePlayerFightStats) {
        setup.recalculatePlayerFightStats();
    }

    const esc = setup.escapeHtml;

    const mx = setup.meterMax || {
        stat: 100,
        knowledge: 10
    };

    const stats = p.stats || {};
    const knowledge = p.knowledge || {};
    const reputation = p.reputation || {};
    const moneyObj = p.money || { copper: 0 };

    const money = setup.getMoney
        ? setup.getMoney(moneyObj.copper || 0)
        : { gold: 0, silver: 0, copper: moneyObj.copper || 0 };

    const row = function (label, value) {
        return `
            <div class="stat-row">
                <span class="stat-label">${label}</span>
                <span class="stat-val">${value}</span>
            </div>
        `;
    };

    const meterRow = function (label, value, max) {
        value = value || 0;
        max = max || 10;

        const meter = setup.meter
            ? setup.meter(value, max)
            : "";

        return row(
            label,
            `${meter} <span class="stat-num">${value}</span>`
        );
    };

    const knowledgeRow = function (label, key) {
        const value = knowledge[key] || 0;
        const meter = setup.meter ? setup.meter(value, mx.knowledge) : "";
        return `
            <div class="stat-row stat-skill">
                <span class="stat-label">${label}</span>
                <span class="stat-val">${meter} <span class="stat-num">${value}</span></span>
            </div>
            ${setup.renderSkillXpBar(key)}`;
    };

    const repRow = function (label, value) {
        value = value || 0;

        const repLabel = setup.getReputationLabel
            ? setup.getReputationLabel(value)
            : String(value);

        return row(
            label,
            `${repLabel} <span class="stat-num">(${value})</span>`
        );
    };

    const konditionLabel = setup.getKonditionLabel
        ? setup.getKonditionLabel(p.condition || 0)
        : String(p.condition || 0);

    const items = setup.getInventoryItems(p);
    const weapons = setup.getInventoryWeapons(p);

    const equippedWeaponId = p.equipment?.weapon || "unarmed";

    const inventoryHTML = items.length === 0
        ? `<div class="stat-row stat-empty">Inventar ist leer</div>`
        : items.map(function (it) {
            return `
                <div class="stat-row stat-item">
                    <span class="stat-label">${esc(it)}</span>
                    <span class="stat-val"></span>
                </div>
            `;
        }).join("");

    const weaponInventoryHTML = weapons.length === 0
        ? `<div class="stat-row stat-empty">Keine Waffen im Inventar</div>`
        : weapons.map(function (weaponId) {
            const weapon = setup.weaponTemplates?.[weaponId];

            if (!weapon) {
                return `
                    <div class="stat-row stat-weapon stat-error">
                        <span class="stat-label">${esc(weaponId)}</span>
                        <span class="stat-val">Unbekannte Waffe</span>
                    </div>
                `;
            }

            const isEquipped = equippedWeaponId === weaponId;
            const checked = isEquipped ? "checked" : "";
            const equippedClass = isEquipped ? " equipped" : "";

            const damageText = setup.formatWeaponDamage(weapon);
            const attackBonusText = setup.formatSignedBonus(weapon.attackBonus || 0);
            const skillText = weapon.skill ? esc(weapon.skill) : "—";

            return `
                <div class="stat-row stat-weapon${equippedClass}">
                    <span class="stat-label">
                        <input
                            type="radio"
                            class="js-equip-weapon"
                            name="player-equipped-weapon"
                            value="${esc(weaponId)}"
                            ${checked}
                        >
                        ${esc(weapon.name)}
                    </span>

                    <span class="stat-val">
                        Schaden ${damageText}
                        · Treffer ${attackBonusText}
                        · Stil ${skillText}
                        ${isEquipped ? `· <b>ausgerüstet</b>` : ""}
                    </span>
                </div>
            `;
        }).join("");

    return `
        <div class="stat-section">
         <div class="stat-section-title">Persönliches</div>
            ${row("Name", esc(p.name))}
            ${row("Rang", esc(p.rank))}
            ${knowledgeRow("Kampferfahrung", "combat")}
        </div>

        <div class="stat-section">
            <div class="stat-section-title">Zustand</div>
            ${row("Kondition", `${konditionLabel} <span class="stat-num">(${p.condition || 0})</span>`)}
            ${row("Verdacht", esc(p.suspicion || 0))}
        </div>

        <div class="stat-section">
            <div class="stat-section-title">Charaktereigenschaften</div>
            ${meterRow("Gnade", stats.mercy, mx.stat)}
            ${meterRow("Ehrgeiz", stats.ambition, mx.stat)}
            ${meterRow("Ehrlichkeit", stats.honesty, mx.stat)}
            ${meterRow("Disziplin", stats.discipline, mx.stat)}
            ${meterRow("Glaube", stats.faith, mx.stat)}
        </div>

		<div class="stat-section">
            <div class="stat-section-title">Wissen</div>
            ${knowledgeRow("Pike & Hellebarde", "pike")}
            ${knowledgeRow("Artillerie-Wissen", "cannon")}
            ${knowledgeRow("Armbrust-Präzision", "crossbow")}
            ${knowledgeRow("Heilkunde", "medicine")}
            ${knowledgeRow("Schattenarbeit", "thievery")}
            ${knowledgeRow("Gerüchteküche", "gossip")}
            ${knowledgeRow("Kampferfahrung", "combat")}
            ${knowledgeRow("Wahrnehmung", "perception")}
            ${row("Gelehrsamkeit", `<b>${stats.scholarship || 0}</b>`)}
        </div>

        <div class="stat-section">
            <div class="stat-section-title">Reputation</div>
            ${repRow("Land", reputation.land)}
            ${repRow("Ohm", reputation.ohm)}
            ${repRow("Kirche", reputation.church)}
        </div>

        <div class="stat-section">
            <div class="stat-section-title">Finanzen</div>
            ${row("Vermögen", `${money.gold} Gold · ${money.silver} Silber · ${money.copper} Kupfer`)}
        </div>

        <div class="stat-section">
            <div class="stat-section-title">Inventar</div>
            ${inventoryHTML}
        </div>
    `;
};

/* --- Player Table Events ---
   Bindet Radiobuttons für Waffenwechsel. Kein inline onchange. */
setup.bindPlayerTableEvents = function () {
    if (setup._playerTableEventsBound) {
        return;
    }

    setup._playerTableEventsBound = true;

    document.addEventListener("change", function (ev) {
        const input = ev.target.closest?.(".js-equip-weapon");

        if (!input) {
            return;
        }

        const weaponId = input.value;

        if (setup.equipWeapon(weaponId)) {
            setup.refreshPlayerTable();
        }
        else {
            console.warn("Waffe konnte nicht ausgerüstet werden:", weaponId);
            setup.refreshPlayerTable();
        }
    });
};

setup.bindPlayerTableEvents();

/* --- Personen-Journal --- */

/* Mitwachsender Journaleintrag: String = fest; Array von {min?, flag?, text} = gestuft.
   Es greift die LETZTE Stufe, deren Bedingungen erfüllt sind (Zuneigung >= min UND flag gesetzt). */
setup.resolveJournalEntry = function (npc) {
    const je = npc.journalEntry;
    if (typeof je === "string") return je;
    if (Array.isArray(je)) {
        let text = (je[0] && je[0].text) || "";
        je.forEach(stage => {
            const minOk = (stage.min == null) || (npc.affection >= stage.min);
            const flagOk = (!stage.flag) || !!(npc.memory && npc.memory.flags && npc.memory.flags[stage.flag]);
            if (minOk && flagOk) text = stage.text;
        });
        return text;
    }
    return "";
};

/* Gemeinsamer Karten-Renderer für eine beliebige Personenliste */
setup.renderPersonList = function (list, emptyMsg) {
    if (!list || list.length === 0) {
        return `<p class="journal-empty">${emptyMsg || "Noch kenne ich niemanden näher."}</p>`;
    }
    const esc = setup.escapeHtml;
    const groups = {};
    list.forEach(n => {
        const f = n.faction || "Akademie zu Ohm";
        (groups[f] = groups[f] || []).push(n);
    });
    const byAffThenName = (a, b) =>
        (b.affection - a.affection) || a.name.localeCompare(b.name, "de");
    let out = "";
    Object.keys(groups).sort((a, b) => a.localeCompare(b, "de")).forEach(faction => {
        out += `<div class="journal-group"><div class="journal-group-title">${faction}</div>`;
        groups[faction].sort(byAffThenName).forEach(n => {
            const aff = setup.getAffectionLabel(n.affection);
            const trust = (n.trust === true || (typeof n.trust === "number" && n.trust > 0))
                ? `<span class="npc-trust">🤝 Vertrauen</span>` : "";
            const src = setup.resolveNpcImage(n);
            const portrait = src
                ? `<img class="npc-portrait" src="${esc(src)}" alt="${esc(n.name)}" onerror="this.style.display='none'">`
                : "";
            out += `
                <div class="npc-card">
                    ${portrait}
                    <div class="npc-card-body">
                        <div class="npc-card-head">
                            <span class="npc-name">${n.name}</span>${trust}
                        </div>
                        <div class="npc-entry-text">${setup.resolveJournalEntry(n)}</div>
                        <div class="npc-meta">${aff} <span class="npc-affection-val">(${n.affection})</span></div>
                    </div>
                </div>`;
        });
        out += `</div>`;
    });
    return out;
};

setup.resolveNpcImage = function (n) {
    if (!n) return "";
    var kap2 = State.variables.world.kapitel1_gesperrt === true;
    if (n.name === "Karla" && n.memory.flags.verhaftung_seen) return n.imageVerhaftet || "";
    if (kap2 && n.imageKap2) return n.imageKap2;
    return n.image || "";
};

/* Akademie-Personen (keine echten Spieler) */
setup.renderJournal = function () {
    const npcs = State.variables.npc || {};
    const list = Object.keys(npcs).map(k => npcs[k])
        .filter(n => n.known === true && n.isRealPlayer !== true);
    return setup.renderPersonList(list, "Noch kenne ich niemanden näher.");
};

/* Echte Spielercharaktere */
setup.renderRealPlayers = function () {
    const npcs = State.variables.npc || {};
    const list = Object.keys(npcs).map(k => npcs[k])
        .filter(n => n.known === true && n.isRealPlayer === true);
    return setup.renderPersonList(list, "Noch bist du keinem dieser Namen begegnet.");
};

setup.notizbuch = function (seite) {
    seite = seite || "journalAnsicht";
    var quelle = Story.get(seite).text;   // Rohtext der Passage
    if (Dialog.isOpen()) {                // schon offen -> nur Inhalt tauschen (Tab-Wechsel)
        $(Dialog.body()).empty();
        Dialog.wiki(quelle);
    } else {                             // erstmalig -> aufsetzen + öffnen
        Dialog.setup("Notizbuch", "notizbuch-dialog");
        Dialog.wiki(quelle);
        Dialog.open();
    }
    return "";
};


setup.migrateNpcImages = function () {
    const npc = State.variables.npc;

    if (!npc) {
        return;
    }

    if (npc.karla) {
        npc.karla.image = npc.karla.image || "images/Karla_Kap1.png";
        npc.karla.imageKap2 = npc.karla.imageKap2 || "images/Karla_Kap2.jpg";
        npc.karla.imageVerhaftet = npc.karla.imageVerhaftet || "images/Karla_verhaftet.png";
    }

    if (npc.jarek) {
        npc.jarek.image = npc.jarek.image || "images/Jarek.png";

        /*
           Jareks Kapitel-2-Bild IST das Fluchtbild.
        */
        npc.jarek.imageKap2 = npc.jarek.imageKap2 || "images/Jarek_Kap2.png";
    }
};

setup.addNpcJournalEntry = function (npcId, text, options = {}) {
    const npc = State.variables.npc?.[npcId];

    if (!npc) {
        console.warn("NPC nicht gefunden:", npcId);
        return false;
    }

    if (!text) {
        return false;
    }

    if (npc.journalEntry == null) {
        npc.journalEntry = "";
    }

    const separator = options.separator ?? "<br><br>";
    const avoidDuplicate = options.avoidDuplicate ?? true;

    if (avoidDuplicate && npc.journalEntry.includes(text)) {
        return false;
    }

    npc.journalEntry += separator + text;

    return true;
};