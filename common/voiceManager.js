function voiceManager(options) {
  const { voices, ctx } = options || {};
  if (!voices || (voices && voices.length === 0) || !ctx) {
    throw new Error("you must supply voices and ctx AudioContext");
  }
  this.ctx = ctx;
  this.voices = voices;
  this.max_voices = this.voices.length;
  /**
   * voice_stack tracks the index of voices in use
   * when a voice hits noteOff then it is added to top of stack
   * to assign a new voice take from top of stack (always oldest or free) and move to bottom of stack
   */
  this.voice_stack = new Array(this.max_voices);
  /**
   * quick ref to next free voice
   * We always set this to the next empty slot
   * or the slot holding the oldest voice
   * when assigning a voice we always give a
   * super-quick gain ramp down on the voice to avoid clicking
   */
  this.voice_index_free = 0;
  // a hash lookup for sounding notes to voices
  this.voice_memo = {};
}

voiceManager.prototype = {
  note_AddOrUpdate: function(note, velocity) {
    let voice_index = this.voice_memo[note];
    if (voice_index) {
      // we update it
    } else {
      // find next available
      // add note and index to voice_memo
      // ramp down voice
      // set new voice
      const now = this.ctx.currentTime;
      voice_index = this.voice_index_free;
      this.voice_stack[voice_index] = { note, time: now };
      this.voice_memo[note] = voice_index;
      // start the note here
      // find the next free or oldest
      this.voice_index_free = this.getNextFree();
    }
  },
  /**
   * Return the first free index or the oldest playing note
   */
  getNextFree: function() {
    let max = this.ctx.currentTime;
    let freeIndex = -1;
    for (let index = 0; index < this.voice_stack.length; index++) {
      const voice = this.voice_stack[index];
      if (!voice) {
        freeIndex = index;
        break;
      }
      if (voice && voice.time && voice.time < max) {
        max = voice.time;
        freeIndex = index;
      }
    }
    return freeIndex;
  },
  note_Liberate: function() {}
};

export default voiceManager;
