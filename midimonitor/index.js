import MIDI from "../common/midi.js";
import monitor from "./monitor.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    const channel_num = 1;
    const midi_monitor = new monitor({ display_container_id: "monitor" });
    const midi = new MIDI();
    midi.plugIn(
      {
        // NOTE : arrow functions here will maintain context for handler
        monitor: message => midi_monitor.handleMessage(message)
      },
      channel_num
    );
    midi.requestAccess();
  }
});
