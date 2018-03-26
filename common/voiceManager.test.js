import VoiceManager from "./voiceManager";

describe("voice manager", () => {
  let vm, voices_mock, ctx_mock;

  beforeAll(() => {
    ctx_mock = {
      currentTime: 1000
    };
    voices_mock = [
      {
        oscillator: () => {},
        volume: () => {},
        steal: () => {},
        noteOff: () => {},
        noteOn: (note, velocity) => {}
      },
      {
        oscillator: () => {},
        volume: () => {},
        steal: () => {},
        noteOff: () => {},
        noteOn: (note, velocity) => {}
      }
    ];
  });

  beforeEach(() => {
    vm = new VoiceManager({ voices: voices_mock, ctx: ctx_mock });
  });

  // describe("assign voices", () => {
  //   it("no voices sounding new voice assigned to lowest available", () => {
  //     const stackAfter = [{ note: 10, time: 1000 }, undefined];
  //     vm.voice_index_free = 0;
  //     vm.note_AddOrUpdate(10, 100);
  //     expect(vm.voice_stack).toEqual(stackAfter);
  //   });

  //   it("one voice free, new voice assigned to free slot", () => {
  //     const stackBefore = [null, { note: 9, time: 900 }];
  //     const stackAfter = [{ note: 10, time: 1000 }, { note: 9, time: 900 }];
  //     vm.voice_stack = stackBefore;
  //     vm.voice_index_free = 0;
  //     vm.note_AddOrUpdate(10, 100);
  //     expect(vm.voice_stack).toEqual(stackAfter);
  //     expect(vm.voice_index_free).toEqual(1);
  //     expect(vm.voice_memo).toEqual({ "10": 0 });
  //   });
  // });

  describe("getNextFree", () => {
    it("first index returned from empty stack", () => {
      vm.voice_stack = [null, null];
      const freeIndex = vm.getNextFree();
      expect(freeIndex).toEqual(0);
    });
    it("first free index returned from half-full stack", () => {
      vm.voice_stack = [
        { note: 12, time: 800 },
        { note: 5, time: 600 },
        null,
        { note: 1, time: 700 }
      ];
      const freeIndex = vm.getNextFree();
      expect(freeIndex).toEqual(2);
    });
    it("oldest playing note index returned in full stack", () => {
      vm.voice_stack = [
        { note: 12, time: 800 },
        { note: 5, time: 600 },
        { note: 3, time: 750 },
        { note: 1, time: 700 }
      ];
      const freeIndex = vm.getNextFree();
      expect(freeIndex).toEqual(1);
    });
  });
});
