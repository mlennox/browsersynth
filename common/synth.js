import { VoiceManager } from "./voiceManager.js";

/**
 * Protoype for all synths
 * @param {*} options
 */
function Synth(options) {
  const { monitor, voiceManager, num_voices, synthVoice, ctx } = options || {};
  if (!synthVoice) {
    throw new Error("you must provide a synthVoice");
  }
  this.synthVoice = synthVoice;
  this.monitor = monitor;
  this.num_voices = num_voices || 4;
  this.voices = [];

  this.audioContext =
    ctx || new (window.AudioContext || window.webkitAudioContext)();
  this.voiceManager =
    voiceManager ||
    new VoiceManager({
      ctx: this.audioContext,
      num_voices: this.num_voices
    });

  this.synthVoice.init({ ctx: this.audioContext });
}

Synth.prototype = {
  init: function() {
    this.voices = [...this.generateVoices()];
    return {
      noteOn: (note, velocity) => this.noteOn(note, velocity),
      noteOff: note => this.noteOff(note)
      // we'll create other handlers later
    };
  },
  noteOn: function(note, velocity) {
    const action = this.voiceManager.voiceCheck(note);
    console.log("action", action);
    if (action.steal) {
      this.voices[action.voice_index].steal(note, velocity);
    } else if (action.update) {
      // polyPressure / aftertouch
      this.voices[action.voice_index].polyPress(note, velocity);
    } else {
      this.voices[action.voice_index].noteOn(note, velocity);
    }
  },
  noteOff: function(note, velocity) {
    const action = this.voiceManager.voiceCheck(note);
    this.voiceManager.voiceFree(note);
    this.voices[action.voice_index].noteOff();
  },

  generateVoices: function*() {
    let voice_count = 0;
    while (voice_count < this.num_voices) {
      voice_count++;
      yield this.synthVoice.generate();
    }
  }
};

export { Synth };
