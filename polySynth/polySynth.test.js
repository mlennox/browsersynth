it("", () => {});

// import BasicSynth from "./basicSynth";

// let mock_param, mock_ctx, synth, midi, voiceManager_mock;

// describe("basic synth", () => {
//   beforeAll(() => {
//     voiceManager_mock = {};
//     mock_param = {
//       setTargetAtTime: () => {},
//       cancelScheduledValues: () => {},
//       setValueAtTime: () => {},
//       linearRampToValueAtTime: () => {}
//     };
//     midi = {
//       plugIn: () => {},
//       requestAccess: () => {}
//     };
//     mock_ctx = {
//       destination: {},
//       createOscillator: () => {
//         return {
//           connect: () => {},
//           frequency: mock_param
//         };
//       },
//       createGain: () => {
//         return {
//           connect: () => {},
//           gain: mock_param
//         };
//       }
//     };
//   });

//   beforeEach(() => {
//     synth = new BasicSynth({
//       midi,
//       ctx: mock_ctx,
//       voiceManager: voiceManager_mock
//     });
//   });

//   it("works", () => {
//     expect(synth.noteOn).not.toBeNull();
//   });
//   describe("generate voices", () => {
//     it("will generate number of voices matching max_voices property", () => {
//       synth.max_voices = 2;
//       var voices = [...synth.generateVoices(synth.ctx)];

//       expect(voices.length).toEqual(synth.max_voices);
//     });
//   });

//   // // voice stealing
//   // describe("assignOrUpdateVoice", () => {
//   //   it("if no voices sounding then first voice in stack ", () => {
//   //     const stackBefore = [0, 0, 0, 0];
//   //     const stackAfter = [1, 0, 0, 0];
//   //     synth.voice_stack = stackBefore;

//   //     synth.assignOrUpdateVoice(1, 100);

//   //     expect(synth.voice_stack).toEqual(stackAfter);
//   //   });
//   // });
// });
