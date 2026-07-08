# Storygraph: 02_widgets.tw

Quelle: `src/02_widgets.tw`

- Passagen in dieser Datei: 4
- Verbindungen aus dieser Datei: 1
- Externe Ziele: 1
- Nicht gefundene Ziele: 0

```mermaid
flowchart TD
    classDef external fill:#302818,stroke:#c9a84c,color:#dfdcd6,stroke-dasharray: 5 5;
    classDef missing fill:#351b1b,stroke:#d98d7e,color:#f0d0c8,stroke-dasharray: 2 2;

    Biwag_Aufbruch["Biwag_Aufbruch"]
    BiwagWidgets["BiwagWidgets"]
    gedankeWidget["gedankeWidget"]
    HubWidgets["HubWidgets"]
    InterruptWidgets["InterruptWidgets"]

    BiwagWidgets --> Biwag_Aufbruch
    class Biwag_Aufbruch external;
```

## Externe Ziele

Diese Ziele liegen nicht in dieser Datei, werden aber von hier aus angesprungen.

- `Biwag_Aufbruch` → `src/08_passages_biwag.tw`

