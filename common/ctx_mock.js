import { param_mock } from "./param_mock";

const ctx_mock = {
  timestamp: 999,
  get currentTime() {
    this.timestamp++;
    return this.timestamp;
  },
  reset: function(timestamp) {
    this.timestamp = timestamp || 999;
  },
  destination: {},
  createOscillator: () => {
    return {
      connect: () => {},
      frequency: param_mock
    };
  },
  createGain: () => {
    return {
      connect: () => {},
      gain: param_mock
    };
  }
};

export default ctx_mock;
