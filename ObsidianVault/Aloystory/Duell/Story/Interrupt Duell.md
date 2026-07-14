

feuert 6 Tage nach dem Duell. 

je nach Ausgang wird etwas anderes Berichet

# [[Duell_Ende_A|Happy End]]
Kein Blut. Der Bericht, der die Akademie erreicht, klingt fast ungläubig — zwei Rabenfurter, die sich **nicht** die Köpfe eingeschlagen haben.

**A_versoehnt** — Die Wahrheit ist heraus, bei Pavel wie bei den Alten. Der Streit um die Brücke läuft weiter (Papier stirbt langsamer als Hass), aber zum ersten Mal seit Generationen sitzen ein Pipovic und ein Kulitcka an einem Tisch. Der Rat greift die Brückenadministration auf — diesmal nicht als Strafsache, sondern zur Schlichtung.

- **Marja:** Weil Bronko weiß, dass sie lebt, und Pavel weiß, dass er sie nicht rächen muss, öffnet sich der Weg zurück. Das Kind bekommt einen Namen — und zwei Familien, die lernen müssen, damit zu leben.
- **Zdenka:** bestätigt. Aus der heimlichen Briefträgerin wird die anerkannte Vermittlerin. Ihr Stolz-hat-euch-alles-gekostet trifft diesmal auf offene Ohren.
- **Spieler:** `$player.reputation.Rabenfurth +3`. Bronko wie Zdenka wissen, dass es ohne dich anders geendet hätte.

**A_kuehl** — Die Klingen sanken aus Vernunft, nicht aus Versöhnung. Die beiden meiden einander, aber sie leben, und keiner sitzt vor Gericht. Der Frieden ist kalt und brüchig; die Alten grollen weiter, doch niemand ist gestorben, um den Groll zu nähren.

- **Marja:** in Sicherheit, aber fern. Die Wahrheit ist bekannt, die Wunde nicht geheilt — ob sie je zurückkehrt, bleibt offen.
- **Zdenka:** erleichtert, dass keiner fiel, aber sie traut dem Frieden nicht.
- **Spieler:** `$player.reputation.Rabenfurth +1`. Respekt dafür, den Tod verhindert zu haben — keine Wärme.

# [[Duell_Ende_B||Neutral]]

Es floss Blut, aber keiner starb. Vor der Akademie steht Disziplinarisches (ein Duell bleibt ein Duell), vor Rabenfurt steht die alte Fehde — unverändert, nur um eine Wunde reicher. Kein Malefizgericht, kein Staatsakt. Noch nicht.

**B_bronko_reue** — Pavel hat im letzten Moment die Klinge sinken lassen. Was er in Bronkos Gesicht sah, lässt ihn nicht los. Sechs Tage später fragt er zum ersten Mal selbst nach — leise, misstrauisch, aber er fragt. Ein Riss im Panzer.

- **Marja:** noch verborgen; die Wahrheit hat Pavel gestreift, aber nicht erreicht.
- **Zdenka:** vorsichtig hoffnungsvoll. Vielleicht war das der Anfang von etwas.
- **Spieler:** `+1`, wenn `zdenka_trust > -2`.

**B_bronko** — Bronko fing den Hieb, ehe die Wachen dazwischen waren. Er überlebt, verwundet, aber es gab keinen Moment der Erkenntnis. Die Fehde brennt weiter, jetzt mit frischem Blut als Brennstoff. Pavel bereut nichts.

- **Marja:** bleibt fort. Kein Grund für sie zurückzukommen.
- **Zdenka:** ernüchtert.

**B_pavel** — Du hast Pavels Zorn gebremst, aber Bronkos Wahrheit nie an die Oberfläche gebracht. Der Kampf wurde getrennt, beide gezeichnet. Pavel bleibt verbittert — er erfährt nie, dass Bronko liebte. Die Fehde schwelt.

**B_pavel_verrat** — Der schwerste der neutralen Ausgänge. Bronko ist schwer verwundet. Und Pavel **weiß** jetzt: Marja lebt, sie trägt Bronkos Kind. Aus der alten Fehde wird eine Jagd.

- **Zdenka & Bronko:** verachten dich. `zdenka_trust` und ``bronko_trust`` steht am Boden.
- **Spieler:** bei `zdenka_trust <= -2` spuckt sie dich an, `$player.reputation.Rabenfurth -5`, Persona non grata bei den gemäßigten Kräften.
# [[Duell_Ende_C|Tragödie]]

Überlebender Rekrut vor Malefiz Gericht. 
Starke Ausschreitung in Rabenfurt. Die beiden Familien sind in einer Blutigen Auseinandersetzung aneinander. Mehrere Tote. 

Die Sache kommt vor den Rat. 
Die Brückenadministration wird Staatsakt. Die Familienoberhäupter werden Malfizgerichtlich belangt. 
Es steht eine das Wort "Umsiedlung" im Raum um den Frieden zu erzwingen


Wenn Bronko tot:
- **Marjas Flucht**: Marja hat noch einen Letzten Abschiedsbrief an Zdenka geschickt. Marja hat die Flucht nach Tiafunt gewagt. Sie wird ein Schiff besteigen, irgendeines. Egal wohin, nur weg von Aloy, den Pipovics und den Kilickas. 

 - **Zdenkas Weg:** Zdenka quittiert den Dienst an der Akademie. Sie kehrt nach Rabenfurt zurück, nicht als Soldatin, sondern als „Trümmerfrau“. Sie versucht, den Überlebenden der Familien zu vermitteln, dass ihr Stolz sie alles gekostet hat. Ihr Scheitern oder Erfolg hängt hierbei maßgeblich von den vergangenen Interaktionen mit den Spielern ab.
Wenn Pavel tot:
- **Zdenkas Weg:** Zdenkas Rolle wird hier zur wichtigsten Variable. Sie ist die einzige, die bezeugen kann, dass Bronko beim Drill Schläge zurückgehalten hat und dass das Duell nicht von ihm provoziert wurde, sondern aus Pavels Ehrbegriff heraus entstand. Sie steht vor dem Dilemma: Entlastet sie Bronko, rettet sie ihn vor dem Strick, macht sich aber bei den Pipovics zur Verräterin, die den Mörder ihres Freundes Pavel geschützt hat. Wenn sie Bronko schützt, wird sie in Rabenfurt als „Kulitcka-Freundin“ gebrandmarkt. Ihre Rolle als Friedensstifterin ist dann unmöglich. Wenn sie schweigt, ist sie für Bronkos Tod verantwortlich. Zdenka quittiert den Dienst an der Akademie. Sie kehrt nach Rabenfurt zurück, nicht als Soldatin, sondern als „Trümmerfrau“.


**wenn zdenka trust <= -2**: sie gibt dem spieler die AlleinSchuld an dem Ausgang. und Spuckt ihn an.macht ihn zu einer Persona non grata bei den gemäßigten Kräften
      $player.reputation.Rabenfurth -5
**else** sie verabschiedet sich vom Spieler und dankt ihm für seine Teilhabe
      $player.reputation.Rabenfurth +1