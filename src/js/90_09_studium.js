
/* ================================================================
   SECTION 14  STUDIUM & PRÜFUNG
   ================================================================ */

setup.studiumVault = setup.studiumVault || null;

setup.loadStudiumVault = function () {
    if (!setup.studiumVault) {
        setup.studiumVault = JSON.parse(Story.get("StudiumTexte").text);
    }
    return setup.studiumVault;
};

/* Deutsche Anzeigenamen der Faecher (fuer System-Boxen) */
setup.studiumFachName = {
    aloy: "Aloyer Staatskunde",
    geographie: "Geographie",
    splitterlande: "Splitterlande-Kunde",
    diplomatie: "Diplomatie & Recht"
};

/* --- HUB-TEXTE (Intro / Szenerie / Gedanke / Subtexte) --- */
setup.getStudiumHubText = function (category, subKey) {
    var v = setup.loadStudiumVault();
    if (subKey) {
        var subPool = v[category] ? v[category][subKey] : null;
        if (!subPool || subPool.length === 0) return "";
        return subPool[Math.floor(Math.random() * subPool.length)];
    }
    var pool = v[category];
    if (!pool || pool.length === 0) return "";
    return pool[Math.floor(Math.random() * pool.length)];
};

/* Kleiner Fortschritts-Anhang im Hub: "(3/6 gelernt)" bzw. "(abgeschlossen)" */
setup.studiumProgressTag = function (subjectKey) {
    var v = setup.loadStudiumVault();
    var subj = v.subjects[subjectKey];
    if (!subj) return "";
    var total = subj.lessons.length;
    var learned = State.variables.edu ? State.variables.edu.learned : [];
    var have = subj.lessons.filter(function (ls) { return learned.indexOf(ls.id) !== -1; }).length;
    if (have >= total) return "<b>(abgeschlossen)</b>";
    return "<b>(" + have + "/" + total + " gelernt)</b>";
};

/* --- STATIONS-TEXTE (scenery / intro / thought) --- */
setup.getStudiumText = function (subjectKey, type) {
    var v = setup.loadStudiumVault();
    var subj = v.subjects[subjectKey];
    if (!subj) return "Fehler: Fach [" + subjectKey + "] nicht gefunden.";

    if (type === "scenery") {
        var sc = subj.scenery || [];
        return sc.length ? sc[Math.floor(Math.random() * sc.length)] : "";
    }
    if (type === "intro") {
        var it = subj.intro || [];
        return it.length ? it[Math.floor(Math.random() * it.length)] : "";
    }
    if (type === "thought") {
        return setup.studiumThought(subjectKey);
    }
    return "";
};

/* Levelabhaengiger Reflexions-Gedanke (analog novice/medium/expert) */
setup.studiumThought = function (subjectKey) {
    var lvl = (State.variables.player && State.variables.player.knowledge[subjectKey]) || 0;
    var v = setup.loadStudiumVault();
    var total = v.subjects[subjectKey] ? v.subjects[subjectKey].lessons.length : 6;

    if (lvl >= total) {
        return "Dieses Fach gibt mir nichts Neues mehr. Was hier zu lernen war, habe ich gelernt – jetzt zaehlt nur, dass ich es behalte.";
    }
    if (lvl <= 1) {
        return "Mehr Stoff, als ich erwartet habe. Wenn das so weitergeht, brauche ich einen klaren Kopf – und vielleicht weniger Drill am Morgen.";
    }
    if (lvl <= 3) {
        return "Langsam ergibt es ein Bild. Einzelne Brocken fuegen sich zusammen. Noch ein paar Vorlesungen, dann kann mich der Magister fragen, was er will.";
    }
    return "Es sitzt. Fast schon zu gut – ich ertappe mich dabei, die Antworten zu kennen, bevor die Frage zu Ende ist.";
};

