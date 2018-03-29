/**
 * Tracks events for a specific note or control change
 * options:
 *  channel_num - MIDI channel number
 */
function Monitor(options) {
  const { display_container_id } = options || {};
  this.display_container_id = display_container_id || "monitor";

  this.init();
  /*
  this.history = {};
  Eventually...
  {
    "103": {
      type: "note" // note | control | program | pitch
      history: {
        noteOn: {
          velocity: 100,
          time: 10397749
        },
        noteOff: {
          time: 10398000
        }
      }
    }
  }
  */
}

Monitor.prototype = {
  init: function() {
    this.display_container = document.getElementById(this.display_container_id);
    return {
      monitor: message => this.handleMessage(message)
    };
  },
  handleMessage: function(message_details) {
    const { cmd, cmd_band, channel_num, byte1, byte2 } = message_details;
    const { cmd_name, byte1_label, byte2_label } = this.labelsForCommand(
      cmd_band
    );
    this.display_container.innerHTML = `
      <h1>${cmd_name}</h1>
      <p>${byte1_label}: ${byte1}</p>
      ${byte2_label ? `<p>${byte2_label}: ${byte2}</p>` : ""}
    `;
  },
  labelsForCommand: function(cmd_band) {
    switch (cmd_band) {
      case 0x80:
        return {
          cmd_name: "note off",
          byte1_label: "note",
          byte2_label: "velocity"
        };
      case 0x90:
        return {
          cmd_name: "note on",
          byte1_label: "note",
          byte2_label: "velocity"
        };
      case 0xa0:
        return {
          cmd_name: "poly key pressure",
          byte1_label: "note",
          byte2_label: "pressure"
        };
      case 0xb0:
        return {
          cmd_name: "control change",
          byte1_label: "control",
          byte2_label: "value"
        };
      case 0xc0:
        return {
          cmd_name: "program change",
          byte1_label: "program value",
          byte2_label: null
        };
      case 0xd0:
        return {
          cmd_name: "pitch bend",
          byte1_label: "least significant bit",
          byte2_label: "most significant bit"
        };
      default:
        return { cmd_name: "unknown" };
    }
  }
};

export { Monitor };
