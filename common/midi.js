/**
 * MIDI interface
 */

function MIDI() {
  this.channel_handlers = {};
}

MIDI.prototype = {
  requestAccess: function() {
    console.log("requesting access to MIDI API");
    navigator
      .requestMIDIAccess()
      .then(access => this.accessSuccess(access))
      .catch(err => this.accessFailure(err));
  },
  accessSuccess: function(access) {
    console.log("MIDI API accessed");
    // Get lists of available MIDI controllers
    const inputs = access.inputs.values();
    // const outputs = access.outputs.values(); // we don't use outputs yet

    for (const device of inputs) {
      console.log("MIDIInput : ", device);
      device.onmidimessage = message => this.midiMessageHandler(message);
    }

    // handles connection / disconnection of devices
    access.onstatechange = this.stateChangeHandler;
  },
  accessFailure: function(err) {
    console.log("MIDI API Access failed", err);
  },
  /**
   * Note : currently this MIDI message handler will receive all messages from all devices
   * and not discriminate between source, but will manage MIDI channel
   * so it could be possible to have messages arriving from different devices on the same MIDI channel
   */
  midiMessageHandler: function(message) {
    console.log("MIDI message received", message.data);
    const [cmd, byte1, byte2] = message.data;
    // find what command we want using the MSB of the command value
    const cmd_band = cmd & 0xf0;
    // find the MIDI channel the command is targeting from the LSB
    const channel_num = (cmd & 0x0f) + 1;
    if (!this.channel_handlers.hasOwnProperty(channel_num)) {
      console.warn(`No device mapped for MIDI channel '${channel_num}'`);
      return;
    }
    const channel = this.channel_handlers[channel_num];
    channel.monitor({ cmd, cmd_band, channel_num, byte1, byte2 });
    switch (cmd_band) {
      case 0x80:
        return channel.noteOff(byte1, byte2);
      case 0x90:
        // if a note on command has a velocity of zero then we treat it like a note off
        return byte2 > 0
          ? channel.noteOn(byte1, byte2)
          : channel.noteOff(byte1, byte2);
      default:
        return;
    }
  },
  stateChangeHandler: function(e) {
    console.log(e.port.name, e.port.manufacturer, e.port.state);
  },
  plugIn: function(handlers, channel_num) {
    const {
      noteOn,
      noteOff,
      polyPress,
      controlChange,
      programChange,
      pitchBend,
      monitor
    } = handlers;
    // if no channel provided we'll just hook up to MIDI channel 1
    channel_num = channel_num || 1;
    const new_handler = this.channel_handlers.hasOwnProperty(channel_num)
      ? this.channel_handlers[channel_num]
      : {
          noteOn: () => {},
          noteOff: () => {},
          polyPress: () => {},
          controlChange: () => {},
          programChange: () => {},
          pitchBend: () => {},
          monitor: () => {}
        };
    if (noteOff) {
      console.log("Adding note off handler");
      new_handler.noteOff = (note, velocity) => noteOff(note, velocity);
    }
    if (noteOn) {
      console.log("Adding note on handler");
      new_handler.noteOn = (note, velocity) => noteOn(note, velocity);
    }
    if (polyPress) {
      console.log("Adding polyphonic pressure handler");
      new_handler.polyPress = (note, pressure) => polyPress(note, pressure);
    }
    if (controlChange) {
      console.log("Adding control change handler");
      new_handler.controlChange = (control, value) =>
        controlChange(control, value);
    }
    if (programChange) {
      console.log("Adding program change handler");
      new_handler.programChange = newProgram => programChange(newProgram);
    }
    if (pitchBend) {
      console.log("Adding pitch bend handler");
      // http://sites.uci.edu/camp2014/2014/04/30/managing-midi-pitchbend-messages/
      new_handler.pitchBend = (LSB, MSB) => pitchBend(LSB, MSB);
    }
    if (monitor) {
      console.log("Adding MIDI channel monitor");
      new_handler.monitor = monitor;
      // new_handler.monitor = message_details => monitor(message_details);
    }
    this.channel_handlers[channel_num] = new_handler;
  }
};

export default MIDI;
