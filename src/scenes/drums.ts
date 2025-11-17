import {Scene} from "../interfaces.js";
import p5 from "p5";
import {
    glslDrums,
    glslLead,
    glslScreenFlip,
    videoHat,
    videoKick,
    videoSnare
} from "../sketch.js";

export default class SceneDrums extends Scene {
    kickFlip: boolean;
    kickBuffer: p5.default.Graphics;

    snareFlip: boolean;
    snareBuffer: p5.default.Graphics;
    snareDraw: boolean;

    hatFlip: boolean;
    hatBuffer: p5.default.Graphics;

    constructor(p: p5.default) {
        super(p);
        this.kickFlip = true;
        this.snareFlip = true;
        this.hatFlip = true;

        this.kickBuffer = p.createGraphics(p.width, p.height, "p2d")
        this.snareBuffer = p.createGraphics(p.width, p.height, "p2d")
        this.hatBuffer = p.createGraphics(p.width, p.height, "p2d")

        this.snareDraw = true;
    }

    demoStart(p: p5.default) {
        this.kickBuffer.image(videoKick, 0, 0, this.kickBuffer.width, this.kickBuffer.height)
        this.snareBuffer.image(videoSnare, 0, 0, this.snareBuffer.width, this.snareBuffer.height)
    }

    enter(millis: number, p: p5.default) {
        p.noLights();
        p.noStroke();
    }

    draw(millis: number, p: p5.default) {
        if (videoKick.elt.readyState >= videoKick.elt.HAVE_ENOUGH_DATA) {
            this.kickBuffer.image(videoKick, 0, 0, this.kickBuffer.width, this.kickBuffer.height)
        }
        if (videoSnare.elt.readyState >= videoSnare.elt.HAVE_ENOUGH_DATA) {
            this.snareBuffer.image(videoSnare, 0, 0, this.snareBuffer.width, this.snareBuffer.height)
        }
        // if (videoHat.elt.readyState >= videoHat.elt.HAVE_ENOUGH_DATA) {
        //     this.hatBuffer.image(videoHat, 0, 0, this.hatBuffer.width, this.hatBuffer.height)
        // }

        this.buffer.begin();

        p.ortho();
        p.camera(0, 0, 350, 0, 0, 0);

        p.background(0);

        p.shader(glslDrums)
        glslDrums.setUniform("uResolution", [p.width, p.height]);
        glslDrums.setUniform("uTexKick", this.kickBuffer);
        glslDrums.setUniform("flipKick", this.kickFlip);
        glslDrums.setUniform("uTexSnare", this.snareBuffer);
        glslDrums.setUniform("flipSnare", this.snareFlip);
        glslDrums.setUniform("uTexHat", this.hatBuffer);
        glslDrums.setUniform("flipHat", this.hatFlip);
        glslDrums.setUniform("drawSnare", this.snareDraw);

        glslDrums.setUniform("staticHueAdd", -millis/2000);
        glslDrums.setUniform("xAxisShift", Math.sin(millis/800)*0.006)

        p.plane(p.width, p.height);

        this.buffer.end();

    }

    onTick(tick: number, millis: number, p: p5.default) {
    }

    onLine(line: number, millis: number, p: p5.default) {
        // const halfPattern = Math.floor((line-8)/32);
        // const l = line % 4;
        // if (l == 2 && halfPattern !== 7) {
        //     this.flipHat()
        // }
    }

    onBeat(beat: number, millis: number, p: p5.default) {
        const halfPattern = Math.floor((beat-2)/8);
        this.flipKick()
        if (beat % 2 == 1 && halfPattern !== 7 && beat < 12*16+2) {
            this.flipSnare();
        }
        if (this.snareDraw && beat >= 12*16+2) {
            this.snareDraw = false;
        }
    }

    flipKick() {
        this.kickFlip = !this.kickFlip;
        videoKick.play();
        videoKick.time(0.0);
    }

    flipSnare() {
        this.snareFlip = !this.snareFlip;
        videoSnare.play();
        videoSnare.time(0.0);
    }

    // flipHat() {
    //     this.hatFlip = !this.hatFlip;
    //     videoHat.play();
    //     videoHat.time(0.0);
    // }
}