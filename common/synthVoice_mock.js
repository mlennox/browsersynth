function synthVoice_mock() {}

synthVoice_mock.prototype = {
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

export { synthVoice_mock };
