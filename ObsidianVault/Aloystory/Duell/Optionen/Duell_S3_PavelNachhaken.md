---
type: option
id: Duell_S3_PavelNachhaken
label: Pavel nachhaken
szene: "[[Duell_S3_Ereignisse]]"
status: neu
check:
next: "[[Duell_S3_PavelFestBefragen]]"
delta_pavel_trust: 1
delta_bronko_trust: -1
---

# Pavel nachhaken

Pavel erzählt, gerade koche alles hoch — Bronko habe seiner Familie Schande gebracht.
[!abstract] Check: [[fest]]

- **Wenn wahr:** kann nachgehakt werden → [[Duell_S3_PavelFestBefragen]]
    
- **Wenn falsch:** muss Check bestehen

Gehört zu: [[Duell_S3_Ereignisse]]

## Check

–skillcheck:
gossip 13 mit modifier [[pavel_trust]] (negativ wert macht check schwerer und vice versa))-> success pavel werzählt seine Wahrheit

## Kosten

- [[bronko_trust]] −1

## Nutzen

- [[pavel_trust]] +1
- 
- Wenn [[fest]] bekannt ist, kann nachgehakt werden → [[Duell_S3_PavelFestBefragen]]

## Danach

→ [[Duell_S3_PavelFestBefragen]]
