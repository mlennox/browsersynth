import { MIDI } from "./midi";

let midi, synth_mock, handlers_mock;

describe("midi", () => {
  beforeEach(() => {
    handlers_mock = {
      noteOff: test_param => {
        return test_param;
      },
      noteOn: () => {},
      polyPress: () => {},
      controlChange: () => {},
      programChange: () => {},
      pitchBend: () => {},
      monitor: () => {}
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
  });

  describe("plugIn", () => {
    it("channel_handlers assigned", () => {
      midi.plugIn(1, synth_mock);
      expect(midi.channel_handlers[1]).not.toBeNull();
    });

    it("handlers are properly assigned", () => {
      midi.plugIn(1, synth_mock);

      const expected = "expected message";
      const result = midi.channel_handlers[1].noteOff(expected);

      expect(result).toEqual(expected);
    });
  });
});
