# Notizblock — An Aloy Story

Stand: Juli 2026 (Kapitel-2-Ausbau)

---

## 1. Fehlende weiterImTag-Routing-Tags in Kapitel 2

**Hintergrund:** `routeFromTags` hat jetzt eine Kap2-Weiche (in js.js, Section 02):

| Tag | Route in Kap 2 | hasSlept | Bedeutung |
|---|---|---|---|
| *(kein Tag)* | `Kap2_Tageshub` | true | Tagsüber, Tag läuft weiter |
| `nach_abend` | `Kap2_Abend` | true | Abendszene — Tag endet, normal geschlafen |
| `nach_morgen` | `Kap2_Tagesstart` | **false** | Durchgemachte Nacht — Tag endet, Kondition −10 |

**Diese Passagen brauchen noch ein Tag** (aktuell laufen sie alle auf den Default `Kap2_Tageshub`, obwohl sie abends/nachts spielen):

| Passage | Empfohlenes Tag | Begründung |
|---|---|---|
| `Ermittlung_S0_PlanFortsetzung` | `nach_abend` | Abend am Holzstapel (Pechfackeln) |
| `Ermittlung_S1_Beschluss` | `nach_abend` | Abendgespräch nach dem Waffenpflege-Tag |
| `Ermittlung_S3_Erkenntnis` | `nach_morgen` | folgt auf den nächtlichen Einbruch bzw. späten Abend — Nacht ist durch |
| `Ermittlung_S5_Karla_Bericht` | `nach_abend` | Abend am Holzstapel |
| `Ermittlung_S6_Beschluss` | `nach_abend` | Abend-Debrief nach der Westhof-Tagesfahrt |
| `Ermittlung_S7_Erkenntnis` | `nach_morgen` | späte Nacht am Holzstapel nach der S7-Aktion |
| `Ermittlung_S3_Beobachtung` | *(keins)* | tagsüber erzählt, zurück in den Hub ist richtig |
| `Ermittlung_Familia_Antwort` | *(keins)* | Brunnen, zwischen Drill und Studium — Tag läuft weiter |
| `Halm_S1_Ruft_Thomas` | *(keins)* | tagsüber aus dem Drill geholt — Tag läuft weiter |

**Achtung bei `nach_morgen`:** setzt `hasSlept = false` → Kondition −10 beim Tageswechsel. Absichtlich nur für echte durchgemachte Nächte verwenden (Einbruch, S7-Nachtaktionen). Für normale Abendszenen immer `nach_abend`.

**Merkregel für neue Kap2-Passagen:** Endet die Szene tagsüber → kein Tag. Endet sie am Abend → `nach_abend`. Ging die Nacht drauf → `nach_morgen`.

---

## 2. Plan: Ermittlung „Die sechste Hand" (Kapitel 2)

### Beschlossene Eckpfeiler

- **Oren Malk ist überzeugter Loyalist** (Schläfer in der Verwaltung). Er gesteht nie, nennt keine Namen. Halms Deutung („ein Schreiber, der Angst hat") ist eine Fehleinschätzung — Oren handelt aus Disziplin, nicht aus Angst.
- **Fluchtweg = Die Nachtfracht:** Jarek verließ die Akademie in einer Kiste „Übungsbestand C zur Nachprüfung Westhof" auf einer nächtlichen Reparaturfuhre. Die C-Fuhren sind der Schmuggelkanal der Loyalisten (Waren, Dokumente, notfalls Menschen). Der gefälschte Dolch-Eintrag war kein Einzelfall, sondern ein Fenster in dieses System. Verknüpft: Krebs' sauberes Gegenbuch, Luigis Brief („Ware unter falschen Namen, über die Fuhrmannswege, kein Raub — ein Tragen").
- **Finale = Übergabe an Rindler:** Diesmal mit harten Beweisen (zwei widersprüchliche Bücher + Torprotokoll + dokumentierte Fuhre). Wer in S2 den Hauptmann-Weg verbrannt hat, braucht einen Türöffner (Halm oder den Namenlosen aus Grodaus).
- **verdacht.orenmalk ist der Timer:** > 3 → Halms Warnung feuert. ≥ 6 → buch_pruefen-Storylet gesperrt. In S9: zu viel Verdacht → Oren räumt auf (Einträge vernichtet, Fuhren gestrichen) → der Weg wird härter.
- **Gattungs-Zweige (feste Stories statt Würfe):** Pike → Torbuch als Dienstauftrag (S7). Armbrust → Schießstand als Beobachtungsposten (S7). Geschütz → Fuhrmann-Kameraderie (S3_Beobachtung; Extra-Detail: Oren zeichnet jede Kiste PERSÖNLICH ab). Feldscher → Boltes Knie (S7; Extra-Detail: in der Fluchtnacht saß ein FREMDER Fuhrmann auf dem Bock, nicht der übliche).

