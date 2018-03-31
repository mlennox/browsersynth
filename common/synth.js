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
  this.monitor = monitor;
  this.num_voices = num_voices || 4;
  this.voices = [];
  this.synthVoice = synthVoice;

  this.audioContext =
    ctx || new (window.AudioContext || window.webkitAudioContext)();
  this.voiceManager =
    voiceManager ||
    new VoiceManager({
      ctx: this.audioContext,
      num_voices: this.num_voices
    });
}

Synth.prototype = {
  init: function() {
    this.voices = [...this.generateVoices(this.ctx)];
    return {
      noteOn: (note, velocity) => {
        const action = this.voiceManager.voiceCheck(note);
        if (action.steal) {
          this.voices[action.voice_index].steal(note, velocity);
        } else if (action.update) {
          // polyPressure / aftertouch
          this.voices[action.voice_index].polyPress(note, velocity);
        } else {
          this.voices[action.voice_index].noteOn(note, velocity);
        }
      },
      noteOff: (note, velocity) => {
        const action = this.voiceManager.voiceCheck(note);
        this.voices[action.voice_index].noteOff();
      }
      // we'll create other handlers later
    };
  },

  /**
   * Well-tempered tuning. We could use Werkmeister or any other experimental tuning
   */
  midiNoteToFrequency: function(note) {
    // https://newt.phys.unsw.edu.au/jw/notes.html
    return Math.pow(2, (note - 69) / 12) * 440;
  },
  /**
   * Maybe the voices object should be able to clean up noteOn and noteOff assigning to voice stack?
   * TODO : will need to abstract this out to a module/prototype too, probably
   */
  generateVoices: function*(ctx) {
    let voice_count = 0;
    while (voice_count < this.num_voices) {
      voice_count++;
      yield this.synthVoice.generate();
    }
  }
};
