import MIDI from "../common/midi.js";
import Monitor from "./monitor.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    const channel_num = 1;
    const monitor = new Monitor({ display_container_id: "monitor" });
    const midi = new MIDI();
    midi.plugIn(
      {
        // NOTE : arrow functions here will maintain context for handler
        monitor: message => monitor.handleMessage(message)
      },
      channel_num
    );
    midi.requestAccess();
  }
});
