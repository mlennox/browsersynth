import { MIDI } from "../common/midi.js";
import { Monitor } from "./monitor.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    const midi = new MIDI({
      channels: {
        "1": new Monitor({ display_container_id: "monitor" })
      }
    });
  }
});
