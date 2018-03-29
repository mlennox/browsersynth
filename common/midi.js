// MIDI interface - start here!

function MIDI(options) {
  const { channels, delay_init, browser_api } = options || {};
  if (!channels || channels.length === 0) {
    throw new Error("you need to provide some synths!");
  }
  this.channels = channels;
  this.channel_handlers = {};
  this.browser_api = browser_api || navigator;
  this.default_channel_handler = {
    noteOn: () => {},
    noteOff: () => {},
    polyPress: () => {},
    controlChange: () => {},
    programChange: () => {},
    pitchBend: () => {},
    monitor: () => {}
  };
  this.access = {}; // the access object from MIDI API
  this.inputs = []; // the attached MIDI devices

  if (delay_init !== true) {
    this.init();
  }
}

MIDI.prototype = {
  init: function() {
    for (const [channel, synth] of Object.entries(this.channels)) {
      this.plugIn(channel, synth);
    }
    this.requestAccess();
  },
  plugIn: function(channel_num, synth) {
    const handlers = synth.init();
    if (!handlers) {
      throw new Error("we need some MIDI message handlers");
    }

    channel_num = channel_num || 1;
    let new_handlers = {};

    for (const [name, default_handler] of Object.entries(
      this.default_channel_handler
    )) {
      new_handlers[name] = handlers[name] || default_handler;
    }

    this.channel_handlers[channel_num] = new_handlers;
  },
  requestAccess: function() {
    this.browser_api
      .requestMIDIAccess()
      .then(access => this.accessSuccess(access))
      .catch(err => this.accessFailure(err));
  },
  accessSuccess: function(access) {
    console.log("MIDI API accessed");
    this.access = access;
    // Get lists of available MIDI controllers
    this.inputs = this.access.inputs.values();
    // const outputs = access.outputs.values(); // we don't use outputs yet

    for (const device of this.inputs) {
      console.log("MIDIInput : ", device);
      device.onmidimessage = message => this.midiMessageHandler(message);
    }

    // handles connection / disconnection of devices
    this.access.onstatechange = this.stateChangeHandler;
  },
  accessFailure: function(err) {
    console.log("MIDI API Access failed", err);
  },
  stateChangeHandler: function(e) {
    console.log(e.port.name, e.port.manufacturer, e.port.state);
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
      case 0xa0:
        return channel.polyPress(byte1, byte2);
      case 0xb0:
        return channel.controlChange(byte1, byte2);
      case 0xc0:
        return channel.programChange(byte1, byte2);
      case 0xe0:
        return channel.pitchBend(byte1, byte2);
      default:
        return;
    }
  }
};

export { MIDI };
