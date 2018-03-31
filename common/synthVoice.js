function SynthVoice() {
  
  return {
    // ADSR envelope - sustain is a volume level not time like the other parameters
    envelope: {
      attack: 0.01,
      decay: 0.01,
      sustain: 0.5, // we'll use this as a multiplier of peak volume - only multiplies up to max velocity!
      release: 0.1,
      portamento: 0.0 // ok, not part of envelope, here for simplicity for the moment
    },
    /**
     * Basic two oscillator example
     */
    generate_voice: (ctx, style) => {
      switch (style) {
        case "fm":
          return this.generateFM(ctx, this.envelope);
        default:
          return this.generateDual(ctx, this.envelope);
      }
    },
    generateDual: (ctx, envelope) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const volume = ctx.createGain();

      osc1.connect(volume);
      osc2.connect(volume);
      volume.connect(ctx.destination);
      volume.gain.setValueAtTime(0.0, ctx.currentTime);

      return {
        steal: (note, velocity) => {
          // ramp off
          // notOn if note/vel passed
        },
        noteOn: (note, velocity) => {
          const noteFreq = this.midiNoteToFrequency(note);
          osc1.frequency.cancelScheduledValues(0);
          osc2.frequency.cancelScheduledValues(0);
          osc1.frequency.setTargetAtTime(noteFreq, 0, envelope.portamento);
          osc2.frequency.setTargetAtTime(
            noteFreq * 2,
            0,
            envelope.portamento
          );
          volume.gain.cancelScheduledValues(0);
          this.envelope.gain.setTargetAtTime(
            1.0 * velocity / 127,
            0,
            envelope.attack
          );
        }
      };
    },
    // generateFm: ctx => {
    //   const osc1 = ctx.createOscillator();
    //   const osc2 = ctx.createOscillator();
    //   const volume = ctx.createGain();

    //   osc1.connect(osc2); // note only change is to connect to osc2
    //   osc2.connect(volume); 
    //   volume.connect(ctx.destination);
    //   volume.gain.setValueAtTime(0.0, ctx.currentTime);

    //   return {
    //     : (note, velocity) => {
    //       const noteFreq = this.midiNoteToFrequency(note);
    //       osc1.frequency.cancelScheduledValues(0);
    //       osc2.frequency.cancelScheduledValues(0);
    //       osc1.frequency.setTargetAtTime(noteFreq, 0, envelope.portamento);
    //       osc2.frequency.setTargetAtTime(
    //         noteFreq * 2,
    //         0,
    //         envelope.portamento
    //       );
    //       volume.gain.cancelScheduledValues(0);
    //       this.envelope.gain.setTargetAtTime(
    //         1.0 * velocity / 127,
    //         0,
    //         envelope.attack
    //       );
    //     }
    //   };
    // }
  };
},