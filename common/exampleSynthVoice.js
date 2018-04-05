/**
 * This will serve as an example blueprint for creating synth voices - essentially the synth itself
 * This is a class, but ou could use a prototype just as easily
 *
 * NOTE : options will allow connection of synth params to keyboard controls
 */

class ExampleSynthVoice {
  constructor(options) {
    // ADSR envelope - sustain is a volume level not time like the other parameters
    // NOTE : this is not really used fully yet
    this.envelope = {
      attack: 0.01,
      decay: 0.01,
      sustain: 0.5, // we'll use this as a multiplier of peak volume - only multiplies up to max velocity!
      release: 0.1
    };
    this.portamento = 0.0;

    this.osc1 = null;
    this.osc2 = null;
    this.volume = null;

    this.generate = this.generate.bind(this);
    this.calculateVelocity = this.calculateVelocity.bind(this);
  }

  init(options) {
    const { ctx } = options;
    if (!ctx) {
      throw new Error("you must provide the audio context");
    }
    this.ctx = ctx;
  }

  /**
   * This is a slight logarithmic velocity curve
   * @param {*} velocity
   */
  calculateVelocity(velocity) {
    return velocity / 127 * 7.9 + 1;
    // a simple liner velocity curve would be : 1.0 * velocity / 127
  }

  /**
   * Basic two oscillator example
   */
  generate() {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const volume = this.ctx.createGain();

    osc1.connect(volume);
    osc2.connect(volume);
    volume.connect(this.ctx.destination);
    volume.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // closure, or make something that returns instances of another class?
    return {
      noteOn: function(note, velocity) {
        const noteFreq = this.midiNoteToFrequency(note);
        osc1.frequency.cancelScheduledValues(0);
        osc2.frequency.cancelScheduledValues(0);
        osc1.frequency.setTargetAtTime(noteFreq, 0, this.portamento);
        osc2.frequency.setTargetAtTime(noteFreq * 2, 0, this.portamento);
        volume.gain.cancelScheduledValues(0);
        volume.gain.setTargetAtTime(
          this.calculateVelocity(velocity),
          0,
          this.envelope.attack
        );
      },
      noteOff: function() {
        volume.gain.setTargetAtTime(0.0, 0, this.envelope.release);
      },
      steal: function(note, velocity) {
        // TODO : just wait until zero crossing would be better
        volume.gain.setTargetAtTime(0.0, 0, this.envelope.release);
        if (velocity) {
          this.noteOn(note, velocity);
        }
      },
      polyPress(velocity) {
        volume.gain.setTargetAtTime(this.calculateVelocity(velocity), 0, 0.0);
      }
    };
  }
}

export { ExampleSynthVoice };
