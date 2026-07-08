# Storygraph: 80_debugger.tw

Quelle: `src/80_debugger.tw`

- Passagen in dieser Datei: 4
- Verbindungen aus dieser Datei: 12
- Externe Ziele: 9
- Nicht gefundene Ziele: 0

```mermaid
flowchart TD
    classDef external fill:#302818,stroke:#c9a84c,color:#dfdcd6,stroke-dasharray: 5 5;
    classDef missing fill:#351b1b,stroke:#d98d7e,color:#f0d0c8,stroke-dasharray: 2 2;

    Biwag_Drill["Biwag_Drill"]
    DEBUG_Kap2_Setup["DEBUG_Kap2_Setup"]
    DEBUG_Menu["DEBUG_Menu"]
    Debugger_Ermittlung["Debugger Ermittlung"]
    DevLogin["DevLogin"]
    Ermittlung_S0_Auftakt["Ermittlung_S0_Auftakt"]
    Jarek_S1_Vorlesung["Jarek_S1_Vorlesung"]
    Jarek_S2_Angebot["Jarek_S2_Angebot"]
    Jarek_S3_Start["Jarek_S3_Start"]
    Jarek_S4_Archiv["Jarek_S4_Archiv"]
    Kap2_Intro["Kap2_Intro"]
    Kap2_Tagesstart["Kap2_Tagesstart"]
    S06_Gestehen["S06_Gestehen"]

    DevLogin -->|goto| DEBUG_Kap2_Setup
    DEBUG_Kap2_Setup --> Kap2_Intro
    DEBUG_Kap2_Setup --> Kap2_Tagesstart
    DEBUG_Kap2_Setup --> Biwag_Drill
    DEBUG_Kap2_Setup -->|goto| DEBUG_Kap2_Setup
    DEBUG_Menu -->|goto| Jarek_S1_Vorlesung
    DEBUG_Menu -->|goto| Jarek_S2_Angebot
    DEBUG_Menu -->|goto| Jarek_S3_Start
    DEBUG_Menu -->|goto| Jarek_S4_Archiv
    DEBUG_Menu -->|goto| S06_Gestehen
    DEBUG_Menu -->|goto| DEBUG_Menu
    Debugger_Ermittlung --> Ermittlung_S0_Auftakt
    class Biwag_Drill external;
    class Ermittlung_S0_Auftakt external;
    class Jarek_S1_Vorlesung external;
    class Jarek_S2_Angebot external;
    class Jarek_S3_Start external;
    class Jarek_S4_Archiv external;
    class Kap2_Intro external;
    class Kap2_Tagesstart external;
    class S06_Gestehen external;
```

## Externe Ziele

Diese Ziele liegen nicht in dieser Datei, werden aber von hier aus angesprungen.

- `Biwag_Drill` → `src/08_passages_biwag.tw`
- `Ermittlung_S0_Auftakt` → `src/07_passages_ermittlung.tw`
- `Jarek_S1_Vorlesung` → `src/06_passages_jarek.tw`
- `Jarek_S2_Angebot` → `src/06_passages_jarek.tw`
- `Jarek_S3_Start` → `src/06_passages_jarek.tw`
- `Jarek_S4_Archiv` → `src/06_passages_jarek.tw`
- `Kap2_Intro` → `src/12_passages_kapitel2.tw`
- `Kap2_Tagesstart` → `src/12_passages_kapitel2.tw`
- `S06_Gestehen` → `src/06_passages_jarek.tw`

