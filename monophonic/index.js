import MonoPhonic from "./monophonic.js";
import MIDI from "./midi.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    let midi = new MIDI();
    new MonoPhonic({ max_voices: 1, midi });
  }
});
