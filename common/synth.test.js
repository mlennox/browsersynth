import { Synth } from "./synth";
import ctx_mock from "./ctx_mock";
import { synthVoice_mock } from "./synthVoice_mock";

describe("synth", () => {
  describe("constructor", () => {
    it("missing synthVoice", () => {
      expect(Synth).toThrow();
    });

    it("common voiceManager used if none provided", () => {
      const test_synth = new Synth({ ctx: ctx_mock, synthVoice_mock });

      expect(test_synth.voiceManager).not.toBeNull();
    });
  });

  describe("others", () => {
    let synth;

    beforeEach(() => {
      ctx_mock.reset();
      synth = new Synth({ synthVoice: synthVoice_mock, ctx: ctx_mock });
    });

    describe("init", () => {
      it("", () => {});
    });
  });
});
