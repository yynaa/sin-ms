import p5 from "p5";

export abstract class Scene {
    buffer: p5.default.Framebuffer;

    constructor(p: p5.default) {
        this.buffer = p.createFramebuffer();
    }

    abstract demoStart(p: p5.default): void;
    abstract enter(millis: number, p: p5.default): void;
    abstract draw(millis: number, p: p5.default): void;
    abstract onTick(tick: number, millis: number, p: p5.default): void;
    abstract onLine(line: number, millis: number, p: p5.default): void;
    abstract onBeat(beat: number, millis: number, p: p5.default): void;
}

export abstract class MasterShader {
    shader: p5.default.Shader;

    constructor(p: p5.default, shader: p5.default.Shader) {
        this.shader = shader;
    }

    abstract apply(p: p5.default, millis: number, buffer: p5.default.Framebuffer): void;
}