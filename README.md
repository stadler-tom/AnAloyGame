# An Aloy Story — Entwickler-README

„You own story"-Spiel in **Twine** mit dem Story-Format **SugarCube 2.37.3**.
Setting: Aloy. Hauptfigur: **Thomas Wabbler**.

Diese README richtet sich an Entwickler/Autoren, die am Spiel weiterbauen. Sie erklärt
das Datenmodell, die wiederverwendbaren `setup.*`-Funktionen und die Konventionen,
nach denen Passagen aufgebaut sind.

---

## 1. Schnellstart

- **Quelle:** `An_Aloy_Story.twee` (Twee-3-Format, ein File für die ganze Story).
- **Format:** SugarCube `2.37.3` (siehe `StoryData` am Dateianfang).
- **Startpassage:** `Kapitel 0`.
- **Kompilieren:** Mit `tweego` (oder Twine-Import). Beispiel:
  ```
  tweego -o An_Aloy_Story.html An_Aloy_Story.twee
  ```
- **Code-Bereiche:** Der gesamte JavaScript-Code steht in der Passage
  `StoryScript [script]`, das CSS in `StoryStylesheet [stylesheet]`.

> **Wichtig:** `Config.history.maxStates = 1` ist gesetzt. Es gibt also **kein**
> Vor/Zurück über die Historie und `<<back>>`/`<<return>>` funktionieren nicht.
> Navigation zurück läuft immer über explizite Links (z. B. das Notizbuch nutzt
> `$world.lastPassage`).

---

## 2. Passagen-Konventionen

| Präfix / Tag | Bedeutung |
|---|---|
| `Init*` (`InitPlayer`, `InitNPC`, `InitWorld`) | Bauen die State-Objekte auf, werden von `StoryInit` per `<<include>>` geladen |
| `00_Sidequest_*`, `01_Sidequest_*` | Sidequest-Bäume; enden je auf einer `_finalize`-Passage |
| `Nachmittag *` | Trainingsstationen (Hub + 5 Stationen) |
| `Wuerfel_*` | Würfelspiel-Logik |
| `Event_*` | Zufalls-/Abendevents in der Stube |
| `*Texte` (`AbendappellTexte`, `GossipTexte`, `TrainingsHubTexte`, `Kap1_Der_naechste_Tag_Texte`) | **Reine JSON-Datenpassagen** (Text-Vaults), kein Spielertext |
| Tag `[tagesstart]` | Markiert den kanonischen Tagesbeginn → triggert automatisch `resetDailyVariables()` |
| Tag `[header]` | `PassageHeader` rendert den HUD-Balken |
| Tag `[script]` / `[stylesheet]` | JS bzw. CSS |

**Ausgabe-Pattern:** Funktionen, die HTML zurückgeben (alle `set*`-Reward-Funktionen,
`render*`, `get*Text`), werden mit dem Print-Macro ausgegeben:

```
<<= setup.setNpcAffection("karla", 3)>>
```

`<<= ...>>` gibt den Rückgabewert aus (HTML wird gerendert). `<<run ...>>` ruft nur auf,
ohne Ausgabe. `<<print ...>>` ist das Langform-Äquivalent zu `<<=>>`.

---

## 3. Datenmodell (State)

Drei Top-Level-Story-Variablen, initialisiert in den `Init*`-Passagen.

### `$player` (InitPlayer)
```js
{
  name: "Thomas",
  fullname: "Thomaso Wabbler",
  rank: "Zivilist",          // wird später zu "Rekrut"
  chosen_activity: "",       // s. u. — wird doppelt genutzt (Achtung, AS-23)
  money: { copper: 2 },      // nur Kupfer wird gespeichert, Umrechnung via setup.getMoney
  inventory: [],
  stats:      { mercy, ambition, honesty },      // Start je 50
  reputation: { land, ohm, church },             // Start je 0
  knowledge:  { pike, cannon, medicine, thievery, crossbow, gossip }, // Start je 0
  rumors: []
}
```

