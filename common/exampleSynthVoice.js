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
      release: 0.5
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
    return 5.0 * velocity / 127;
    // return Math.log10(velocity / 127 * 7.9 + 1);
    // a simple liner velocity curve would be : 1.0 * velocity / 127
  }

  /**
   * Well-tempered tuning. We could use Werkmeister or any other experimental tuning
   * for details on how to derive this formula see
   *  http://www.webpusher.ie/2018/04/08/synth-basics/
   */
  midiNoteToFrequency(note) {
    // NOTE - if speed is an issue we could calculate the frequency
    // for each MIDI note, turn it into JSON
    // and load it into an associative array at start up
    return Math.pow(2, (note - 69) / 12) * 440;
  }

  /**
   * Basic two oscillator example
   */
  generate() {
    const osc1 = this.ctx.createOscillator();
    osc1.type = "triangle";
    const osc2 = this.ctx.createOscillator();
    const volume = this.ctx.createGain();

    // use another osc for some FM
    const modOsc1 = this.ctx.createOscillator();
    modOsc1.type = "sawtooth";
    const modVolume = this.ctx.createGain();

    osc1.connect(volume);
    osc2.connect(volume);

    modOsc1.connect(modVolume);
    modVolume.connect(osc1.frequency);
    // modOsc1.frequency.setValueAtTime(, this.ctx.currentTime);
    // modVolume.gain.setValueAtTime(100, this.ctx.currentTime);

    volume.connect(this.ctx.destination);
    volume.gain.setValueAtTime(0.0, this.ctx.currentTime);
    osc1.start();
    modOsc1.start();
    osc2.start();

    const noteOn = (note, velocity) => {
      const noteFreq = this.midiNoteToFrequency(note);
      osc1.frequency.cancelScheduledValues(0);
      osc2.frequency.cancelScheduledValues(0);
      osc1.frequency.setTargetAtTime(noteFreq, 0, this.portamento);
      osc2.frequency.setTargetAtTime(noteFreq * 2, 0, this.portamento);
      volume.gain.cancelScheduledValues(0);
      const noteVolume = this.calculateVelocity(velocity);
      console.log("note volume", noteVolume);
      // TODO : create a proper ADSR curve using setValueCurveAtTime?
      volume.gain.setTargetAtTime(
        this.calculateVelocity(noteVolume),
        0,
        this.envelope.attack
      );

      modOsc1.frequency.setValueAtTime(noteFreq * 1.5, this.ctx.currentTime);
      modVolume.gain.setValueAtTime(100, this.ctx.currentTime);
    };

    const noteOff = () => {
      volume.gain.setTargetAtTime(0.0, 0, this.envelope.release);
    };

    const steal = (note, velocity) => {
      // TODO : just wait until zero crossing would be better
      volume.gain.setTargetAtTime(0.0, 0, this.envelope.release);
      if (velocity) {
        noteOn(note, velocity);
      }
    };

    const polyPress = velocity => {
      volume.gain.setTargetAtTime(this.calculateVelocity(velocity), 0, 0);
    };

    // closure, or make something that returns instances of another class?
    return {
      noteOn,
      noteOff,
      steal,
      polyPress
    };
  }
}

export { ExampleSynthVoice };