/* --- KERN: eine Lektion lehren (fortschreitendes Curriculum) --- */
setup.teachLecture = function (subjectKey) {
    var v = setup.loadStudiumVault();
    var subj = v.subjects[subjectKey];
    if (!subj) {
        return { isNew: false, revisionHTML: '<div class="system-alert status-negative">Fehler: Fach [' + subjectKey + '] fehlt im Vault.</div>' };
    }

    var edu = State.variables.edu;
    var p = State.variables.player;

    /* naechste noch nicht gelernte Lektion suchen */
    var next = null;
    for (var i = 0; i < subj.lessons.length; i++) {
        if (edu.learned.indexOf(subj.lessons[i].id) === -1) { next = subj.lessons[i]; break; }
    }

    /* Alles gelernt -> Wiederholung, keine neue Belohnung */
    if (!next) {
        var rv = subj.exhausted && subj.exhausted.length
            ? subj.exhausted[Math.floor(Math.random() * subj.exhausted.length)]
            : "Heute nichts Neues.";
        return { isNew: false, revisionHTML: '<div class="lecture-text">' + rv + '</div>' };
    }

    /* lernen + Werte vergeben */
    edu.learned.push(next.id);
    p.stats.scholarship = (p.stats.scholarship || 0) + 1;
    p.knowledge[subjectKey] = Math.min((p.knowledge[subjectKey] || 0) + 1, 10);
    p.chosen_activity = subjectKey;                 // fuer Abendappell-Kontext, falls verdrahtet
    if (State.variables.world) { State.variables.world.wasPracticing = true; }

    var lessonHTML =
        '<div class="lecture-text">' +
        '<div class="lecture-topic">' + next.topic + '</div>' +
        next.teach +
        '</div>';

    var fachName = setup.studiumFachName[subjectKey] || subj.name || subjectKey;
    var rewardHTML =
        '<div class="system-alert status-positive">Gelehrsamkeit erhoeht</div>' +
        '<div class="system-alert status-positive">Wissen (' + fachName + ') vertieft</div>' +
        '<div class="system-alert status-info">Ins Notizbuch uebernommen: ' + next.fact + '</div>';

    return { isNew: true, lesson: next, lessonHTML: lessonHTML, rewardHTML: rewardHTML };
};

/* --- Abschlussprüfung: baut sich aus den TATSÄCHLICH gelernten Lektionen --- */
setup._shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
};

/* Antwortoptionen mischen, korrekten Index nachfuehren */
setup._shuffleOptions = function (options, answerIndex) {
    var correctText = options[answerIndex];
    var opts = setup._shuffle(options.slice());
    return { options: opts, answer: opts.indexOf(correctText) };
};

setup.buildExam = function (maxQuestions) {
    var v = setup.loadStudiumVault();
    var learned = State.variables.edu.learned;
    var pool = [];

    Object.keys(v.subjects).forEach(function (sk) {
        var subj = v.subjects[sk];
        subj.lessons.forEach(function (ls) {
            if (learned.indexOf(ls.id) !== -1 && ls.quiz) {
                var sh = setup._shuffleOptions(ls.quiz.options, ls.quiz.answer);
                pool.push({
                    id: ls.id,
                    subject: subj.name,
                    q: ls.quiz.q,
                    options: sh.options,
                    answer: sh.answer
                });
            }
        });
    });

    setup._shuffle(pool);
    var q = pool.slice(0, maxQuestions || 6);

    var e = State.variables.edu.exam;
    e.queue = q;
    e.pos = 0;
    e.correct = 0;
    e.lastAnswer = null;
    e.done = false;
    e.total = q.length;
    e.score = 0;

    return q.length;
};

setup.answerExam = function (i) {
    var e = State.variables.edu.exam;
    if (e.lastAnswer !== null) return;            // nur einmal werten
    e.lastAnswer = i;
    if (i === e.queue[e.pos].answer) { e.correct += 1; }
};

setup.nextExam = function () {
    var e = State.variables.edu.exam;
    e.pos += 1;
    e.lastAnswer = null;
    if (e.pos >= e.queue.length) {
        e.done = true;
        e.score = e.correct;
    }
};

setup.examGrade = function () {
    var e = State.variables.edu.exam;
    if (!e.total) return { pct: 0, label: "—", correct: 0, total: 0 };
    var pct = Math.round((100 * e.correct) / e.total);
    var label =
        pct >= 90 ? "Mit Auszeichnung bestanden" :
            pct >= 70 ? "Bestanden" :
                pct >= 50 ? "Knapp bestanden" :
                    "Durchgefallen";
    return { pct: pct, label: label, correct: e.correct, total: e.total };
};

setup.examVerdict = function (pct) {
    if (pct >= 90) return "„Sieh an. Einer, der zugehoert hat. Merk dir das Gefuehl, Rekrut – es wird selten.“";
    if (pct >= 70) return "„Solide. Kein Gelehrter, aber auch kein Idiot mit Spiess. Das reicht fuer den Anfang.“";
    if (pct >= 50) return "„Gerade so. Du haettest oefter im Hoersaal sitzen sollen statt zu doesen. Aber durch ist durch.“";
    return "„Das war beschaemend. Wer sein eigenes Land nicht kennt, taugt nicht zum Verteidigen. Nacharbeiten. Sofort.“";
};

