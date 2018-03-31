import BasicSynth from "./basicSynth.js";
import MIDI from "../common/midi.js";
import Monitor from "../midimonitor/monitor.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    let midi = new MIDI();
    new BasicSynth({
      midi,
      monitor: new Monitor()
    });
  }
});
