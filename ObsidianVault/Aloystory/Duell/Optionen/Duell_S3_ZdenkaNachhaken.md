---
type: option
id: Duell_S3_ZdenkaNachhaken
label: Zdenka nachhaken
szene: "[[Duell_S3_Ereignisse]]"
status: neu
check:
next: "[[Duell_S3_PavelKonfrontieren]]"
setzt:
  - "[[fest]]"
  - "[[wahrheit]]"
  - "[[brief]]"
  - "[[bronko_reue]]"
---

# Zdenka nachhaken

Sie erzählt, dass auf dem Fest etwas vorgefallen ist.

Gehört zu: [[Duell_S3_Ereignisse]]

## Check

–

## Nutzen

- Basis: [[fest]] = true
- Ab [[zdenka_trust]] ≥ 1 die ganze Wahrheit:
  - Marja ist von Bronko schwanger.
  - Brief: Marja bittet, Bronko auszurichten, dass alles gut läuft — aber Zdenka soll Pavel nichts sagen, sonst flippt er aus.
  - Motiv: Marja schützt Bronko vor Pavels Zorn.
  - → [[wahrheit]] = true, [[brief]] = true, [[bronko_reue]] = true

## Danach

→ [[Duell_S3_PavelKonfrontieren]]
