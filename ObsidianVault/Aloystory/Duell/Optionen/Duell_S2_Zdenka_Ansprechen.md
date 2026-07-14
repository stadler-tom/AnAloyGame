---
type: option
id: Duell_S2_Zdenka_Ansprechen
label: Zdenka ansprechen
szene: "[[Duell_S2_Mittag]]"
status: bleibt
check: gossip
next: "[[Duell_S3_Ereignisse]]"
setzt:
  - "[[zdenka_trust]]"
  - "[[ahnt_mehr]]"
---

# Zdenka ansprechen

Zdenka direkt ansprechen und versuchen, etwas herauszufinden.

Gehört zu: [[Duell_S2_Mittag]]

## Check

gossip

## Kosten

- Fehlschlag: [[zdenka_trust]] −1

## Nutzen

- Erfolg: [[zdenka_trust]] +1, [[ahnt_mehr]] = true

## Danach

→ [[Duell_S3_Ereignisse]]
