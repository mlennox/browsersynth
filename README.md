# Browser Synth

This is a repo to accompany blog posts at webpusher.ie

The goal is to investigate the Web MIDI and Audio APIs by building a MIDI interface and connecting that to a series of synths - from simple monophonic to more complex synths : AM/FM synthesis, Karplus-Strong driven and samplers.

I'll probably throw in a sequencer too.

## Running the examples

You'll need an up to date installation of Nodejs (I recommend using nvm to manage versions). To get the examples running in your browser run the following in the root folder of this repo once you have cloned it to your local machine.

```bash
npm install
./start.sh
```

Your browser should now open on `localhost:8080` and display a set of links to the various demos

### Testing

Built using `Jest` so just run

```bash
npm test
```

## Disclaimer

The code is written to support ES6 modules and the Web and MIDI API currently available in Chrome 64+.

## Simple MIDI interface

Connects to any MIDI devices and displays messages on screen.

## Simple monophonic synth

This is based on the example [Monosynth by Chris Wilson](https://github.com/cwilso/monosynth) but refactored to pull the elements into different ES6 modules making it easier to reuse - not sure that makes this a modular synth :)
