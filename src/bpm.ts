import p5 from "p5";

class BPM {
    lpb: number;
    tpl: number;
    msPerTick: number;

    beat: number;
    line: number;
    tick: number;

    onTick: (tick: number, millis: number, p: p5.default) => void;
    onLine: (line: number, millis: number, p: p5.default) => void;
    onBeat: (beat: number, millis: number, p: p5.default) => void;

    constructor(
        bpm: number,
        lpb: number,
        tpl: number,
        onTick: (tick: number, millis: number, p: p5.default) => void,
        onLine: (line: number, millis: number, p: p5.default) => void,
        onBeat: (beat: number, millis: number, p: p5.default) => void
    ) {
        this.lpb = lpb;
        this.tpl = tpl;

        const msPerBeat = (60*1000)/bpm;
        const msPerLine = msPerBeat/lpb;
        this.msPerTick = msPerLine/tpl;

        this.beat = 0;
        this.line = 0;
        this.tick = 0;

        this.onTick = onTick;
        this.onLine = onLine;
        this.onBeat = onBeat;
    }

    update(millis: number, p: p5.default) {
        const newTick = Math.floor(millis/this.msPerTick);
        if (newTick > this.tick) {
            for (let i = this.tick+1; i <= newTick; i++) {
                this.onTick(i, millis, p)
            }
        }
        this.tick = newTick;

        const newLine = Math.floor(this.tick/this.tpl);
        if (newLine > this.line) {
            for (let i = this.line+1; i <= newLine; i++) {
                this.onLine(i, millis, p)
            }
        }
        this.line = newLine;

        const newBeat = Math.floor(this.line/this.lpb);
        if (newBeat > this.beat) {
            for (let i = this.beat+1; i <= newBeat; i++) {
                this.onBeat(i, millis, p)
            }
        }
        this.beat = newBeat;
    }
}

export default BPM;