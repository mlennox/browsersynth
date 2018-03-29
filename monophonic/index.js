import MonoPhonic from "./monophonic.js";
import { MIDI } from "../common/midi.js";
import { Monitor } from "../midimonitor/monitor.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    let midi = new MIDI({
      channels: {
        "1": new MonoPhonic({
          monitor: new Monitor()
        })
      }
    });
  }
});
