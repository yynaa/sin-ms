#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;

uniform float offset;

void main() {
    vec4 color = texture2D(uTex, fract(vTexCoord + vec2(offset + 0.5, 0.)));
    vec4 colorFlip = texture2D(uTex, fract(1. - vTexCoord + vec2(offset, 0.)));
    gl_FragColor = vec4(color.r, colorFlip.g, color.b, max(color.a, colorFlip.a));
    //gl_FragColor = color;
}