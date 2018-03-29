import { MIDI } from "./midi";

// ugh, Jest, why? globals upon globals...
let midi,
  synth_mock,
  handlers_mock,
  browser_api,
  promise_mock,
  is_erroring,
  access_mock,
  device_mock;

describe("midi", () => {
  beforeEach(() => {
    device_mock = {
      onmidimessage: () => {
        return "on midi message handler";
      }
    };
    access_mock = {
      onstatechange: () => {
        return "on state change handler";
      },
      inputs: {
        values: () => {
          return [device_mock];
        }
      }
    };
    is_erroring = false;
    promise_mock = (thenValue, errorValue) => {
      return {
        then: thenHandler => {
          if (!is_erroring) {
            thenHandler(thenValue);
          }
          return {
            catch: catchHandler => catchHandler(errorValue)
          };
        }
      };
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
        return promise_mock(access_mock, "");
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
    it("on success will call accessSuccess", () => {
      const successSpy = jest.spyOn(midi, "accessSuccess");

      midi.requestAccess();

      expect(successSpy).toHaveBeenCalled();
    });

    it("on failure will call accessFailure", () => {
      const failureSpy = jest.spyOn(midi, "accessFailure");

      is_erroring = true;
      midi.requestAccess();

      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe("accessSuccess", () => {
    it("each device onmidimessage handler is wired up", () => {
      midi.accessSuccess(access_mock);

      const result = midi.access.inputs
        .values()[0]
        .onmidimessage({ data: [1, 2, 3] });

      expect(result).not.toEqual("on midi message handler");
    });

    it("access onstatechange handler is wired up", () => {
      midi.accessSuccess(access_mock);

      const result = midi.access.onstatechange({
        port: {
          name: "some name",
          manufacturer: "some manufacturer",
          state: "some state"
        }
      });

      expect(result).not.toEqual("on state change handler");
    });
  });

  describe("midiMessageHandler", () => {
    beforeEach(() => {
      midi.channel_handlers[1] = handlers_mock;
    });

    it("noteOff message will call proper handler", () => {
      const handlerSpy = jest.spyOn(handlers_mock, "noteOff");
      const message = {
        data: [0x80, 100, 0]
      };

      midi.midiMessageHandler(message);

      expect(handlerSpy).toBeCalled();
    });

    it("noteOn message will call proper handler", () => {
      const handlerSpy = jest.spyOn(handlers_mock, "noteOn");
      const message = {
        data: [0x90, 100, 100]
      };

      midi.midiMessageHandler(message);

      expect(handlerSpy).toBeCalled();
    });

    it("noteOn message with velocity zero will call noteOff handler", () => {
      const handlerSpy = jest.spyOn(handlers_mock, "noteOff");
      const message = {
        data: [0x90, 100, 0]
      };

      midi.midiMessageHandler(message);

      expect(handlerSpy).toBeCalled();
    });
  });
});
