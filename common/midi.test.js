import { MIDI } from "./midi";

let midi, synth_mock, handlers_mock, browser_api, promise_mock;

describe("midi", () => {
  beforeEach(() => {
    promise_mock = {
      then: thenHandler => {
        thenHandler();
        return {
          catch: catchHandler => catchHandler()
        };
      }
    };
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
    browser_api = {
      requestMIDIAccess: () => {
        return promise_mock;
      }
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
      browser_api,
      delay_init: true // smelly, just for testing at this time...
    });
  });

  describe("init", () => {
    it("calls plugIn with channel and synth", () => {
      const plugInSpy = jest.spyOn(midi, "plugIn");

      midi.init();

      expect(plugInSpy).toBeCalledWith("1", synth_mock);
    });
    it("calls requestAccess to connect to MIDI", () => {
      const accessSpy = jest.spyOn(midi, "requestAccess");

      midi.init();

      expect(accessSpy).toBeCalled();
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

  /**
   * Tests setting up the connection to the Web MIDI API
   */
  describe("requestAccess", () => {
    it("call requestMIDIAccess", () => {});
  });
});
