const ctx_mock = {
  timestamp: 999,
  get currentTime() {
    this.timestamp++;
    return this.timestamp;
  },
  reset: function(timestamp) {
    this.timestamp = timestamp || 999;
  }
};

export default ctx_mock;
