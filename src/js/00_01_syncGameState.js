
setup.reconcileState = function () {
    var V = State.variables;
    if (V.player && setup.playerDefaults) setup.fillDefaults(V.player, setup.playerDefaults);
    if (V.world  && setup.worldDefaults)  setup.fillDefaults(V.world,  setup.worldDefaults);
    if (V.npc    && setup.npcDefaults)    setup.fillDefaults(V.npc,    setup.npcDefaults);
};

function _istObjekt(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }

/* Ergänzt in target alle Schlüssel aus defaults, die fehlen. Bestehende Werte bleiben unangetastet. */
setup.fillDefaults = function (target, defaults) {
    if (!_istObjekt(target) || !_istObjekt(defaults)) return target;
    Object.keys(defaults).forEach(function (key) {
        var dv = defaults[key];
        if (!(key in target)) {
            target[key] = clone(dv);                 // fehlt ganz -> tiefe Kopie
        } else if (_istObjekt(dv) && _istObjekt(target[key])) {
            setup.fillDefaults(target[key], dv);     // beide Objekte -> rekursiv weiter
        }
        /* existiert bereits (Primitive/Array) -> in Ruhe lassen */
    });
    return target;
};

/*-------------PLAYER------------------------*/
setup.playerDefaults = { 
    name: "Thomas",
    fullname: "Thomaso Wabbler",
    rank: "Zivilist",
    chosen_activity: "",
    hasSlept: true,
    combatXp: 0,
    flags: {
        jareknarbe: false
    },
    spezialisierung: "",

    money: {
        copper: 2
    },

    inventory: {
    items: [],
    weapons: ["unarmed", "training_pike"]
    },
    equipment: {
        weapon: "training_pike"
    },
    /* Charakter & Haltung (0–100, 50 = neutral) */
    stats: {
        mercy: 50,
        ambition: 50,
        honesty: 50,
        discipline: 30,   /* frischer Rekrut – wächst durch Drill, fällt durch Regelbruch */
        faith: 20,         /* Verhältnis zur Drei-Götter-Kirche: 0 gottlos … 100 fromm */     
        scholarship: 5
    },

    /* Erlernte Fertigkeiten (Start niedrig, wachsen mit Übung) */
    knowledge: {
        pike: 0,
        crossbow: 0,
        cannon: 0,
        medicine: 0,
        thievery: 0,
        gossip: 0,
        combat: 0,
        perception: 0,
    },
    
    fightStats: {
        hp: 12,
        maxHp: 12,
        attack: 4,
        damage: 8,
        armor: 15,
        proficiency: 1
        },

    reputation: {
        land: 0,
        ohm: 0,
        church: 0
    },

    condition: 40,        
    suspicion: 0, 

    rumors: [],
    
    rel : {
    karla: 0,
    jarek: 0,
    luigi: 0,
    lenz: 0,
    wenzl: 0,
    lars: 0,
    hannes: 0
    }   

};


