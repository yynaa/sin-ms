import {MasterShader} from "../interfaces.js";
import p5 from "p5";

export default class ShaderHorizSub extends MasterShader {
    apply(p: p5.default, millis: number, buffer: p5.default.Framebuffer) {
        p.shader(this.shader);
        this.shader.setUniform("uTex", buffer);
        this.shader.setUniform("offset", Math.sin((millis+300)/1200)*1);
    }
}