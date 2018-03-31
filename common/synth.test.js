import { Synth } from "./synth";

describe("synth", () => {
  describe("constructor", () => {
    it("missing synthVoice", () => {
      expect(Synth).toThrow();
    });
  });

  describe("others", () => {
    let synth, synthVoice_mock, ctx_mock;

    beforeEach(() => {
      synthVoice_mock = {};
      ctx_mock = {
        timestamp: 999,
        get currentTime() {
          this.timestamp++;
          return this.timestamp;
        }
      };
      synth = new Synth({ synthVoice: synthVoice_mock, ctx: ctx_mock });
    });
    it("works", () => {});
  });
});
