/**
 * Basic synth
 */
function BasicSynth(options) {
  let { max_voices, midi, channel_num, monitor, ctx, voiceManager } =
    options || {};
  if (!ctx || !voiceManager || !midi) {
    throw new Error(
      "You must supply the following params : ctx, voiceManager, midi"
    );
  }
  this.ctx = ctx;
  this.voiceManager = voiceManager;
  this.channel_num = channel_num || 1;
  this.max_voices = max_voices || 4;
  this.voices = [];

  // eventually will pass in these values, and even control them
  this.type = "sine";
  this.envelope = {
    attack: 0.05,
    release: 0.05
    // sustain: 1,
    // decay: 0.05,
  };

  this.midi = midi;

  this.init();
}

BasicSynth.prototype = {
  init: function() {
    // wire up the midi
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

    this.audioContext =
      this.ctx || new (window.AudioContext || window.webkitAudioContext)();
    this.voices = [...this.generateVoices(this.audioContext)];
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
  },
  /**
   * We'll only be passing note on here
   */
  assignOrUpdateVoice: function(note, velocity) {
    let voice_index = this.voices.findIndex(voice => voice.note === note);
    console.log("- - - - - next voice index", voice_index);
    if (voice_index === -1) {
      // we'll need a voice for the new note
      // are there any free voices
      // if yes, assign
      // if no, find oldest note, kill it and assign (use setValueAtTime)
    } else {
      // update the velocity or whatever
    }
    // if (voice_index > -1) {
    //   this.voices[voice_index].volume.gain.linearRampToValueAtTime(
    //     1.0 * (velocity / 127),
    //     this.audioContext.currentTime + this.envelope.attack
    //   );
    // } else {
    //   // pull a new voice from the top of the stack
    //   // or if no voices then use the first voice
    //   voice_index = this.voice_stack.shift() || 0;
    //   console.log("voice index", voice_index, "voice stack", this.voice_stack);
    //   // now push it to the bottom
    //   this.voice_stack.push(voice_index);
    //   const voice = this.voices[voice_index];
    //   if (voice.note) {
    //     // as we may be voice stealing lets shut down the old voice
    //     this.liberateVoice({ note, voice_index });
    //     this.playNote(voice_index, note, velocity);
    //   } else {
    //     // ok, there is a free voice
    //     this.playNote(voice_index, note, velocity);
    //   }
    // }
  },
  playNote: function(voice_index, note, velocity) {
    const voice = this.voices[voice_index];
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
  },
  liberateVoice: function(options) {
    const { note, voice_index } = options;
    // if voice index passed then check if the note matches
    // if both match then free the voice
    // if current note for voice does not match then assume it has been stolen meantime
    // if only note passed then find the index and free the note
    // let voice_index = this.voices.findIndex(voice => voice.note === note);

    if (
      voice_index &&
      (voice_index >= 0 || voice_index <= this.max_voices) &&
      this.voices[voice_index].note === note
    ) {
      const voice = this.voices[voice_index];
      voice.note = null;
      voice.volume.gain.setTargetAtTime(0, this.audioContext.currentTime);
      this.voice_stack;
    }
    if (!voice_index && note) {
    }
  },

  midiNoteToFrequency: function(note) {
    // https://newt.phys.unsw.edu.au/jw/notes.html
    return Math.pow(2, (note - 69) / 12) * 440;
  },
  noteOn: function(note, velocity) {
    console.log("note on", note, velocity);
    this.assignOrUpdateVoice(note, velocity);
  },
  noteOff: function(note, velocity) {
    console.log("note off", note, velocity);
    // check if note is already playing
    //    if so stop it and free the voice
    //    if not then ignore!
    this.liberateVoice({ note });

    // var position = this.note_stack.indexOf(note);
    // if (position != -1) {
    //   this.note_stack.splice(position, 1);
    // }
    // if (this.note_stack.length == 0) {
    //   // shut off the envelope
    //   this.envelope.gain.cancelScheduledValues(0);
    //   this.envelope.gain.setTargetAtTime(0.0, 0, this.release);
    // } else {
    //   this.oscillator.frequency.cancelScheduledValues(0);
    //   this.oscillator.frequency.setTargetAtTime(
    //     this.midiNoteToFrequency(this.note_stack[this.note_stack.length - 1]),
    //     0,
    //     this.portamento
    //   );
    // }
  }
};

export default BasicSynth;
