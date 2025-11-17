#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;

uniform bool flip;
uniform float zoom;

void main() {
    vec2 uv = vTexCoord - 0.5;
    if (flip) {
        uv.x = -uv.x;
    }
    uv *= zoom;
    uv += 0.5;

    vec4 color = texture2D(uTex, uv);
    gl_FragColor = color;
}