### Stationen — Status

| Station | Passage(n) | Status |
|---|---|---|
| S0 Auftakt (Plan: Jareks letzten Tag nachzeichnen) | Ermittlung_S0_* | ✅ drin, getaktet |
| S1 Dolch-Anomalie + Weg-Wahl | S1_Intro_in_Waffenstube, S1_Beschluss | ✅ drin (+4 Tage nach S0) |
| S2 Der Blick ins Buch (3 Wege) | S2_Einbruch(+Flucht/Versteck), S2_Hauptmann, S2_Verwaltungstrick | ✅ drin (+3 Tage) |
| S3 Kein Rückvermerk | S3_Erkenntnis | ✅ drin (gleiche Session wie S2) |
| S4 Was bedeuten die Worte? | S4_Magister_Halm → S5_Karla_Bericht / S3_Beobachtung | ✅ drin (+3 Tage) |
| S5 Westhof: Krebs' Gegenbuch = Beweis der Fälschung | S5_Westhof | ✅ drin (+4 Tage) |
| S6 Sackgasse → Pivot „Wie kam er raus?" + Weg-Wahl | S6_Sackgasse, S6_Beschluss | ✅ drin (gleiche Session) |
| S7 Die Nachtfuhre (3 Wege, je fester Gattungszweig) | S7_Wachprotokolle, S7_Wachposten_Befragung, S7_Route_Ablaufen → S7_Erkenntnis | ✅ drin (+3 Tage). Ergebnis: Spur `nachtfuhre` |
| Halms Warnung | Halm_S1_Ruft_Thomas | ✅ drin (Trigger: verdacht > 3 + schande) — Ende/weiterImTag ergänzen |
| Luigi-Brief | Ermittlung_Familia_Antwort | ✅ Passage drin — aber EINSTIEG FEHLT (s.u.) |

### Was noch fehlt (Baureihenfolge)

