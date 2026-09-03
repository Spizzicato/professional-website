import * as Tone from 'tone';
import { randomOffset, randomPositiveOffset } from './helpers';


export class NodeSynth {
    synth = new Tone.FMSynth().toDestination();
    frequency!: number;
    // filter!: Tone.Filter;
    release!: number;

    private started = false;

    constructor() {
        this.frequency = 440 + 100 * randomOffset();

        this.release = 0.1;

        this.synth.set({
            envelope: {
                attack: 0.005,
                decay: 0.5,
                sustain: 0,
                release: 0.5 + 0.4 * randomOffset()
            },
            oscillator: {
                type: "sine"
            },
            modulation: {
                type: "sine",
            },
            modulationIndex: 300 * randomPositiveOffset(),
            harmonicity: 2 + randomOffset()
        });

        // this.filter = new Tone.Filter().toDestination();
        // this.filter.set({
        //     frequency: 0,
        //     type: "highpass"
        // }).toDestination();
    }

    private async ensureStarted() {
        if (!this.started) {
            await Tone.start();
            this.started = true;
        }
    }

    async play() {
        await this.ensureStarted();
        const now = Tone.now();
        this.synth.triggerAttackRelease(this.frequency, this.release, now);
    }
}