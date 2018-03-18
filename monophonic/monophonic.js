/**
 * Simple monophonic synth
 */
function monophonic(options) {
  let { max_voices, midi, channel_num } = options;
  this.channel_num = channel_num || 1;

  this.midi = midi;
  this.midi.plugIn(
    {
      noteOn: (note, velocity) => this.noteOn(note, velocity),
      noteOff: (note, velocity) => this.noteOff(note, velocity)
    },
    this.channel_num
  );
  this.midi.requestAccess();

  this.init();

  this.portamento = 0.05;
  this.attack = 0.05;
  this.release = 0.05;
  this.note_stack = [];
}

monophonic.prototype = {
  init: function() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.frequency.setValueAtTime(110, 0);
    this.envelope = this.audioContext.createGain();
    this.oscillator.connect(this.envelope);
    this.envelope.connect(this.audioContext.destination);
    this.envelope.gain.value = 0.0;
    this.oscillator.start(0);
  },
  // https://newt.phys.unsw.edu.au/jw/notes.html
  midiNoteToFrequency: function(note) {
    return Math.pow(2, (note - 69) / 12) * 440;
  },
  noteOn: function(note, velocity) {
    console.log("note on", note, velocity);
    this.note_stack.push(note);
    this.oscillator.frequency.cancelScheduledValues(0);
    this.oscillator.frequency.setTargetAtTime(
      this.midiNoteToFrequency(note),
      0,
      this.portamento
    );
    this.envelope.gain.cancelScheduledValues(0);
    this.envelope.gain.setTargetAtTime(1.0 * velocity / 127, 0, this.attack);
  },
  noteOff: function(note, velocity) {
    console.log("note off", note, velocity);
    var position = this.note_stack.indexOf(note);
    if (position != -1) {
      this.note_stack.splice(position, 1);
    }
    if (this.note_stack.length == 0) {
      // shut off the envelope
      this.envelope.gain.cancelScheduledValues(0);
      this.envelope.gain.setTargetAtTime(0.0, 0, this.release);
    } else {
      this.oscillator.frequency.cancelScheduledValues(0);
      this.oscillator.frequency.setTargetAtTime(
        this.midiNoteToFrequency(this.note_stack[this.note_stack.length - 1]),
        0,
        this.portamento
      );
    }
  }
};

export default monophonic;
