# Storygraph: 10_passages_kapitel0.tw

Quelle: `src/10_passages_kapitel0.tw`

- Passagen in dieser Datei: 17
- Verbindungen aus dieser Datei: 25
- Externe Ziele: 2
- Nicht gefundene Ziele: 0

```mermaid
flowchart TD
    classDef external fill:#302818,stroke:#c9a84c,color:#dfdcd6,stroke-dasharray: 5 5;
    classDef missing fill:#351b1b,stroke:#d98d7e,color:#f0d0c8,stroke-dasharray: 2 2;

    Appell_Ausrichten["Appell: Ausrichten"]
    Das_Erwachen["Das Erwachen"]
    Das_Training_Erster_Tag["Das Training: Erster Tag"]
    Der_Kasernenhof["Der Kasernenhof"]
    Hallen_erkunden["Hallen erkunden"]
    Intro["Intro"]
    Kap01_RekrutenKennenlernen["Kap01_RekrutenKennenlernen"]
    Kapitel_0["Kapitel 0"]
    Kapitel_1["Kapitel 1"]
    Nachtruhe_1["Nachtruhe 1"]
    Rausreden_Versuch["Rausreden Versuch"]
    Sergent_aushorchen["Sergent aushorchen"]
    Stube_Bei_Karla_einrichten["Stube: Bei Karla einrichten"]
    Stube_Eigene_Pritsche_suchen["Stube: Eigene Pritsche suchen"]
    Stube_Jarek_anfreunden["Stube: Jarek anfreunden"]
    Stube_Jarek_kommt_vorbei["Stube: Jarek kommt vorbei"]
    Stube_Schweigen_mit_Jarek["Stube: Schweigen mit Jarek"]
    Stube_Thomas_erzahlt["Stube: Thomas erzählt"]
    Treppe_runterrennen["Treppe runterrennen"]

    Kapitel_0 --> Intro
    Intro --> Das_Erwachen
    Sergent_aushorchen --> Der_Kasernenhof
    Sergent_aushorchen --> Hallen_erkunden
    Rausreden_Versuch --> Der_Kasernenhof
    Hallen_erkunden --> Treppe_runterrennen
    Hallen_erkunden --> Rausreden_Versuch
    Der_Kasernenhof --> Kap01_RekrutenKennenlernen
    Kap01_RekrutenKennenlernen --> Stube_Bei_Karla_einrichten
    Kap01_RekrutenKennenlernen --> Stube_Eigene_Pritsche_suchen
    Kap01_RekrutenKennenlernen --> Stube_Jarek_anfreunden
    Stube_Bei_Karla_einrichten --> Stube_Jarek_kommt_vorbei
    Stube_Eigene_Pritsche_suchen --> Stube_Jarek_kommt_vorbei
    Stube_Jarek_anfreunden --> Nachtruhe_1
    Stube_Jarek_kommt_vorbei --> Stube_Thomas_erzahlt
    Stube_Jarek_kommt_vorbei --> Stube_Schweigen_mit_Jarek
    Stube_Schweigen_mit_Jarek --> Nachtruhe_1
    Stube_Thomas_erzahlt --> Nachtruhe_1
    Nachtruhe_1 --> Das_Training_Erster_Tag
    Das_Erwachen --> Der_Kasernenhof
    Das_Erwachen --> Hallen_erkunden
    Das_Erwachen --> Sergent_aushorchen
    Das_Training_Erster_Tag --> Appell_Ausrichten
    Das_Training_Erster_Tag -->|goto| Appell_Ausrichten
    Appell_Ausrichten --> Kapitel_1
    class Kapitel_1 external;
    class Treppe_runterrennen external;
```

## Externe Ziele

Diese Ziele liegen nicht in dieser Datei, werden aber von hier aus angesprungen.

- `Kapitel 1` → `src/11_passages_kapitel1.tw`
- `Treppe runterrennen` → `src/11_passages_kapitel1.tw`