1. **S8 „Das Muster" = `Ermittlung_S3b_Zweite_Suche`** — FEHLT KOMPLETT, Storylet `buch_pruefen` zeigt bereits darauf (toter Klick ab Spur `nachtfuhre`!). Inhalt: erneuter Blick ins Ausgabebuch (spielergesteuert übers Tageshub): über Monate verteilt weitere „zur Nachprüfung Westhof"-Einträge ohne Rückvermerk, alle in Orens sauberer Hand. Aus dem Einzelfall wird ein Kanal. Neue Spur (z. B. `fuhren_muster`), evtl. Erkenntnis: wann die NÄCHSTE Fuhre fällig wäre.
2. **Familia-Einstieg:** `familia_kontaktiert` wird nirgends gesetzt → Luigi-Brief kann nie feuern. Andockpunkt: `Stadt_Botenstand` bekommt ab Spur `nachtfuhre` die Option „Wort an Luigi schicken" (setzt `familia_kontaktiert = true` + `familia_kontakt_tag = $world.day`). Brief kommt +5 Tage via Wenzel. Inhaltlich: bestätigt den Kanal von außen („Schau in dein eigenes Haus"), liefert aber keinen Kopf.
3. **S9 „Der Beweis, den er nicht löschen kann":** Problem: das Ausgabebuch kann Oren vernichten. Lösung: die nächste C-Fuhre selbst dokumentieren + Abschrift + Krebs' Gegenbuch. Hier zahlen die Gattungs-Extras ein (persönliche Abzeichnung / fremder Fuhrmann). Timer-Mechanik: verdacht.orenmalk zu hoch → Fuhre gestrichen, Einträge „verunglückt" → härterer Alternativweg. Geschütz-Gattung bekommt hier ihren exklusiven Zugang (Artilleristen fahren selbst zur Esse).
4. **S10 Rindler-Finale + Koda:** Vorlage der Beweise — Wiedergutmachung der S2-Hauptmann-Szene (bzw. Hypothek: wer dort verbrannt hat, braucht Halm/den Namenlosen als Türöffner → die S2-Wahl hallt ins Finale). Rindler greift bei der nächsten Fuhre zu. Koda: Oren schweigt bei der Verhaftung, sieht Thomas nur an wie Jarek damals. In der beschlagnahmten Fracht: ein Zeichen/Siegel → der größere Kopf außerhalb der Akademie entkommt = **Kapitel-3-Faden**. Halms Fehleinschätzung („Angst") löst sich auf: Es war nie Angst, es war Disziplin.

---

## 3. Geplant: Abend-System (Kap2_Abend als Mini-Hub)

Eine Abend-Aktion ($world.abendAktion), dann Schlafen. Kandidaten: Schenke bei Nacht (Würfel/Bolte/Gerüchte — evtl. tagsüber rausnehmen), Lesen bei Kerzenlicht (Wissen vs. hasSlept=false), Waffenpflege (Flag gut_vorbereitet → nächster Drill sicher +1), Abend mit Karla (Mauer-Szene hierher verlegen — Romanze konkurriert dann nicht mit Tages-Aktionen), Früh schlafen (+5 Kondition). Später: S9-Nachtaktionen (Rampe beobachten) docken hier an. Umsetzung analog Tageshub: setup.kap2AbendStorylets.

## 4. Geplant: player.suspicion nutzbar machen

1. setup.suspicionMod() = floor(suspicion/20) als DC-Aufschlag auf alle Schleich-/Täusch-Checks (Einbruch, Torbuch, Trick, S9).
2. Schwellen-Interrupts: >=50 einmalig „Rapport bei Rindler" (Verhör, Wahl: ehrlich/Ausrede-Check; senkt suspicion, kostet Affection oder setzt Flag akteneintrag). >=80: Spinddurchsuchung (kritisch bei belastenden Items).
3. S10-Finale fragt suspicion + akteneintrag ab: auffälliger Thomas braucht bei Rindler mehr Beweise/Türöffner.

## 5. Geplant: Sidequests (kurz, breit, D&D-like)

Prinzip: 1 Aufhänger, 3–4 Skill-Wege, mehrere Ausgänge. Engine-Tweak nötig: in eligible() `if (passage.tags.includes("kap2") && w.kapitel1_gesperrt !== true) return false;` → Sidequests als [interrupt kap2] ohne Cond im Zufalls-Pool.

- „Der verschwundene Sold": Diebstahls-Beschuldigung unter Erstjährigen; gossip/thievery/medicine; Twist: Beschuldiger hat selbst verspielt.
- „Die lahme Stute": Westhof-Fuhrmann mit krankem Pferd; medicine/gossip/Geld; Belohnung: Fuhrleute-Wohlwollen → zahlt in S9 ein.
- „Das Duell" (Abend-Hub): illegales Duell; pike/combat dazwischengehen, melden, wetten (gossip), Feldscher bereitstehen.
- „Das Loch in der Palisade": Wachdienst, harmloser Bier-Schmuggel der Schenke; melden/schweigen/erpressen.
- „Der Brief": Rekrut kann nicht schreiben (scholarship); häusliches Unglück im Diktat → mercy/honesty-Entscheidung.

### Offene kleine Baustellen

Skillsystem mit Xp für Gattungsdrill anwenden. d