### `$npc` (InitNPC)
Objekt mit einem Eintrag pro NPC. Schema je NPC:
```js
karla: {
  name: "Karla",
  known: false,            // erst true, sobald getroffen → erscheint im Notizbuch
  affection: 0,
  trust: 0,
  isRealPlayer: false,     // true = realer Spieler aus anderer Gruppe (Plot-Hook)
  memory: { flags: {}, events: [] },  // flags: benannte Booleans; events: Array von Strings
  journalEntry: "…"        // Text im Notizbuch
}
```
Die Geheimnisse der NPCs stehen als **Kommentar** im journalEntry-Block (Plotlogik,
nicht sichtbar). `isRealPlayer: true` markiert u. a. `luigi` — Thomas' Pate.

### `$world` (InitWorld)
```js
{
  lastPassage: "",          // von postdisplay gesetzt; Ziel des Notizbuch-Zurück-Links
  day: 1,
  weather: "windig",        // täglich neu gewürfelt in resetDailyVariables()
  wasPracticing: false,
  needsDiceGame: true,      // steuert den gescripteten ersten Würfel-Moment
  seenGossip: {},           // { storyId: { id, success } }
  currentGossipStory: ""    // Zwischenspeicher zwischen Gossip-Passagen
}
```

---

## 4. Die wichtigsten `setup.*`-Funktionen

Alle in `StoryScript [script]`. Aufruf in Passagen i. d. R. mit `<<= ...>>`.

### 4.1 NPC

| Funktion | Zweck / Rückgabe |
|---|---|
| `setup.setNpcAffection(npcKey, modifier)` | Ändert `affection`. Gibt eine farbige `system-alert`-Box zurück (positiv/negativ) |
| `setup.pushNpcMemory(npcKey, event)` | Hängt `event`-String an `memory.events`. Gibt Info-Box zurück |
| `setup.hasNpcMemory(npcKey, event)` | `true`, wenn das Event gemerkt wurde |
| `setup.enoughNpcAffection(npcKey, requiredValue)` | `true`, wenn `affection >= requiredValue` |

```
<<= setup.setNpcAffection("jarek", 6)>>
<<= setup.pushNpcMemory("jarek", "war_diskret")>>

<<if setup.hasNpcMemory("schinder", "zeigt_eigeninitiative")>>…<</if>>
<<if setup.enoughNpcAffection("karla", 5)>>…<</if>>
```
NPC-`flags` werden direkt gesetzt (kein Helper): `<<set $npc.karla.memory.flags.sidequest00Complete = true>>`.

### 4.2 Spieler-Werte

| Funktion | Erlaubte Keys |
|---|---|
| `setup.setPlayerStat(statKey, modifier)` | `mercy`, `ambition`, `honesty` |
| `setup.setPlayerKnowledge(knowledgeKey, modifier)` | `pike`, `cannon`, `medicine`, `thievery`, `crossbow`, `gossip` |
| `setup.setPlayerReputation(repKey, modifier)` | `land`, `ohm`, `church` |

Alle drei prüfen den Key (`console.warn` bei Tippfehler) und geben eine `system-alert`-Box
zurück. Beispiel:
```
<<= setup.setPlayerStat("honesty", -2)>>
<<= setup.setPlayerKnowledge("gossip", 1)>>
```

### 4.3 Inventar, Gerüchte, Geld

```
<<= setup.addItem("Rostiger Dolch")>>      <<if setup.hasItem("Rostiger Dolch")>>…<</if>>
<<= setup.addRumor("Edric saß zu Unrecht.")>>   <<= setup.renderRumors()>>

<<set _m = setup.getMoney($player.money.copper)>>  /* → { gold, silver, copper } */
$m.gold G  $m.silver S  $m.copper K
```
Umrechnung: `7 Kupfer = 1 Silber`, `10 Silber = 1 Gold` (`setup.money`). Gespeichert wird
**nur** `$player.money.copper`; alles andere wird per `getMoney()` berechnet.

