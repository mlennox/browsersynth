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
  accessFailure: function() {},
  stateChangeHandler: function() {},
  midiMessageHandler: function() {}
};

export { MIDI };
