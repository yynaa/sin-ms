#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;

uniform float zoom;

void main() {
    vec4 color = texture2D(uTex, ((vTexCoord - 0.5) * zoom) + 0.5);
    gl_FragColor = color;
}