### 4.4 Welt / Tageswechsel

`setup.resetDailyVariables()` würfelt das Wetter neu, setzt `wasPracticing = false`
und erhöht `day` um 1. **Nicht selbst aufrufen**, wenn die Passage bereits den Tag
`[tagesstart]` trägt — der `predisplay`-Hook macht das automatisch
(siehe Hinweis zu Doppel-Increment in AS-21).

### 4.5 Rendering (Notizbuch)

| Funktion | Liefert |
|---|---|
| `setup.renderPlayerTable()` | HTML-Tabelle mit Stats/Knowledge/Reputation/Geld/Inventar |
| `setup.renderJournal()` | Alle NPCs mit `known === true` + Affection |
| `setup.renderRumors()` | Liste der gesammelten Gerüchte |

Werden in `journalAnsicht` per `<<print …>>` ausgegeben.

---

## 5. Text-Vault-System (datengetriebene Texte)

Damit Fließtexte nicht im Code kleben, liegen sie als **JSON in eigenen Passagen** und
werden zur Laufzeit geparst. Es gibt vier Vaults:

| Vault-Passage | Getter | Kategorien |
|---|---|---|
| `AbendappellTexte` | `setup.getAbendappellText(cat)` | `szenerie`, `hauptmann`, `gedanke` |
| `Kap1_Der_naechste_Tag_Texte` | `setup.getNaechsterTagText(cat)` | `morgen`, `koerper`, `gedanke`, `luigi_schatten` |
| `TrainingsHubTexte` | `setup.getRandomText(...)` / `setup.executeStationRewards(...)` | Hub-Texte + Stationen |
| `GossipTexte` | `setup.getGossipStory()` u. a. | `stories.lagerklatsch/landesinfos/knaller` |

### 5.1 Lazy-Loader-Muster

Jeder Vault wird **einmal** aus der Passage geparst und gecacht:
```js
setup.abendappellTextVault = null;
setup.loadAbendappellVault = function () {
    if (!setup.abendappellTextVault) {
        setup.abendappellTextVault = JSON.parse(Story.get("AbendappellTexte").text);
    }
};
```
> **Achtung:** `setup.*` ist **nicht** Teil des gespeicherten States und wird bei
> Reload/Save-Load **nicht** wiederhergestellt. Deshalb braucht jeder Vault einen
> Lazy-Loader, der bei Bedarf neu parst. (`TrainingsHubTexte` fehlt dieser aktuell →
> siehe AS-19.) **Neue Vaults immer mit Lazy-Loader bauen.**

### 5.2 Kontext-Matching (`context`-Objekt)

Jeder Texteintrag kann ein `context` tragen. Die Getter filtern danach und bevorzugen
spezifische Treffer vor generischen:
```json
{ "text": "…", "context": { "minDay": 3, "maxDay": 10 } }
{ "text": "…", "context": { "activity": "pike" } }
{ "text": "…", "context": { "weather": "regen" } }
{ "text": "…", "context": {} }                       // generisch, immer wählbar
```
Regeln:
- `minDay`/`maxDay` grenzen über `$world.day` ein.
- `activity` matcht gegen `$player.chosen_activity`.
- `weather` matcht gegen `$world.weather` (nur in `getNaechsterTagText`).
- Gibt es passende `activity`/`weather`-Treffer, werden **nur** diese verwendet;
  sonst fällt der Getter auf den generischen Pool zurück.
- `luigi_schatten` ist ein Sonderfall: nur Einträge mit `context.luigi_chance: true`
  und nur mit **25 %** Wahrscheinlichkeit (subtiler Paten-Hook). Sonst leerer String.

### 5.3 Neuen Text hinzufügen

