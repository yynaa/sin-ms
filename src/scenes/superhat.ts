import {Scene} from "../interfaces.js";
import p5 from "p5";
import {glslScreenFlip, glslScreenFlipZoom, videoHat} from "../sketch.js";

export default class SceneSuperHat extends Scene {
    hatFlip: boolean;
    hatZoom: number;
    hatBuffer: p5.default.Graphics;

    constructor(p: p5.default) {
        super(p);
        this.hatFlip = true;
        this.hatZoom = 1.0;
        this.hatBuffer = p.createGraphics(p.width, p.height, "p2d")
    }

    demoStart(p: p5.default) {
        videoHat.play();
        this.hatBuffer.image(videoHat, 0, 0, this.hatBuffer.width, this.hatBuffer.height)
    }

    enter(millis: number, p: p5.default) {
    }

    draw(millis: number, p: p5.default) {
        if (videoHat.elt.readyState >= videoHat.elt.HAVE_ENOUGH_DATA) {
            this.hatBuffer.image(videoHat, 0, 0, this.hatBuffer.width, this.hatBuffer.height)
        }

        this.buffer.begin();

        p.ortho();
        p.camera(0, 0, 350, 0, 0, 0);

        p.background(0);

        p.shader(glslScreenFlipZoom)
        glslScreenFlipZoom.setUniform("uTex", this.hatBuffer);
        glslScreenFlipZoom.setUniform("flip", this.hatFlip);
        glslScreenFlipZoom.setUniform("zoom", this.hatZoom);

        this.hatZoom = p.lerp(this.hatZoom, 1.0, 0.05)

        p.plane(p.width, p.height);

        this.buffer.end();
    }

    onTick(tick: number, millis: number, p: p5.default) {
    }

    onBeat(beat: number, millis: number, p: p5.default) {
    }

    onLine(line: number, millis: number, p: p5.default) {
        this.flipHat()
    }

    flipHat() {
        this.hatFlip = !this.hatFlip;
        this.hatZoom = 0.8;
        //videoHat.play();
        //videoHat.time(0.2);
    }

}