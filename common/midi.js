// MIDI interface - start here!

function MIDI(options) {
  const { channels, delay_init } = options || {};
  if (!channels || channels.length === 0) {
    throw new Error("you need to provide some synths!");
  }
  this.channels = channels;
  this.channel_handlers = {};
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
    // console.log(
    //   "- - - - handlers",
    //   this.channel_handlers[channel_num],
    //   channel_num
    // );
  }
};

export { MIDI };
