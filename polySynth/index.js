import { Synth } from "../common/synth.js";
import { ExampleSynthVoice } from "../common/exampleSynthVoice.js";
import { MIDI } from "../common/midi.js";
import { Monitor } from "../midimonitor/monitor.js";

document.addEventListener("DOMContentLoaded", function() {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    let midi = new MIDI({
      channels: {
        "1": new Synth({
          num_voices: 8,
          monitor: new Monitor(),
          synthVoice: new ExampleSynthVoice()
        })
      }
    });
  }
});
