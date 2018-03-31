import { Synth } from "./synth";

describe("synth", () => {
  describe("constructor", () => {
    it("missing synthVoice", () => {
      expect(Synth).toThrow();
    });
  });
  describe("init", () => {
    it("works", () => {});
  });
});
