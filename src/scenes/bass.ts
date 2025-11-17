import {Scene} from "../interfaces.js";
import p5 from "p5";
import {
    glslBassBackground, glslBassFlip, videoArp,
    videoBassA
} from "../sketch.js";

export default class SceneBass extends Scene {
    bassAFlip: boolean;
    bassABuffer: p5.default.Graphics;

    previousBuffer: p5.default.Framebuffer;

    constructor(p: p5.default) {
        super(p);
        this.bassAFlip = true;
        this.bassABuffer = p.createGraphics(p.width, p.height, "p2d")
        this.bassABuffer.background(255);
        this.previousBuffer = p.createFramebuffer();
    }

    demoStart(p: p5.default) {
        this.bassABuffer.image(videoBassA, 0, 0, this.bassABuffer.width, this.bassABuffer.height)
    }

    enter(millis: number, p: p5.default) {
        p.noLights();
        p.noStroke();
    }

    draw(millis: number, p: p5.default) {
        if (videoBassA.elt.readyState >= videoBassA.elt.HAVE_ENOUGH_DATA) {
            this.bassABuffer.image(videoBassA, 0, 0, this.bassABuffer.width, this.bassABuffer.height)
        }

        this.buffer.begin();

        p.ortho();
        p.camera(0, 0, 350, 0, 0, 0);

        p.background(0);

        if (this.previousBuffer !== null) {
            p.shader(glslBassBackground);
            glslBassBackground.setUniform("uTex", this.previousBuffer);

            p.translate(0, 0, -200);
            p.plane(p.width*1.07,p.height*1.07)

            p.resetMatrix();
            p.resetShader();
        }

        p.fill(0, 0, 0, 100)
        p.rotateZ(Math.sin(millis/500)*0.05);
        p.rotateX(Math.sin(millis/600)*0.50);
        p.rotateY(Math.sin(millis/650)*0.50);
        p.translate(Math.sin(millis/750) * 200 - 10,10 ,-10);
        p.plane(p.width/2, p.height/2);

        p.resetMatrix();

        p.shader(glslBassFlip);
        glslBassFlip.setUniform("uTex", this.bassABuffer);
        glslBassFlip.setUniform("flip", this.bassAFlip);

        p.rotateZ(Math.sin(millis/500)*0.05);
        p.rotateX(Math.sin(millis/600)*0.50);
        p.rotateY(Math.sin(millis/650)*0.50);
        p.translate(Math.sin(millis/750) * 200,0 ,0);
        p.plane(p.width/2, p.height/2);

        p.resetMatrix();
        p.resetShader();

        this.buffer.end();

        let temp = this.buffer;
        this.buffer = this.previousBuffer;
        this.previousBuffer = temp;
    }

    onTick(tick: number, millis: number, p: p5.default) {
    }

    onLine(line: number, millis: number, p: p5.default) {
        const l = (line+8) % 16;
        const sl = Math.floor(line/8);
        const an = Math.floor((line-8)/16)%4
        let flipOn = [0, 2, 4, 5, 6, 8, 10, 11, 13, 14, 15];
        if (an == 0) {
            flipOn = [0, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15];
        }
        if (sl == 0 || sl == 8*4) {
            flipOn = [0, 2, 4, 5, 6, 9, 10, 12, 14];
        }
        if (flipOn.includes(l)) {
            this.flipBassA();
        }
    }

    onBeat(beat: number, millis: number, p: p5.default) {

    }

    flipBassA() {
        this.bassAFlip = !this.bassAFlip;
        videoBassA.stop()
        videoBassA.loop()
        videoBassA.speed(1.5)
    }
}