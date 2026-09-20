import * as Tone from 'tone';
import { ParameterOption, randomOffset, randomPositiveOffset } from './helpers';

type Parameter = "" | "" | "";

// 25 notes total
const notes: ParameterOption[] = [
	["C3", 130.81],
	["D♭3", 138.59],
	["D3", 146.83],
	["E♭3", 155.56],
	["E3", 164.81],
	["F3", 174.61],
	["G♭3", 185.00],
	["G3", 196.00],
	["A♭3", 207.65],
	["A3", 220.00],
	["B♭3", 233.08],
	["B3", 246.94],
	["C4", 261.63],
	["D♭4", 277.18],
	["D4", 293.66],
	["E♭4", 311.13],
	["E4", 329.63],
	["F4", 349.23],
	["G♭4", 369.99],
	["G4", 392.00],
	["A♭4", 415.30],
	["A4", 440.00],
	["B♭4", 466.16],
	["B4", 493.88],
	["C5", 523.25]
];

export class NodeSynth {
    synth = new Tone.FMSynth();
    private frequency!: number;
    private duration!: number;

    private started = false;

    private parameterOptions = [notes, notes, notes, notes];
    private parameterIndices = [0, 0, 0, 0];

    constructor() {
        this.frequency = 1000;
        this.duration = 0.1;

        // this.filter = new Tone.Filter().toDestination();
        // this.filter.set({
        //     frequency: 0,
        //     type: "highpass"
        // }).toDestination();

        this.ensureStarted().then(() => {
            console.log('tone started');
        });

        [0, 1, 2, 3].map((i) => this.updateParameter(i, 0));

        this.updateSynth();
    }

    private async ensureStarted() {
        if (this.started) return;
        await Tone.start();
        this.started = true;
    }

    async play() {
        await this.ensureStarted();
        this.synth.triggerAttackRelease(this.frequency, this.duration, Tone.now());
    }

    updateSynth() {
        this.synth.set({
            envelope: {
                attack: 0.005,
                decay: 0.05 + 0.1,
                sustain: 0,
                release: 0.05 + 0.1,
            },
            oscillator: {
                type: "sine"
            },
            modulation: {
                type: "sine",
            },
            modulationIndex: 20,
            harmonicity: 2
        });

        // const reverb = new Tone.Reverb(1.0).toDestination();
        // this.synth.connect(reverb);

        this.synth.toDestination();
    }

    getParameterOptions(param: number) {
        return this.parameterOptions[param];
    }

    getParameterOptionIndex(param: number) {
        return this.parameterIndices[param];
    }

    getSelectedOptionName(param: number) {
        return this.parameterOptions[param][this.parameterIndices[param]][0];
    }

    updateParameter(param: number, value: number) {
        this.parameterIndices[param] = value;
        if (param === 0) {
            const i = Math.max(0, Math.min(value, this.parameterOptions[0].length));
            this.frequency = 2 * this.parameterOptions[0][i][1];
        }
        else if (param === 1) {

        }
        else if (param === 2) {

        }
        else if (param === 3) {

        }
        this.updateSynth();
    }
}