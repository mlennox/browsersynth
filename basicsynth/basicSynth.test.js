import BasicSynth from "./basicSynth";
import ctx_mock from "../common/ctx_mock";

let synth, midi, voiceManager_mock;

describe("basic synth", () => {
  beforeAll(() => {
    voiceManager_mock = {};
    midi = {
      plugIn: () => {},
      requestAccess: () => {}
    };
  });

  beforeEach(() => {
    ctx_mock.reset();
    synth = new BasicSynth({
      midi,
      ctx: ctx_mock,
      voiceManager: voiceManager_mock
    });
  });

  it("works", () => {
    expect(synth.noteOn).not.toBeNull();
  });
  describe("generate voices", () => {
    it("will generate number of voices matching max_voices property", () => {
      synth.max_voices = 2;
      var voices = [...synth.generateVoices(synth.ctx)];

      expect(voices.length).toEqual(synth.max_voices);
    });
  });

  // // voice stealing
  // describe("assignOrUpdateVoice", () => {
  //   it("if no voices sounding then first voice in stack ", () => {
  //     const stackBefore = [0, 0, 0, 0];
  //     const stackAfter = [1, 0, 0, 0];
  //     synth.voice_stack = stackBefore;

  //     synth.assignOrUpdateVoice(1, 100);

  //     expect(synth.voice_stack).toEqual(stackAfter);
  //   });
  // });
});
