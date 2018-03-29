// synth prototype
import { VoiceManager } from "./voiceManager.js";

function Synth(options) {
  const { monitor, voiceManager, max_voices } = options || {};
  this.monitor = monitor;
  this.voiceManager = voiceManager || new VoiceManager();
  this.max_voices = max_voices || 4;
}

Synth.prototype = {
  init: function() {
    // generates the voices
    // returns the handlers
  }
};
