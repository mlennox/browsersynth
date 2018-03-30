import { VoiceManager } from "./voiceManager";

describe("voice manager", () => {
  let vm, ctx_mock;

  beforeEach(() => {
    ctx_mock = {
      timestamp: 999,
      get currentTime() {
        this.timestamp++;
        return this.timestamp;
      }
    };
    vm = new VoiceManager({ num_voices: 4, ctx: ctx_mock });
  });

  describe("voiceCheck", () => {
    beforeEach(() => {
      vm.voice_index_free = vm.getNextFree(1000);
    });
    describe("returned voice details", () => {
      it("voice not already playing same note, free voices", () => {
        const stackBefore = [{ note: 9, time: 900 }, null, undefined, null];
        vm.voice_stack = stackBefore;
        vm.voice_index_free = 1;

        const expected = {
          voice_index: 1,
          steal: false,
          update: false
        };

        const voice_details = vm.voiceCheck(10, 100);

        expect(voice_details).toEqual(expected);
      });

      it("voice not already playing same note, no free voices", () => {
        const stackBefore = [
          { note: 18, time: 820 },
          { note: 9, time: 900 },
          { note: 12, time: 910 },
          { note: 34, time: 800 }
        ];
        vm.voice_stack = stackBefore;
        vm.voice_index_free = 3;

        const expected = {
          voice_index: 3,
          steal: true,
          update: false
        };

        const voice_details = vm.voiceCheck(10, 100);

        expect(voice_details).toEqual(expected);
      });

      it("voice already playing same note, free voices", () => {
        const stackBefore = [{ note: 18, time: 820 }, null, null, null];
        const voice_memo = {
          "18": 0
        };
        vm.voice_stack = stackBefore;
        vm.voice_memo = voice_memo;
        vm.voice_index_free = 1;

        const expected = {
          voice_index: 0,
          steal: false,
          update: true
        };

        const voice_details = vm.voiceCheck(18, 100);
        expect(voice_details).toEqual(expected);
      });

      it("voice already playing same note, no free voices", () => {
        const stackBefore = [
          { note: 18, time: 820 },
          { note: 9, time: 900 },
          { note: 12, time: 910 },
          { note: 34, time: 800 }
        ];
        const voice_memo = {
          "18": 0,
          "9": 1,
          "12": 2,
          "34": 3
        };
        vm.voice_stack = stackBefore;
        vm.voice_memo = voice_memo;
        vm.voice_index_free = 3;

        const expected = {
          voice_index: 2,
          steal: false,
          update: true
        };

        const voice_details = vm.voiceCheck(12, 100);
        expect(voice_details).toEqual(expected);
      });
    });
    describe("properties", () => {
      it("no voices sounding new voice assigned to lowest available", () => {
        const stackBefore = [null, null, null, null];
        const stackAfter = [{ note: 10, time: 1000 }, null, null, null];
        const expected_free_index = 1;
        vm.voice_stack = stackBefore;
        vm.voice_index_free = 0;

        vm.voiceCheck(10, 100);

        expect(vm.voice_stack).toEqual(stackAfter);
        expect(vm.voice_index_free).toEqual(expected_free_index);
        expect(vm.voice_memo).toEqual({ "10": 0 });
      });

      it("one voice free, new voice assigned to free slot", () => {
        const stackBefore = [
          null,
          { note: 9, time: 900 },
          { note: 12, time: 910 },
          { note: 34, time: 800 }
        ];
        const stackAfter = [
          { note: 10, time: 1000 },
          { note: 9, time: 900 },
          { note: 12, time: 910 },
          { note: 34, time: 800 }
        ];
        const expected_free_index = 3;
        vm.voice_stack = stackBefore;
        vm.voice_index_free = 0;

        vm.voiceCheck(10, 100);

        expect(vm.voice_stack).toEqual(stackAfter);
        expect(vm.voice_index_free).toEqual(expected_free_index);
        expect(vm.voice_memo).toEqual({ "10": 0 });
      });

      it("all voices sounding, new voice assigned to oldest", () => {
        const stackBefore = [
          { note: 12, time: 800 },
          { note: 20, time: 910 },
          { note: 19, time: 900 },
          { note: 15, time: 760 }
        ];
        const stackAfter = [
          { note: 12, time: 800 },
          { note: 20, time: 910 },
          { note: 19, time: 900 },
          { note: 10, time: 1000 }
        ];
        const expected_free_index = 0;
        vm.voice_stack = stackBefore;
        vm.voice_index_free = vm.getNextFree(1000);

        vm.voiceCheck(10, 100);

        expect(vm.voice_stack).toEqual(stackAfter);
        expect(vm.voice_index_free).toEqual(expected_free_index);
        expect(vm.voice_memo).toEqual({ "10": 3 });
      });

      it("all voices sounding, a few new voices added in correct places", () => {
        const stackBefore = [
          { note: 12, time: 800 },
          { note: 20, time: 910 },
          { note: 19, time: 900 },
          { note: 15, time: 760 }
        ];
        const stackAfter = [
          { note: 12, time: 1001 },
          { note: 30, time: 1003 },
          { note: 15, time: 1002 },
          { note: 10, time: 1000 }
        ];
        const expected_free_index = 3;
        vm.voice_stack = stackBefore;
        vm.voice_index_free = vm.getNextFree(1000);

        vm.voiceCheck(10, 100);
        vm.voiceCheck(12, 100);
        vm.voiceCheck(15, 100);
        vm.voiceCheck(30, 100);

        expect(vm.voice_stack).toEqual(stackAfter);
        expect(vm.voice_index_free).toEqual(expected_free_index);
        expect(vm.voice_memo).toEqual({ "10": 3, "12": 0, "15": 2, "30": 1 });
      });
    });
  });

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

  describe("voiceFree", () => {
    it("note to be liberated is not in voice stack", () => {
      const stack_before = [{ note: 12, time: 800 }, { note: 20, time: 910 }];
      const voice_memo = { "12": 0, "20": 1 };
      vm.voice_stack = stack_before;
      vm.voice_memo = voice_memo;

      vm.voiceFree(80);

      expect(vm.voice_stack).toEqual(stack_before);
    });
    it("note to be liberated should be removed from stack", () => {
      const stack_before = [{ note: 12, time: 800 }, { note: 20, time: 910 }];
      const stack_after = [null, { note: 20, time: 910 }];
      const voice_memo = { "12": 0, "20": 1 };
      vm.voice_stack = stack_before;
      vm.voice_memo = voice_memo;

      vm.voiceFree(12);

      expect(vm.voice_stack).toEqual(stack_after);
    });
  });
});
