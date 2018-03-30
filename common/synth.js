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
  },
  /**
   * Maybe the voices object should be able to clean up noteOn and noteOff assigning to voice stack?
   */
  generateVoices: function*(ctx) {
    let voice_count = 0;
    while (voice_count < this.max_voices) {
      voice_count++;
      const voice = {
        oscillator: ctx.createOscillator(),
        volume: ctx.createGain(),
        steal: (note, velocity) => {
          // we will ramp down the voice volume quickly
          // and then play the new note - if passed
          if (note) {
            this.noteOn(note, velocity);
          }
        },
        noteOff: () => {
          // could do some ADSR stuff here
        },
        noteOn: (note, velocity) => {
          // TODO: we need to have the synth context here too
          //    - this.ctx
          //    - this.envelope
          //    - etc.
          // this.oscillator.frequency.setTargetAtTime(
          //   this.midiNoteToFrequency(note),
          //   0,
          //   0
          // );
          // this.volume.gain.linearRampToValueAtTime(
          //   1.0 * (velocity / 127),
          //   this.audioContext.currentTime + this.envelope.attack
          // );
        },
        polyPress: (note, velocity) => {
          // adjust the velocity
        }
      };
      voice.oscillator.connect(voice.volume);
      voice.volume.connect(ctx.destination);
      voice.volume.gain.setValueAtTime(0.0, ctx.currentTime);
      yield voice;
    }
  }
};
