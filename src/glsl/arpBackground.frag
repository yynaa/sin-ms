#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;

uniform bool flip;
uniform float dim;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
    vec2 texCoordEdit = vTexCoord;
    texCoordEdit *= 1.5;
    texCoordEdit -= 0.25;
    if (flip) {
        texCoordEdit.x = 1. - texCoordEdit.x;
    }
    vec4 color = texture2D(uTex, texCoordEdit);
    vec3 fuck = vec3(color.r, rgb2hsv(color.rgb).gb);
    gl_FragColor = vec4(fuck * dim, 1.);
}