/* Belohnung je nach Ergebnis – einmalig anwenden */
setup.applyExamRewards = function (pct) {
    var p = State.variables.player;
    var e = State.variables.edu.exam;
    if (e._rewarded) return;                       // doppelte Vergabe verhindern
    e._rewarded = true;

    if (pct >= 70) {
        p.stats.scholarship = (p.stats.scholarship || 0) + 3;
        if (p.reputation && p.reputation.church !== undefined) p.reputation.church += 1;
    } else if (pct >= 50) {
        p.stats.scholarship = (p.stats.scholarship || 0) + 1;
    }
    /* unter 50: keine Belohnung */
};

setup.examRewardHTML = function (pct) {
    if (pct >= 70) {
        return '<div class="system-alert status-positive">Gelehrsamkeit deutlich erhoeht</div>' +
            '<div class="system-alert status-positive">Ruf bei der Kirche gestiegen</div>';
    }
    if (pct >= 50) {
        return '<div class="system-alert status-positive">Gelehrsamkeit erhoeht</div>';
    }
    return '<div class="system-alert status-negative">Keine Anerkennung – diese Pruefung hat dir nichts eingebracht.</div>';
};

/* --- Prüfungstermin-Logik --- */
setup.studiumExamConfig = {
    announceThreshold: 8,   // so viele Lektionen muessen besucht sein, bis der Magister ankuendigt
    leadDays: 5             // so viele Tage spaeter findet die Pruefung statt
};

setup.studiumTotalLearned = function () {
    var edu = State.variables.edu;
    return edu && edu.learned ? edu.learned.length : 0;
};

setup.studiumTotalLessons = function () {
    var v = setup.loadStudiumVault();
    var n = 0;
    Object.keys(v.subjects).forEach(function (sk) { n += v.subjects[sk].lessons.length; });
    return n;
};

/* Beim Betreten des Hubs aufrufen: kuendigt die Pruefung an, sobald genug gelernt wurde.
   Gibt true zurueck, wenn sie GERADE JETZT frisch angekuendigt wurde. */
setup.maybeAnnounceExam = function () {
    var edu = State.variables.edu;
    var cfg = setup.studiumExamConfig;
    if (!edu || edu.exam.announced || edu.exam.passed) return false;
    if (setup.studiumTotalLearned() >= cfg.announceThreshold) {
        edu.exam.announced = true;
        edu.exam.dueDay = (State.variables.world ? State.variables.world.day : 1) + cfg.leadDays;
        return true;
    }
    return false;
};

setup.examStatus = function () {
    var edu = State.variables.edu;
    var cfg = setup.studiumExamConfig;
    var day = State.variables.world ? State.variables.world.day : 1;
    var learned = setup.studiumTotalLearned();
    if (edu.exam.passed) return { state: "passed" };
    if (!edu.exam.announced) return { state: "locked", learned: learned, needed: cfg.announceThreshold };
    if (day >= edu.exam.dueDay) return { state: "due", dueDay: edu.exam.dueDay };
    return { state: "announced", dueDay: edu.exam.dueDay, daysLeft: edu.exam.dueDay - day };
};

setup.examHubHTML = function () {
    var s = setup.examStatus();
    if (s.state === "passed") {
        return '<div class="system-alert status-positive">Pruefung bestanden. Der Magister hat dich vorerst aus der Schusslinie genommen.</div>';
    }
    if (s.state === "locked") {
        return '<div class="thought-box">Noch hat der Magister keine Pruefung angesetzt. „Wer kaum im Hoersaal sass“, pflegt er zu sagen, „den pruefe ich nicht – den schicke ich zurueck auf die Bank.“ (' + s.learned + '/' + s.needed + ' Vorlesungen besucht)</div>';
    }
    if (s.state === "announced") {
        return '<div class="system-alert status-info">Die Pruefung ist angekuendigt: Tag ' + s.dueDay + ' (noch ' + s.daysLeft + ' Tag' + (s.daysLeft === 1 ? '' : 'e') + '). Bis dahin: wiederholen, was sitzen muss.</div>';
    }
    /* BUGFIX: verirrtes "n" durch echten Zeilenumbruch ersetzt */
    return '<div class="system-alert status-negative">Heute ist Pruefungstag. Der Magister wartet bereits.</div>\n[[Zur Pruefung antreten ->Pruefung Start]]';
};

setup.markExamResult = function (pct) {
    var e = State.variables.edu.exam;
    e.attempts += 1;
    if (pct >= 50) e.passed = true;
};

/* --- GELEHRSAMKEIT (scholarship) als ausgebbare Ressource --- */
setup.scholarship = function () { return (State.variables.player.stats.scholarship || 0); };
setup.canAfford = function (cost) { return setup.scholarship() >= cost; };
setup.spendScholarship = function (cost) {
    var p = State.variables.player;
    if ((p.stats.scholarship || 0) < cost) return false;
    p.stats.scholarship -= cost;
    return true;
};
