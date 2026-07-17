/* =========================================================
   AUTOSAVE  (Slot 0)
   Autosave nach jedem Passagenwechsel — schlicht, wie zuvor.
   Kein Auto-Continue, kein Restart-Wrap.
   ========================================================= */

postdisplay["world-tracker"] = function () {
    const forbidden = ["journalAnsicht", "Kapitel 0"];
    const title = State.current.title;
    if (forbidden.includes(title)) return;
 
    State.variables.world ||= {};
    State.variables.world.lastPassage = title;

    try {
        Save.browser.slot.save(0, "Autosave");
    } catch (error) {
        console.error(error);
        UI.alert(error);
    }
};
