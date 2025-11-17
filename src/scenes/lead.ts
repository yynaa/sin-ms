import {Scene} from "../interfaces.js";
import p5 from "p5";
import {
    glslLead,
    videoLeadA,
    videoLeadB,
    videoLeadC,
    videoLeadD,
    videoLeadE
} from "../sketch.js";

export default class SceneLead extends Scene {
    leadFlip: boolean;
    leadABuffer: p5.default.Graphics;
    leadBBuffer: p5.default.Graphics;
    leadCBuffer: p5.default.Graphics;
    leadDBuffer: p5.default.Graphics;
    leadEBuffer: p5.default.Graphics;
    leadCurrent: number;

    constructor(p: p5.default) {
        super(p);

        this.leadFlip = true;
        this.leadABuffer = p.createGraphics(p.width, p.height, "p2d");
        this.leadBBuffer = p.createGraphics(p.width, p.height, "p2d");
        this.leadCBuffer = p.createGraphics(p.width, p.height, "p2d");
        this.leadDBuffer = p.createGraphics(p.width, p.height, "p2d");
        this.leadEBuffer = p.createGraphics(p.width, p.height, "p2d");
        this.leadCurrent = 0;
    }

    demoStart(p: p5.default) {
        const buffers = [this.leadABuffer, this.leadBBuffer, this.leadCBuffer, this.leadDBuffer, this.leadEBuffer]
        const vids = [videoLeadA, videoLeadB, videoLeadC, videoLeadD, videoLeadE];

        for (let i = 0; i < buffers.length; i++) {
            const buffer = buffers[this.leadCurrent] ?? this.leadABuffer;
            const vid = vids[this.leadCurrent] ?? videoLeadA;

            buffer.image(vid, 0, 0, buffer.width, buffer.height)
        }
    }

    enter(millis: number, p: p5.default) {
        p.noStroke();
        p.noLights();
    }

    draw(millis: number, p: p5.default) {
        const buffers = [this.leadABuffer, this.leadBBuffer, this.leadCBuffer, this.leadDBuffer, this.leadEBuffer]
        const vids = [videoLeadA, videoLeadB, videoLeadC, videoLeadD, videoLeadE];

        const buffer = buffers[this.leadCurrent] ?? this.leadABuffer;
        const vid = vids[this.leadCurrent] ?? videoLeadA;

        if (vid.elt.readyState >= vid.elt.HAVE_ENOUGH_DATA) {
            buffer.image(vid, 0, 0, buffer.width, buffer.height)
        }

        this.buffer.begin();

        p.ortho();
        p.camera(0, 0, 350, 0, 0, 0);

        p.shader(glslLead)
        glslLead.setUniform("uTex", buffer);
        glslLead.setUniform("uResolution", [p.width, p.height]);
        glslLead.setUniform("flip", this.leadFlip);

        glslLead.setUniform("initialScale", 1.2);
        glslLead.setUniform("initialRot", (millis - 31000)/6000);
        glslLead.setUniform("multScale", 0.92 + Math.sin(millis/1100)*0.02);
        glslLead.setUniform("addRot", Math.sin(millis/900)*0.6);

        p.plane(p.width, p.height);

        this.buffer.end();
    }

    onTick(tick: number, millis: number, p: p5.default) {
    }

    onLine(line: number, millis: number, p: p5.default) {
        const pattern = [0,1,2,3,4,2,3,1,0,2,1,3,3,4,1,2]
        const l = (line-8)%16;
        this.leadCurrent = pattern[l] ?? 0;
        this.leadFlip = !this.leadFlip
        const vids = [videoLeadA, videoLeadB, videoLeadC, videoLeadD, videoLeadE];
        const offsets = [0.0, 0.5, 0.0, 0.0, 0.0];
        (vids[this.leadCurrent] ?? videoLeadA).play();
        (vids[this.leadCurrent] ?? videoLeadA).time(offsets[this.leadCurrent] ?? 0.0);
    }

    onBeat(beat: number, millis: number, p: p5.default) {
    }
}