Einfach einen Eintrag im JSON der passenden Vault-Passage ergänzen — kein Code nötig.
Auf gültiges JSON achten (kein Komma nach dem letzten Element). HTML im Text ist erlaubt
(z. B. `<div class=\"thought-box\">…</div>`), Anführungszeichen darin escapen: `\\\"`.

---

## 6. Trainingsstationen

Eine Station (`Nachmittag Pike/Cannon/Medicine/Crossbow/Thievery`) ruft dreimal
`executeStationRewards` auf:

```
<div class="scenery-text"><<= setup.executeStationRewards("pike", "scenery")>></div>
<<= setup.executeStationRewards("pike", "main")>>
---
<div class="thought-box"><<= setup.executeStationRewards("pike", "thoughts")>></div>
```

- `setup.executeStationRewards(stationKey, stationType)`:
  - `stationType: "scenery"` → gibt einen zufälligen Szenerie-Text **und** vergibt die
    Belohnung aus `stations[stationKey].rewards` (Stat + Knowledge). Setzt zudem
    `$player.chosen_activity = rewards.knowledge`.
  - `stationType: "main"` / `"thoughts"` → wählt Text nach **Skill-Level** des Spielers:
    `novice` (< 4), `medium` (4–7), `expert` (> 7).

### Neue Station / neue Belohnung anlegen

Im JSON von `TrainingsHubTexte` unter `stations` ergänzen:
```json
"pike": {
  "scenery": [ "…", "…" ],
  "main":     { "novice": ["…"], "medium": ["…"], "expert": ["…"] },
  "thoughts": { "novice": ["…"], "medium": ["…"], "expert": ["…"] },
  "rewards":  { "stat": "ambition", "statValue": 1, "knowledge": "pike", "knowledgeValue": 1 }
}
```
Hub-Beschreibungen/Subtexte stehen unter `hubIntros`, `hubScenery`, `hubThoughts`,
`hubSubtexts.<stationKey>`.

> **Hinweis:** Belohnungen werden bei jedem `scenery`-Aufruf vergeben (kein
> Einmal-Schutz) → siehe AS-20, bevor neue reward-tragende Stationen gebaut werden.

---

## 7. Gossip-System

Ablauf: `Event_Geschichte` zieht eine Story → optional „Nachhaken" (`Event_Geschichte_Probe`)
mit Würfelprobe.

