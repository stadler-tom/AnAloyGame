/* ===== DUELL: Ende-Berechnung & Nachwirkung ===== */

/* Ausgang = rein aus dem Wissen (deine S5-Tabelle). Trust steckt schon in den Checks. */
setup.duellEnde = function () {
    var d = State.variables.world.duell, w = d.wissen;
    var wb = w.wahrheit_bronko, wp = w.wahrheit_pavel;
    var wahrheit = wb && wp;

    var tier = wahrheit ? "A" : (wb || wp) ? "B" : "C";

    var variante;
    if (tier === "A") {
        variante = w.bronko_reue ? "A_versoehnt" : "A_kuehl";
    } else if (tier === "B") {
        if (wp && d.flags && d.flags.verrat) variante = "B_pavel_verrat";
        else if (wb) variante = w.bronko_reue ? "B_bronko_reue" : "B_bronko";
        else variante = "B_pavel";
    } else {
        variante = "C";
    }
    return { tier: tier, variante: variante };
};

/* Standing NUR für die Nachwirkung — ändert nie den Ausgang. */
setup.duellEinfluss = function () {
    var d = State.variables.world.duell, w = d.wissen;
    var wert = d.pavel_trust + d.bronko_trust
             + (w.brief ? 1 : 0)
             + (w.bronko_reue ? 1 : 0);
    var band = wert >= 3 ? "friedensstifter"
             : wert >= 0 ? "gemischt"
             :             "verbrannt";
    return { wert: wert, band: band };
};

