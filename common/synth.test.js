import { Synth } from "./synth";
import ctx_mock from "./ctx_mock";
import { synthVoice_mock } from "./synthVoice_mock";

describe("synth", () => {
  describe("constructor", () => {
    it("missing synthVoice", () => {
      expect(Synth).toThrow();
    });

    describe("with synthVoice", () => {
      it("default values set correctly", () => {
        const test_synth = new Synth({
          ctx: ctx_mock,
          synthVoice: synthVoice_mock
        });

        // voiceManager used if none provided
        expect(test_synth.voiceManager).not.toBeNull();
        // four voices chosen as default
        expect(test_synth.num_voices).toEqual(4);
        // audioContext not null
        expect(test_synth.ctx).not.toBeNull();
        expect(test_synth.voices).toEqual([]);
      });

      it("synthVoice init is called", () => {
        spyOn(synthVoice_mock, "init").and.callThrough();

        new Synth({
          ctx: ctx_mock,
          synthVoice: synthVoice_mock
        });

        expect(synthVoice_mock.init).toHaveBeenCalled();
      });
    });
  });

  describe("others", () => {
    let synth, voiceManager_mock;

    beforeEach(() => {
      voiceManager_mock = {
        voiceCheck: () => {
          return {
            steal: false,
            update: false,
            voice_index: 0
          };
        },
        voiceFree: () => {},
        updateVoiceTracking: () => {},
        getNextFree: () => {}
      };
      ctx_mock.reset();
      synth = new Synth({
        synthVoice: synthVoice_mock,
        ctx: ctx_mock,
        voiceManager: voiceManager_mock
      });
    });

    describe("init", () => {
      it("generateVoices called", () => {
        spyOn(synth, "generateVoices").and.callThrough();

        synth.init();

        expect(synth.generateVoices).toHaveBeenCalled();
      });

      it("returns handlers", () => {
        const result = synth.init();

        expect(result.hasOwnProperty("noteOn")).toBeTruthy();
        expect(result.hasOwnProperty("noteOff")).toBeTruthy();
      });
    });

    describe("noteOff", () => {});

    describe("noteOn", () => {
      beforeEach(() => {
        synth.init();
      });

      it("voiceManager voiceCheck called", () => {
        const played_note = 100;
        const played_velocity = 108;

        spyOn(voiceManager_mock, "voiceCheck").and.callThrough();

        synth.noteOn(played_note, played_velocity);

        expect(voiceManager_mock.voiceCheck).toHaveBeenCalledWith(played_note);
      });

      describe("action : normal", () => {
        // this.voices[action.voice_index].noteOn(note, velocity);
        it("voice chosen by voice manager should play note", () => {
          const played_note = 100;
          const played_velocity = 108;

          spyOn(synth.voices[0], "noteOn").and.callThrough();

          synth.noteOn(played_note, played_velocity);

          expect(synth.voices[0].noteOn).toHaveBeenCalledWith(
            played_note,
            played_velocity
          );
        });
      });

      describe("action : steal", () => {
        it("voice chosen by voice manager is stolen by new note", () => {
          const played_note = 100;
          const played_velocity = 108;

          spyOn(voiceManager_mock, "voiceCheck").and.returnValue({
            steal: true,
            update: false,
            voice_index: 0
          });
          spyOn(synth.voices[0], "steal").and.callThrough();

          synth.noteOn(played_note, played_velocity);

          expect(synth.voices[0].steal).toHaveBeenCalledWith(
            played_note,
            played_velocity
          );
        });
      });

      describe("action : update", () => {
        it("voice chosen by voice manager is updated", () => {
          const played_note = 100;
          const played_velocity = 108;

          spyOn(voiceManager_mock, "voiceCheck").and.returnValue({
            steal: false,
            update: true,
            voice_index: 0
          });
          spyOn(synth.voices[0], "polyPress").and.callThrough();

          synth.noteOn(played_note, played_velocity);

          expect(synth.voices[0].polyPress).toHaveBeenCalledWith(
            played_note,
            played_velocity
          );
        });
      });
    });
  });
});