| Funktion | Zweck |
|---|---|
| `setup.getGossipStory()` | Nächste **ungesehene**, zum Gossip-Level passende Story (oder `null`) |
| `setup.getFailedGossipStory()` | Bereits gesehene, aber **nicht** erfolgreich abgeschlossene Story |
| `setup.markGossipSeen(id, success=false)` | Markiert Story als gesehen + Erfolgsstatus |
| `setup.hasSeenGossip(id)` / `setup.wasGossipSuccessful(id)` | Status-Abfragen |
| `setup.rollGossipProbe(skill, difficulty)` | Probe: `difficulty 0` = Auto-Erfolg; Skill 1–2 = 80 % Bonus; sonst `w10 + skill >= difficulty + 5` |
| `setup.getProbeThoughtText(skill, difficulty)` | Gedanken-Hinweis vor der Probe (`null` = kein „Nachhaken"-Link) |
| `setup.getSuccessThought(skill, difficulty)` | Erfolgs-Gedankenbox abhängig vom Skill |

### Neue Gossip-Story anlegen

Eintrag in `GossipTexte.stories.<kategorie>` (`lagerklatsch` / `landesinfos` / `knaller`):
```json
{
  "id": "lk_004",
  "minLevel": 0, "maxLevel": 2,
  "base": "Einstiegstext der Geschichte…",
  "probe": {
    "difficulty": 1,
    "success": "Text bei bestandener Probe…",
    "fail": "Text bei misslungener Probe…"
  },
  "rumorText": "Was ins Notizbuch wandert.",
  "npcKey": "schinder"
}
```
`minLevel`/`maxLevel` gaten über `$player.knowledge.gossip`. `id` muss eindeutig sein
(steuert „schon gesehen"). Bei Erfolg wird automatisch `gossip +1` und `rumorText`
ins Notizbuch geschrieben.

---

## 8. HUD, Notizbuch & Autosave

- **HUD** (`PassageHeader [header]`): zeigt Tag, Geld, Wetter und den Notizbuch-Link.
  Wird über `setup.isJournalBlocked()` auf bestimmten Passagen ausgeblendet
  (`Intro`, `Das Erwachen`, `journalAnsicht`, alle `Kapitel…`).
- **Notizbuch** (`journalAnsicht`): rendert Spielertabelle, NPCs und Gerüchte.
  Der Zurück-Link springt auf `$world.lastPassage`.
- **lastPassage / Autosave** (`postdisplay["world-tracker"]`): merkt nach jeder Passage
  den Titel in `$world.lastPassage` (außer `journalAnsicht`) und speichert.
  (Zur aktuellen Save-Implementierung siehe AS-22.)

---

## 9. CSS-Hilfsklassen (StoryStylesheet)

| Klasse | Verwendung |
|---|---|
| `.scenery-text` | Umgebungs-/Wetterbeschreibung (kursiv, grün) |
| `.thought-box` | Innerer Monolog / Gedanken |
| `.voice-aggressive` / `.voice-whisper` / `.voice-formal` | Stimmstile (brüllen / flüstern / formell) |
| `.system-alert` + `.status-positive/.status-negative/.status-info` | System-Meldungen (Werteänderungen) — werden von den `set*`-Funktionen erzeugt |
| `.beziehung` | Beziehungs-/hinweisgesteuerter Text |
| `.sandbox-menu` | Auswahlmenü im Trainings-Hub |

Inline-Stilkürzel im Twee: `@@.voice-aggressive;…@@` ist äquivalent zu
`<span class="voice-aggressive">…</span>`.

---

## 10. Bekannte Probleme (Jira)

Aus dem Code-Review angelegt im Projekt **AS** (An Aloy Story):

| Key | Schwere | Kurz |
|---|---|---|
| AS-19 | Hoch | TrainingsHub-Vault wird nach Reload nicht neu geladen → Stationen zeigen Fehler |
| AS-20 | Hoch | Stationen vergeben Belohnungen bei erneutem Betreten erneut (Notizbuch-Round-Trip) |
| AS-21 | Mittel | Tageszähler wird doppelt erhöht (Nachtruhe 1 + tagesstart-Hook) |
| AS-22 | Mittel | Autosave nutzt deprecate `Save.slots.save(0)` und überschreibt manuellen Slot 0 |
| AS-23 | Mittel | `$player.chosen_activity` doppelt belegt; „gossip"-Kontexttexte tot |
| AS-24 | Mittel | Würfel-Scripted-Win: Anzeige (5) ≠ Auszahlung (10) ≠ Narrativ (8) |
| AS-25 | Niedrig | `Event_Schlaegerei` unfertig (nur „Fäuster"), wird zufällig gezeigt |
| AS-26 | Niedrig | Sammelticket Rechtschreib-/Konsistenzfehler |

---

## 11. Konventionen & Stolpersteine (Checkliste)

- `setup.*` ist **nicht persistent** — niemals dort State ablegen, der überleben soll.
  Spielzustand gehört in `$player` / `$npc` / `$world`.
- Neue Vaults **immer** mit Lazy-Loader (`JSON.parse(Story.get("…").text)`).
- `maxStates = 1`: keine History-Navigation; immer explizite Links setzen.
- Funktionen, die HTML liefern, mit `<<= …>>` ausgeben — nicht mit `<<run>>`.
- Tageswechsel ausschließlich über den `[tagesstart]`-Tag steuern (nicht zusätzlich manuell).
- Vault-JSON: valide halten (letztes Element ohne Komma); ein Syntaxfehler legt den
  ganzen Getter lahm.
