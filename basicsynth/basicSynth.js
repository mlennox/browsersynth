/**
 * Basic synth
 */
function BasicSynth(options) {
  let { max_voices, midi, channel_num, monitor } = options;
  this.channel_num = channel_num || 1;
  this.max_voices = max_voices || 4;
  this.voices = [];
  /**
   * voice_stack tracks the index of voices in use
   * when a voice hits noteOff then it is added to top of stack
   * to assign a new voice take from top of stack (always oldest or free) and move to bottom of stack
   */
  this.voice_stack = [];

  // eventually will pass in these values, and even control them
  this.type = "sine";
  this.envelope = {
    attack: 0.05,
    release: 0.05
    // sustain: 1,
    // decay: 0.05,
  };

  this.midi = midi;
  this.midi.plugIn(
    {
      // NOTE : using arrow functions here will preserve the context
      noteOn: (note, velocity) => this.noteOn(note, velocity),
      noteOff: (note, velocity) => this.noteOff(note, velocity),
      monitor: message_details => monitor.handleMessage(message_details)
    },
    this.channel_num
  );
  this.midi.requestAccess();

  this.init();
}

BasicSynth.prototype = {
  generateVoices: function*(ctx) {
    let voice_count = 0;
    while (voice_count < this.max_voices) {
      voice_count++;
      const voice = {
        oscillator: ctx.createOscillator(),
        volume: ctx.createGain()
      };
      voice.oscillator.connect(voice.volume);
      voice.volume.connect(ctx.destination);
      voice.volume.gain.setValueAtTime(0.0, ctx.currentTime);
      yield voice;
    }
  },
  /**
   * We'll only be passing note on here
   */
  assignOrUpdateVoice: function(note, velocity) {
    let voice_index = this.voices.findIndex(voice => voice.note === note);
    if (voice_index) {
      this.voices[voice_index].volume.gain.linearRampToValueAtTime(
        1.0 * (velocity / 127),
        this.audioContext.currentTime + this.envelope.attack
      );
    } else {
      // pull a new voice from the top of the stack
      voice_index = this.voice_stack.shift();
      // now push it to the bottom
      this.voice_stack.push(voice_index);
      const voice = this.voices[voice_index];
      if (voice.note) {
        // as we may be voice stealing lets shut down the old voice
      } else {
        voice.note = note;
        voice.oscillator.frequency.setTargetAtTime(
          this.midiNoteToFrequency(note),
          0,
          0
        );
        voice.volume.gain.linearRampToValueAtTime(
          1.0 * (velocity / 127),
          this.audioContext.currentTime + this.envelope.attack
        );
      }
    }
  },
  init: function() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.voices = [...generateVoices(this.audioContext)];
  },
  midiNoteToFrequency: function(note) {
    // https://newt.phys.unsw.edu.au/jw/notes.html
    return Math.pow(2, (note - 69) / 12) * 440;
  },
  noteOn: function(note, velocity) {
    console.log("note on", note, velocity);
    // check if note is already playing
    //    if so change velocity
    //    if not assign a voice and start note
    //        if no free voices then steal oldest voice

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
    // check if note is already playing
    //    if so stop it and free the voice
    //    if not then ignore!

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

export default BasicSynth;
