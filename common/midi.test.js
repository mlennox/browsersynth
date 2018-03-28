import blug, { MIDI } from "./midi";

let synth_mock, handlers_mock;

describe("midi", () => {
  beforeEach(() => {
    handlers_mock = {
      noteOn: () => {}
    };
    synth_mock = {
      init: () => {
        return handlers_mock;
      }
    };
    midi = new MIDI({
      channels: {
        "1": synth_mock
      },
      delay_init: true // smelly, just for testing at this time...
    });
    // console.log("= = = =", midi);
  });

  describe("init", () => {
    it("calls plugIn with channel and synth", () => {
      const plugInSpy = jest.spyOn(midi, "plugIn");

      midi.init();

      expect(plugInSpy).toBeCalledWith("1", synth_mock);
    });

    it("", () => {
      //
    });
  });
});
