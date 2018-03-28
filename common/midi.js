// MIDI interface - start here!

function MIDI(options) {
  const { channels, delay_init } = options || {};
  if (!channels || channels.length === 0) {
    throw new Error("you need to provide some synths!");
  }
  this.channels = channels;
  this.channel_handlers = [];
  this.default_channel_handler = {
    noteOn: () => {},
    noteOff: () => {},
    polyPress: () => {},
    controlChange: () => {},
    programChange: () => {},
    pitchBend: () => {},
    monitor: () => {}
  };
  if (delay_init !== true) {
    this.init();
  }
}

MIDI.prototype = {
  init: function() {
    for (const [channel, synth] of Object.entries(this.channels)) {
      this.plugIn(channel, synth);
    }
  },
  plugIn: function(channel_num, synth) {
    const handlers = synth.init();
    channel_num = parseInt(channel_num);
    if (!handlers) {
      throw new Error("we need some MIDI message handlers");
    }
    const {
      noteOn,
      noteOff,
      polyPress,
      controlChange,
      programChange,
      pitchBend,
      monitor
    } = handlers;

    channel_num = channel_num || 1;
    const new_handler = this.channel_handlers.hasOwnProperty(channel_num)
      ? this.channel_handlers[channel_num]
      : this.default_channel_handler;

    if (noteOff) {
      console.log(`Adding note off handler for channel ${channel_num}`);
      new_handler.noteOff = (note, velocity) => noteOff(note, velocity);
    }
    if (noteOn) {
      console.log(`Adding note on handler for channel ${channel_num}`);
      new_handler.noteOn = (note, velocity) => noteOn(note, velocity);
    }
    if (polyPress) {
      console.log(
        `Adding polyphonic pressure handler for channel ${channel_num}`
      );
      new_handler.polyPress = (note, pressure) => polyPress(note, pressure);
    }
    if (controlChange) {
      console.log(`Adding control change handler for channel ${channel_num}`);
      new_handler.controlChange = (control, value) =>
        controlChange(control, value);
    }
    if (programChange) {
      console.log(`Adding program change handler for channel ${channel_num}`);
      new_handler.programChange = newProgram => programChange(newProgram);
    }
    if (pitchBend) {
      console.log(`Adding pitch bend handler for channel ${channel_num}`);
      // http://sites.uci.edu/camp2014/2014/04/30/managing-midi-pitchbend-messages/
      new_handler.pitchBend = (LSB, MSB) => pitchBend(LSB, MSB);
    }
    if (monitor) {
      console.log(`Adding MIDI channel monitor for channel ${channel_num}`);
      new_handler.monitor = monitor; // best approach?
      // new_handler.monitor = message_details => monitor(message_details);
    }
    this.channel_handlers[channel_num] = new_handler;
  }
};

export { MIDI };
