function VoiceManager(options) {
  const { num_voices, ctx } = options || {};
  if (!num_voices || !ctx) {
    throw new Error(
      "you must supply number of voices to be managed and the audio context"
    );
  }
  this.num_voices = num_voices;
  this.ctx = ctx;

  /**
   * voice_stack tracks the index of voices in use
   * when a voice hits noteOff then it is added to top of stack
   * to assign a new voice take from top of stack (always oldest or free) and move to bottom of stack
   */
  this.voice_stack = new Array(this.num_voices);
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

VoiceManager.prototype = {
  voiceCheck: function(note, velocity) {
    let voice_details = {
      voice_index: this.voice_memo[note],
      steal: false,
      update: false
    };
    if (
      voice_details.voice_index !== undefined &&
      voice_details.voice_index !== null
    ) {
      // already playing, we'll tell the synth to update the velocity
      voice_details.update = true;
    } else {
      // requested note not already playing - take the next free voice
      voice_details.voice_index = this.voice_index_free;
      // if the voice is already playing then we'll tell the synth to 'steal'
      voice_details.steal =
        this.voice_stack[voice_details.voice_index] !== null;
      this.updateVoiceTracking(voice_details.voice_index, note);
    }
    return voice_details;
  },
  voiceFree: function(note) {
    let voice_index = this.voice_memo[note];
    if (voice_index !== undefined && voice_index !== null) {
      this.voice_stack[voice_index] = null;
      this.voice_memo[note] = null;
    }
  },
  updateVoiceTracking: function(voice_index, note) {
    // update tracking details
    const now = this.ctx.currentTime;
    this.voice_stack[voice_index] = { note, time: now };
    this.voice_memo[note] = voice_index;
    this.voice_index_free = this.getNextFree(now);
  },
  /**
   * Return the first free index or the oldest playing note
   */
  getNextFree: function(now) {
    let max = now || this.ctx.currentTime;
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
  }
};

export { VoiceManager };
