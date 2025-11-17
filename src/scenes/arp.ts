import {Scene} from "../interfaces.js";
import p5 from "p5";
import {
    videoArp,
    glslArpBackground,
    glslArpCube,
    videoChord
} from "../sketch.js";

export default class SceneArp extends Scene {
    arpShow: boolean;
    arpFlip: boolean;
    arpBuffer: p5.default.Graphics;

    chordBuffer: p5.default.Graphics;
    chordFlip: boolean;
    chordDim: number;

    constructor(p: p5.default) {
        super(p);
        this.arpFlip = false;
        this.arpShow = false;
        this.arpBuffer = p.createGraphics(p.width, p.height, "p2d")

        this.chordBuffer = p.createGraphics(p.width, p.height, "p2d")
        this.chordFlip = true;
        this.chordDim = 1.0;
    }

    demoStart(p: p5.default) {
        this.chordBuffer.image(videoChord, 0, 0, this.chordBuffer.width, this.chordBuffer.height)
    }

    enter(millis: number, p: p5.default) {
        p.noLights();
        p.noStroke();
    }

    draw(millis: number, p: p5.default) {
        if (videoArp.elt.readyState >= videoArp.elt.HAVE_ENOUGH_DATA) {
            this.arpBuffer.image(videoArp, 0, 0, this.arpBuffer.width, this.arpBuffer.height)
        }
        if (videoChord.elt.readyState >= videoChord.elt.HAVE_ENOUGH_DATA) {
            this.chordBuffer.image(videoChord, 0, 0, this.chordBuffer.width, this.chordBuffer.height)
        }

        this.buffer.begin();

        const boxSize = 50;

        p.perspective(0.5);
        p.camera(0, 0, 350, 0, 0, 0);

        p.background(0);

        p.shader(glslArpBackground);
        glslArpBackground.setUniform("uTex", this.chordBuffer);
        glslArpBackground.setUniform("flip", this.chordFlip);
        glslArpBackground.setUniform("dim", this.chordDim);

        p.push()
        p.translate(0, 0, -90);
        p.plane(1920/4, 1080/4);
        p.pop()

        if (this.arpShow) {
            p.shader(glslArpCube);
            glslArpCube.setUniform("uTex", this.arpBuffer);
            glslArpCube.setUniform("flip", this.arpFlip);


            p.translate(-60, 0, 100);
            p.rotateX(-millis/1000);
            p.rotateY(millis/1500);
            p.rotateZ(-millis/1750);
            p.box(boxSize, boxSize);
            p.resetMatrix();

            p.translate(60, 0, 100);
            p.rotateX(-millis/1000);
            p.rotateY(millis/1500);
            p.rotateZ(-millis/1750);
            p.box(boxSize, boxSize);
            p.resetMatrix();

            p.resetShader();
        }

        this.buffer.end();
    }

    onTick(tick: number, millis: number, p: p5.default) {
        const t = tick % (8*6);
        if (t >= 6*4 && t < 6*6) {
            this.flipArp(false);
        }
    }

    onLine(line: number, millis: number, p: p5.default) {
        const l = line % 8;
        if (l !== 0 && l !== 4 && l !== 5) {
            this.flipArp();
        }

        if (line % 4 == 2) {
            this.flipChord();
        }
    }

    onBeat(beat: number, millis: number, p: p5.default) {
        if (beat >= 16*4+2) {
            this.arpShow = true;
            this.chordDim = 0.70;
        }
    }

    flipArp(play: boolean = true) {
        this.arpFlip = !this.arpFlip;
        if (play) {
            videoArp.play();
            videoArp.time(0.0);
        }
    }

    flipChord() {
        this.chordFlip = !this.chordFlip;
        videoChord.play();
        videoChord.time(0.1);
    }
}
