import {MasterShader} from "../interfaces.js";
import p5 from "p5";

export default class ShaderCross extends MasterShader {
    apply(p: p5.default, millis: number, buffer: p5.default.Framebuffer) {
        p.shader(this.shader);
        this.shader.setUniform("uTex", buffer);
        this.shader.setUniform("offset", millis/900);
        this.shader.setUniform("scale", 1.5 + Math.sin(millis/800) * 0.4)
    }
}