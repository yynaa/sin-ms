#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;
uniform vec2 uResolution;

uniform bool flip;

uniform float initialScale;
uniform float initialRot;
uniform float multScale;
uniform float addRot;

void rect(vec2 texCoord, float scale, float rot) {
    vec2 uv = texCoord;
    uv -= 0.5;

    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    float rotE = rot;

    uv *= 1./scale;

    if (flip) {
        uv.x *= -1.;
        rot *= -1.;
    }
    float s = sin(rot);
    float c = cos(rot);
    mat2 rotMat = mat2(c, -s, s, c);
    uv = rotMat * uv;

    uv.x /= aspect;

    uv += 0.5;

    if (uv.x >= 0. && uv.x <= 1. && uv.y >= 0. && uv.y <= 1.) {
        vec4 color = texture2D(uTex, uv);
        gl_FragColor = color;
    }
}

void main() {
//    vec4 color = texture2D(uTex, texCoordEdit);
//    gl_FragColor = color;
    float scale = initialScale;
    float rot = initialRot;
    for (int i = 0; i < 13; i++) {
        rect(vTexCoord, scale, rot);
        scale *= multScale;
        rot += addRot;
    }

}