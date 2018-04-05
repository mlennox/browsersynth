import { Synth } from "./synth";
import ctx_mock from "./ctx_mock";

describe("synth", () => {
  describe("constructor", () => {
    it("missing synthVoice", () => {
      expect(Synth).toThrow();
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
