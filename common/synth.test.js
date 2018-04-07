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
    let synth;

    beforeEach(() => {
      ctx_mock.reset();
      synth = new Synth({
        synthVoice: synthVoice_mock,
        ctx: ctx_mock
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
  });
});
