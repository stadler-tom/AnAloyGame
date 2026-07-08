
/* ================================================================
   SECTION 06  SIDEQUESTS & DRUCK-SYSTEM
   ================================================================ */

setup.sidequests = {
    //karla_01: { npc: "karla", threshold: 5, completeFlag: "sidequest00Complete", start: "00_Sidequest_karla", priority: 10 },
    //jarek_01: { npc: "jarek", threshold: 5, completeFlag: "sidequest01Complete", start: "01_Sidequest_jarek", priority: 10 }
    // neue Quest = einfach eine Zeile mehr
};

/* karla_druck: steigt, solange der Strang offen ist und der Spieler nichts tut.
   Am Maximum kippt er in p2_quest_zu -> löst die bestehende Verhaftungs-Kette aus. */
setup.KARLA_DRUCK_MAX = 12;

setup.tickKarlaDruck = function () {
    var w = State.variables.world;
    var k = State.variables.npc && State.variables.npc.karla;
    if (!k) return;
    var f = k.memory.flags;

    // Strang muss offen sein: Geheimnis bekannt, aber noch kein Fortschritt/Ausgang
    var offen = f.kennt_geheimnis === true
        && f.zeuge_gefunden !== true
        && f.brief_gesendet !== true
        && f.p2_quest_zu !== true
        && f.verhaftung_seen !== true;

    if (!offen) return;

    w.karla_druck = (w.karla_druck || 0) + 1;

    // Maximum erreicht -> aktive-Absage-Flag setzen, Verhaftungs-Kette übernimmt
    if (w.karla_druck >= setup.KARLA_DRUCK_MAX) {
        f.p2_quest_zu = true;
        f.p2_quest_zu_tag = w.day;
    }
};

/* Druck/Status liegt generisch in $world.quest[id] – lazy angelegt, save-sicher */
setup.questState = function (id) {
    var w = State.variables.world;
    if (!w.quest) w.quest = {};
    if (!w.quest[id]) w.quest[id] = { druck: 0, active: false, done: false };
    return w.quest[id];
};

setup.readySidequest = function () {
    var npc = State.variables.npc, ready = [];
    Object.keys(setup.sidequests).forEach(function (id) {
        var q = setup.sidequests[id], st = setup.questState(id), n = npc[q.npc];
        if (st.done || st.active) return;
        if (n && n.memory.flags[q.completeFlag]) return;
        if (st.druck >= q.threshold) ready.push({ id: id, prio: q.priority || 0 });
    });
    if (!ready.length) return null;
    ready.sort(function (a, b) { return b.prio - a.prio; });
    return ready[0].id;   // höchste Priorität gewinnt, der Rest wartet auf die nächste Gelegenheit
};

setup.completeSidequest = function (id) {
    var q = setup.sidequests[id], st = setup.questState(id), n = State.variables.npc[q.npc];
    st.done = true; st.active = false;
    if (n) n.memory.flags[q.completeFlag] = true;
};

setup.tickSidequestDruck = function () {
    var npc = State.variables.npc;
    Object.keys(setup.sidequests).forEach(function (id) {
        var q = setup.sidequests[id];
        var st = setup.questState(id);
        var n = npc[q.npc];
        if (st.done || (n && n.memory.flags[q.completeFlag])) { st.done = true; return; }
        st.druck += 1;
    });
};
