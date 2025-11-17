#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;

uniform bool flip;

void main() {
    vec2 texCoordEdit = vTexCoord;
    if (flip) {
        texCoordEdit.x = 1. - texCoordEdit.x;
    }
    vec4 color = texture2D(uTex, texCoordEdit);
    gl_FragColor = color;
}