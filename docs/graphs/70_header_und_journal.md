# Storygraph: 70_header_und_journal.tw

Quelle: `src/70_header_und_journal.tw`

- Passagen in dieser Datei: 8
- Verbindungen aus dieser Datei: 3
- Externe Ziele: 2
- Nicht gefundene Ziele: 0

```mermaid
flowchart TD
    classDef external fill:#302818,stroke:#c9a84c,color:#dfdcd6,stroke-dasharray: 5 5;
    classDef missing fill:#351b1b,stroke:#d98d7e,color:#f0d0c8,stroke-dasharray: 2 2;

    Auf_Stube["Auf Stube"]
    DevLogin["DevLogin"]
    journalAnsicht["journalAnsicht"]
    Notizbuch_Ermittlung["Notizbuch_Ermittlung"]
    Notizbuch_Geruechte["Notizbuch_Geruechte"]
    Notizbuch_Kameraden["Notizbuch_Kameraden"]
    Notizbuch_Personen["Notizbuch_Personen"]
    PassageHeader["PassageHeader"]
    StoryMenu["StoryMenu"]
    StorySubtitle["StorySubtitle"]

    journalAnsicht -->|goto| DevLogin
    journalAnsicht -->|goto| Auf_Stube
    StoryMenu --> Notizbuch_Ermittlung
    class Auf_Stube external;
    class DevLogin external;
```

## Externe Ziele

Diese Ziele liegen nicht in dieser Datei, werden aber von hier aus angesprungen.

- `Auf Stube` → `src/11_passages_kapitel1.tw`
- `DevLogin` → `src/80_debugger.tw`

