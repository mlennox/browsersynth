function SynthVoice_mock() {}

SynthVoice_mock.prototype = {
  init: () => {},
  calculateVelocity: () => {},
  midiNoteToFrequency: () => {},
  generate: () => {
    return {
      noteOn: () => {},
      noteOff: () => {},
      steal: () => {},
      polyPress: () => {}
    };
  }
};

const synthVoice_mock = new SynthVoice_mock();

export { synthVoice_mock };
