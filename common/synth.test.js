import { Synth } from "./synth";
import ctx_mock from "./ctx_mock";
import { synthVoice } from "./synthVoice";

describe("synth", () => {
  describe("constructor", () => {
    it("missing synthVoice", () => {
      expect(Synth).toThrow();
    });

    it("common voiceManager used if none provided", () => {
      const test_synth = new Synth({ ctx: ctx_mock, synthVoice });

      expect(test_synth.voiceManager).not.toBeNull();
    });
  });

  describe("others", () => {
    let synth, synthVoice_mock;

    beforeEach(() => {
      ctx_mock.reset();
      synthVoice_mock = {};
      synth = new Synth({ synthVoice: synthVoice_mock, ctx: ctx_mock });
    });

    describe("init", () => {
      it("", () => {});
    });
  });
});
