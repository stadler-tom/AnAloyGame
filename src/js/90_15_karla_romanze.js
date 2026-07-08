
/* ================================================================
   SECTION 20  KARLA-ROMANZE (Mini-Sim, Kapitel 2)
   ================================================================ */

/* Save-sicher: legt den Zähler an, falls er fehlt */
setup.romanzeInit = function () {
    var k = State.variables.npc.karla;
    if (typeof k.romanze !== "number") k.romanze = 0;
    return k;
};

setup.setRomanze = function (mod) {
    var k = setup.romanzeInit();
    k.romanze = setup.clamp(k.romanze + mod, 0, 20);
    var p = State.variables.player;
    if (p && p.rel) {
        p.rel.karla = setup.clamp((p.rel.karla || 0) + (mod > 0 ? 1 : (mod < 0 ? -1 : 0)), -100, 100);
    }
    if (mod > 0) return '<div class="system-alert status-positive">♥ Zwischen dir und Karla wächst etwas (+' + mod + ')</div>';
    if (mod < 0) return '<div class="system-alert status-negative">♥ Ein Schritt zurück (' + mod + ')</div>';
    return "";
};

/* Stufe 0-3: Kameradschaft / Mehr als Kameradschaft / Vertrautheit / Etwas Eigenes */
setup.romanzeStufe = function () {
    var r = setup.romanzeInit().romanze;
    if (r >= 15) return 3;
    if (r >= 10) return 2;
    if (r >= 5)  return 1;
    return 0;
};

setup.romanzeStufeLabel = ["Kameradschaft", "Mehr als Kameradschaft", "Vertrautheit", "Etwas Eigenes"];

/* ---------- Geschenke ---------- */

setup.karlaGeschenke = {
    mandeln: { item: "Gebrannte Mandeln", preis: 4 },
    wetzstein: { item: "Feiner Wetzstein", preis: 12 },
    haarband: { item: "Rotes Haarband", preis: 9 },
    salbe: { item: "Wallwurz-Salbe", preis: 7 }
};

setup.hatKarlaGeschenk = function () {
    return Object.keys(setup.karlaGeschenke).some(function (id) {
        return setup.hasItem(setup.karlaGeschenke[id].item);
    });
};

/* BUGFIX: Anführungszeichen in den Texten als HTML-Entities (&bdquo; &ldquo;),
   damit die String-Begrenzer nicht brechen (STRING-REGEL). */
setup.gibKarlaGeschenk = function (id) {
    var g = setup.karlaGeschenke[id];
    if (!g || !setup.hasItem(g.item)) return "";
    var s = setup.romanzeStufe();
    var f = State.variables.npc.karla.memory.flags;
    var out = "";
    var behalten = false;   /* true = sie nimmt es nicht an, bleibt im Inventar */

    switch (id) {
        case "mandeln":
            out += '<p>Karla wiegt die Tüte in der Hand. &bdquo;Bestechung?&ldquo;, fragt sie — aber sie isst schon die erste. Ihr teilt euch den Rest auf der Bank vor der Baracke, und eine Weile ist das Knacken der Mandeln das einzige Gespräch, das ihr braucht.</p>';
            out += setup.setRomanze(1);
            break;

        case "wetzstein":
            out += '<p>Sie zieht den Stein prüfend über den Daumennagel, hält ihn ins Licht, wie ein Händler eine Münze. &bdquo;Der ist gut&ldquo;, sagt sie. Mehr nicht. Aber am nächsten Morgen ist ihre Klinge die schärfste der ganzen Reihe, und als sie deinen Blick bemerkt, hebt sie eine Braue — fast ein Lächeln.</p>';
            out += setup.setRomanze(1);
            break;

        case "haarband":
            if (s >= 3) {
                out += '<p>Sie sagt nichts. Sie bindet es sich auch nicht ins Haar — sie schlingt es zweimal um das linke Handgelenk und zieht den Knoten fest. Dort bleibt es. Von diesem Tag an siehst du es bei jedem Drill aufblitzen, rot gegen den Staub, und jedes Mal zieht sich etwas in dir zusammen, das kein Name hat.</p>';
                out += setup.setRomanze(2);
                f.haarband_getragen = true;
            } else {
                out += '<p>Sie hält das Band zwischen zwei Fingern wie etwas, das erklärt werden muss. &bdquo;Wofür?&ldquo; Du hast keine gute Antwort — und sie sieht, dass du keine hast. Sie legt es dir zurück in die Hand. Nicht unfreundlich. Aber sie legt es zurück.</p>';
                out += setup.setRomanze(-3);
                behalten = true;
            }
            break;

        case "salbe":
            if (s >= 2) {
                out += '<p>Sie wird sehr still, als sie liest, was auf der Dose steht. Wallwurz. Für alte Verletzungen. Sie sieht dich lange an — und du hältst den Blick, ohne ein Wort, ohne eine Frage, so wie damals in der Schreibstube. Dann steckt sie die Dose ein. &bdquo;Du fragst nicht&ldquo;, sagt sie leise. &bdquo;Du hast nie gefragt.&ldquo; Es klingt wie das größte Kompliment, das sie zu vergeben hat.</p>';
                out += setup.setRomanze(1);
                f.salbe_angenommen = true;
            } else {
                out += '<p>Ihr Gesicht schließt sich, kaum dass sie begreift, wofür die Salbe ist. Kein Wort. Sie gibt dir die Dose zurück, steht auf und geht — und du hörst das Echo eines Satzes, den sie einmal auf dem Übungsplatz gesagt hat, leise und endgültig: Frag das nie wieder.</p>';
                out += setup.setRomanze(-3);
                behalten = true;
            }
            break;
    }

    if (!behalten) setup.removeItem(g.item);
    return out;
};