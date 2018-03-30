DISCLAIMER : all Work In Progress - I'll try and keep the demos working as I refector everything, but no guarantees

# Browser Synth

This is a repo to accompany blog posts at http://www.webpusher.ie

The goal is to investigate the Web MIDI and Audio APIs by building a MIDI interface and connecting that to a series of synths - from simple monophonic to more complex synths : AM/FM synthesis, Karplus-Strong driven and samplers.

NOTE : there is currently no UI for this, apart from the MIDI monitor - the default synth 'wiring' will assume you have a keyboard that uses the same control mappings as the Arturia MINILAB mkII

I'll probably throw in a sequencer too at some stage.

[![CircleCI](https://circleci.com/gh/mlennox/browsersynth.svg?style=svg)](https://circleci.com/gh/mlennox/browsersynth)

## Running the examples

You'll need an up to date installation of Nodejs (I recommend using nvm to manage versions). To get the examples running in your browser run the following in the root folder of this repo once you have cloned it to your local machine.

```bash
npm install
./start.sh
```

Your browser should now open on `localhost:8080` and display a set of links to the various demos

### Testing

Using `Jest` so just run the following in the root folder

```bash
jest .
```

## Goal

To create a basic synth framework

To use a synth, you would initialise a midi receiver

```js
const midi = new MIDI({
  channels: {
    "1":  new monophonic({
            monitor: new Monitor({ display_container_id: "channelOne" }),
            mapMidiControlsToSynthControlsEtc
          })
    "2": new BasicSynth() // you don't actually need to pass in a monitor
    "3": new Monitor(); // you can just monitor a channel if you wish
  },
  // what other options might we pass in?
});
//midi should now be receiving messages and the synths should be ready to play
```

Inside midi init/constructor it will run through the channels object, init the synth and connect the handlers

```js
for (const [channel, synth] of Object.entries(this.channels)) {
  this.plugIn(synth.init(), channel);
}
```

Each synth should use a synth prototype

```js
function Synth() {

}

Synth.prototype = {

}

export
```

## Disclaimer

The code is written to support ES6 modules and the Web and MIDI API currently available in Chrome 64+.

## Demos

## Simple MIDI interface

Connects to any MIDI devices, expects to be passed a MIDI 'device'

### MIDI monitor

Displays details of the MIDI message received on the channel (1 in this case).

### Simple monophonic synth

This is based on the example [Monosynth by Chris Wilson](https://github.com/cwilso/monosynth) but refactored to pull the elements into different ES6 modules making it easier to reuse - not sure that makes this a modular synth :)