/*-------------NPC------------------------*/
setup.npcDefaults = {
    /* ===========================
       KASERNE / AKADEMIE - OHMS
       =========================== */

    sergeant: {
        name: "Sergeant",
        image: "images/Sergeant.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        journalEntry: "Der mürrische Protokollant in der Schreibstube der Kaserne. Er führt die Truppenrolle des Corps mit eiserner Bürokratie und versteht absolut keinen Spaß, wenn man die feine Ordnung seiner Listen stört."
    },

    kurt: {
        name: "Kurt Brasner",
        image: "images/Kurt.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        journalEntry: "Chefausbilder und Fähnrich der Militärakademie zu Ohm und ein grauhaariger Veteran."
    },

    schinder: {
        name: "Schinder",
        image: "images/Schinder.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        journalEntry: "Der kriegsversehrte Weibel auf dem Exerzierplatz."
    },

    hauptmann: {
        name: "Konrad Rindler",
        image: "images/Hauptmann.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        journalEntry: "Ein kühler, etwas vornehmer Typ. Pragmatischer Offizier des Corps."
    },
    magister: {
        name: "Magister Cornelius Halm",
        image: "images/Magister.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        archivzugang: false,
        memory: { flags: {}, events: [] },
        journalEntry: "Der hagere Magister für Staatskunde – Tintenfinger, trockene Stimme, kein Wort zu viel. Hält die Vorlesungen und ist zugleich Archivar der Akademie. Wer in die Schreibstuben oder gar ins Archiv will, kommt an ihm nicht vorbei.",
        /*
            PLOTNOTIZ (nicht im Journal):
            Magister Halm ist Archivar der Akademie zu Ohm. Er verwaltet die
            Militärakten (-> Karlas Onkel Edric / Transportüberfall) und steht
            im Briefwechsel mit dem Gründungsarchiv in Grodaus
            (-> Jareks sechste Unterschrift der Freiheitserklärung).
            Er ist der Gatekeeper BEIDER Archiv-Sidequests. Gunst erkauft man
            sich bei ihm nicht mit Gold, sondern mit Gelehrsamkeit (scholarship).
            Plumpes Nachfragen nach Akten erhöht $player.suspicion.
        */
    },
    
    /* Kapitel 2*/
    
    orenmalk: {
        name: "Oren Malk",
        known: false,
        faction: "Loyalisten",
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        motiv: "",
        journalEntry: "Schreiber in der Waffenausgabe der Militärakademie zu Ohm – schmal, tintenfleckige Finger, sauber gestutzter Bart, leicht hinkender Gang. Höflich und überkorrekt auf den ersten Blick, doch nervös, aufmerksam und vorsichtig, sobald es um Ausgabelisten, Bestandsmarken oder fehlende Waffen geht."

    },

    /* Echte Spieler */

    hauptmannLenz: {
        name: "Hauptmann Lenz",
        image: "images/Lenz.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Führer des unkonventionellen 84. Banners im 33. Regiment. Ein Mann der seine eigenen Wege geht – und manchmal die seiner Leute auch."
    },

    weibelWenzel: {
        name: "Weibel Wenzel",
         image: "images/Wenzel.jpg",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
       journalEntry: "Feldweibel aus Umseck, farbenfrohster Söldner im 84. Banner. Offener Gambeson, Pluderhose, rotes Barett. Knüppel und Dolch immer am Mann. Direkt, vorlaut, gut mit Leuten. Organisiert den Haufen — und schaut gerne zu wenn jemand auf ein Missgeschick zusteuert."
       /*
            HINTERGRUND (nicht im Journal – interne Plotlogik):
            War vor dem Heer Zimmermann – liest Menschen wie Holz: jeder hat
            eine Stelle, wo er bricht. Hasst den alten aloyer Adel.
            Tick: kein Abortgang ohne "Piss-Lampenöl"; legt gern frisch
            geöltes Pflaster aus, um Hochmütige aufs Kreuz zu legen.
            Verträgt wenig Alkohol – mit Knoblauchöl wieder nüchtern zu kriegen.
            GEHEIMNISSE:
            - Hat adeliges Blut (ausgerechnet er) – Widerspruch zu seinem
              Adelshass; Langzeit-Plotfaden.
            - Hat einmal eine Leiche unter Bewachung der Drachengarder
              unbemerkt weggeschafft.
            - Hat Snori de Albe ein Einhorn auf den Stuhl gelegt – Erasmus von
              der Than wurde dafür geschlagen.
            Easteregg: echter Spieler des 84. Banners.
        */
    },

    weibelLars: {
        name: "Lars Spalter",
        image: "images/Lars.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Wachweibl des 84. Banners, einer der drei GWALT-Sprecher im Heer. Roter Mantel, schwarzer Arm, Widder-Dolchscheide — Andenken an die Tiafunter Rammböcke. Groß, gewissenhaft, direkt wenn man ihn reizt. Reibt sich den Nasenrücken wenn das Banner wieder Blödsinn macht — also oft."
    },
    vasil: {
        name: "Vasil Schütze",
         image: "images/Vasil.jpg",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Armbruster und Ballistenschütze im 84. Banner. Groß und breit wie eine versehentlich verbaute Türöffnung, schaut grantiger als er ist — außer er ist grantig. Rot-weiße Söldnerkleidung, Barett, immer Werkzeug am Gurt. Simpel, geradeaus, loyal. Schießt und baut, als wären seine Hände dafür geboren. Reißt entsetzliche Witze und hält sie für ausgezeichnet."
    },
    haddl: {
        name: "Hartmut Hadde Wurz",
        image: "images/Haddl.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Armbruster und Fahnenträger des 84. Banners, Gebirgsmarine-Ausbildung. Kein Bart, lange Haare, große Klappe. Zitiert pausenlos seinen Opa. Trinkt mehr als gut ist und wird dabei nie laut. "
    },

    diplomatHannes: {
        name: "Hannes Böttcher",
        image: "images/Hannes.jpg",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Aloyer Diplomat aus Grodaus. Kurzer gepflegter Bart, kleine Narbe rechts neben der Nase. Diplomatenmantel und Amtskette im Dienst, sonst Söldner-Ausgehkleidung. Ruhig und besonnen — erst denken, dann reden, aber dann weit ausholend. Prinzipientreu bis er nicht mehr merkt dass Diplomatie längst keine Option mehr ist."
    },

    bast: {
        name: "Bast Lercher",
        image: "images/Bast.jpg",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Diplomat und Offizier aus Vormberg. Roter Bart, rotes Barett, Dokumentenrolle am Gurt. Redet viel, sagt wenig mehr als er will. Pragmatisch, loyal — außer wenn Frauen im Spiel sind."

    },  
    hansFichtensplitter: {
        name: "Hans Fichtensplitter",
        image: "images/Hansbert.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Ein Name der fällt. Ein Gesicht das auftaucht. Was Hans Fichtensplitter hier zu suchen hat – das weißt du noch nicht."
    },
    clausz: {
        name: "Clausz Andelsmann",
        image: "images/Clausz.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Hurenweibel des 84. Banners. Aus Tiafunt, Hafenviertel — die Andelsmänner, ein altes Handelshaus mit noch älterem Standesdünkel, den Clausz selbst verachtet. Gut gekleidet, besser als ein Söldner es sollte. Am Gürtel: Dolch, Lagerbuch, eine Rollenkapsel, Nierentasche, Schnapsbecher. Hat immer Rauchkraut und weiß immer wo was ist — außer wo die Zeit für den Morgenappell bleibt. Mag eingelegtes Obst in Mengen, die man eigentlich nicht mag."
    },

    rosi: {
        name: "Rosina Hugendubel",
        image: "images/Rosi.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Feldscher des 84. Banners. Rosi aus Tiafunt, Adoptivtochter von Mutti Kreisch, vorher Bedienung im Bumsda. Das Hirnbisla am Barett ist nicht zu übersehen. Fürsorglich bis zur Erschöpfung, redet im Dialekt und pausenlos, haut sich gegen die Stirn wenn's hakt. Hat einmal einen Ritter zum Schmied geschickt weil er über eine Delle in seiner Rüstung gejammert hat. Er war beleidigt. Sie war beschäftigt."
    },

    tilly: {
        name: "Tilly",
        image: "images/Tilly.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Söldnerin des 84. Banners — offiziell, mit M-Vermerk. Aus Tiafunt. In der Praxis findet man sie fast immer im Tross. Kein Vorwurf, sagen die vom Tross. Eher ein Kompliment. Zwei Zöpfe und viel zu ehrgeizige Stickereien auf der Uniform"
    },
    tobalt: {
        name: "Tobalt",
        image: "images/Tobalt.png",
        known: false,
        faction: "84. Banner",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Söldner des 84. Banners, 1. Lanze, aus einem Dorf nahe Weitfurth — Holzfällersohn, klein und kräftig, mit einem schelmischen Grinsen, das selten weicht. Aloyer Farben, praktisch getragen, Messer und Trinkgefäß am Gurt und ein kleiner Holzlöffel mit graviertem Auge. Freundlich, loyal, trinkfest. Redet lieber in Geschichten als in Antworten — und erzählt derer zu viele. Bringt jeden zum Reden, plaudert dabei selbst oft zu viel, und weiß am Ende doch mehr, als er zugibt. 'Ja mei, dann machen wir mal.'"
        /*
            HINTERGRUND (nicht im Journal):
            Sorgloser, als er wirkt — überspielt Ernst mit Witzen, nimmt aber viel wahr.
            Oft "zufällig" dort, wo Informationen fallen; Bote/Verbindungsmann.
            Barsinger-Gläubiger (Trinken, Geselligkeit, Glück des Augenblicks).
            Wird still und direkt, wenn man seine Kameraden schlecht behandelt.
            Easteregg: echter Spieler des 84. Banners.
        */
    },


    /* ===========================
       MITREKRUTEN
       =========================== */

    karla: {
        name: "Karla",
        image: "images/Karla_Kap1.png",
        imageKap2: "images/Karla_Kap2.jpg",
        imageVerhaftet: "images/Karla_verhaftet.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        /* Sichtbares Profil – kein Hinweis auf das Geheimnis */
        journalEntry: "Rote Haare, breitschultrig, direkt, laut. Hat sich am ersten Abend den Platz am Ofen gesichert und dafür jemanden von seiner Pritsche geworfen. Wirkt wie jemand der fürs Soldatenleben gemacht wurde."
        /*
            GEHEIMNIS (nicht im Journal – für interne Plotlogik):
            Ihr Onkel Edric, ein Fuhrmann aus Umseck, sitzt seit zwei Jahren
            in Haft – verurteilt als Ortskundiger bei einem Überfall auf einen
            Militärtransport. Karla weiß: Er war krank, lag mit Fieber im Bett.
            Der einzige Zeuge hat geschwiegen. Warum – das weiß sie nicht.
            Sie ist hier wegen der Militärakten. Zugang zu Schreibstuben,
            Archiv, Verwaltung. Das ist der Plan.
            Verbindung zu laufendem Plot: "Überfälle auf Militärtransporte"
        */
    },

    jarek: {
        name: "Jarek",
        image: "images/Jarek.png",
        imageKap2: "images/Jarek_Kap2.png",
        known: false,
        affection: 0,
        trust: false,
        isRealPlayer: false,
        memory: { flags: {}, events: [] },
        /* Sichtbares Profil – kein Hinweis auf das Geheimnis */
        journalEntry: "Schmächtig, ruhig, fällt nicht auf. Hat mir am ersten Abend die Pritsche neben sich angeboten und erklärt, dass er hier wegen des Solds ist – Geld für die Familie daheim. Hält sich aus Streitereien raus und beobachtet mehr als er redet. Niemand nimmt ihn besonders ernst."
        /*
            GEHEIMNIS (nicht im Journal – für interne Plotlogik):
            Heimlicher Loyalist, von klein auf indoktriniert.
            Sucht Zugang zum Gründungsarchiv der Akademie in Grodaus.
            Ziel: Die sechste, unleserliche Unterschrift der Freiheitserklärung
            lesbar machen. Seine Familie glaubt: kein Gott hat unterschrieben,
            sondern ein Adeliger – unter Androhung von Gewalt.
            Beweis dafür würde die Gründungslegende der Republik erschüttern.
            Verbindung zu laufendem Plot: "Loyalisten" (Fraktion im Untergrund)
        */
    },

    /* ===========================
       DIPLOMATIE / AUSSENWELT
       =========================== */

    heinrich: {
        name: "Heinrich von Grimmerthann",
        image: "images/Heinrich.png",
        known: false,
        faction: "Kronmark",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Ritter aus der Kronmark, Freund des 84. Banners. Kämpfer, kein Höfling — besteht auf 'Du', und ist trotz Adelsschlags in Aloy geachtet. Verbündeter im Krieg gegen Komarn. Vorlaut, von sich selbst Überzeugt. Hört sich gerne reden. Singt gerne, steht sehr gern im mittelpunkt. Ruhiger wenn seine Frau Silva dabei ist. Aber ein loyaler Kerl. Wer ihn als Freund hat hat eine Eiche an seiner Seite. Hat die Carolus Dux Tourney 2 mal gewonnen."
    },
    silva: {
        name: "Silva von Rosenschlag",
        image: "images/Silva.png",
        known: false,
        faction: "Kronmark",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Hohe Herrin der Kronmark und Ritter — eine Frau in Rüstung, die ihr Handwerk versteht. Heinrichs Frau, ebenso volksnah, ebenso auf 'Du'. Stratege, wortgeannt, ruhig, loyal. Wenn man mit ihr redet merkt man, dass sie Interlektuell über einem steht. Sie ist eine Frau, aber wer das als anlass nimt sie zu unterschätzen, der irrt und wird das baldigst spühren. Sie hat die Tourney vom Einhorn gewonnen."
    },
    

    /* ===========================
       LA FAMILIA
       =========================== */

    luigi: {
        name: "Luigi",
        known: false,
        image: "images/Luigi.png",
        faction: "La Familia",
        affection: 4,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Ein Name. Ein Handelszeichen. Jemand hat sich um dich gekümmert, einmal – in den Bergen Aloys, als du noch klein und krank warst. Wer das war, weißt du nicht mehr genau. Anwalt mit Lizenz in Aloy."
        /*
            PLOTNOTIZ:
            Luigi ist Thomas' Pate. Er taucht nicht persönlich auf –
            wird nur erwähnt: ein Brief, ein Handelszeichen, ein Name der fällt.
            Der echte Spieler Luigi soll beim Lesen erkennen:
            Das ist mein Patenkind.
        */
    },
     vincente: {
        name: "Vincente",
        known: false,
        faction: "La Familia",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Ein Mann fürs grobe. Muskulöse Statur, Hut mit Krempe, vorlaut. Hat immer einen Zahnstocher im Mund."
    },
     maurice: {
        name: "Maurice Marie",
        known: false,
        image: "images/MM.png",
        faction: "La Familia",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Ein Bretone. Mit einem Hang für Würfelspiele. Redselig, aber nicht dumm. Versteht sich gut darauf Leuten dinge einzureden die sie nicht wollen."

    },

    /* ===========================
       Imperium
       =========================== */

    konrad: {
        name: "Konrad Schläger",
        known: false,
        image: "images/Konrad.png",
        faction: "Imperium",
        affection: 0,
        trust: false,
        isRealPlayer: true,
        memory: { flags: {}, events: [] },
        journalEntry: "Einer vom Imperium! Ein Hüne von einem Kerl, aus der Ostmark. Den Akzent in dem er spricht hast du noch nie gehört."

    },
};

/*-------------WORLD------------------------*/
setup.worldDefaults  = { 
    lastPassage:"",
    debug: false,
    flags: {},
    day: 0,
    weather: "windig",
    wasPracticing: false,
    needsDiceGame: true,
    seenGossip: {},
    wuerfelSpiel: { cheat: 0, gespielt: 0 },
    currentGossipStory: "",
    karla_druck: 0,       
    jarek_druck: 0,
    interruptDoneToday: false,
    interruptHistory: {},
    appliedPassages : {},
    visitedChurch : false,
    kapitel1_gesperrt: false,
    kapitel2_gesperrt: false,
    tagesAktionen: 0,
    decisionLog : [],
    ermittlung : {
        spuren: [], 
        spurenText: {}, 
        verdacht: {}, 
        flags: {}
    }
};

