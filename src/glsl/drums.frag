#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 uResolution;

uniform sampler2D uTexKick;
uniform sampler2D uTexSnare;
uniform sampler2D uTexHat;

uniform bool flipKick;
uniform bool flipSnare;
uniform bool flipHat;

uniform bool drawSnare;

uniform float staticHueAdd;
uniform float xAxisShift;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 renderSnare(float scale, float hueAdd, float satMult, float lumMult, vec2 posAdd) {
    vec2 uv = vTexCoord;
    uv -= 0.5;
    uv += posAdd;
    if (flipSnare) {
        uv.x *= -1.;
    }
    uv *= 1./scale;
    uv += 0.5;

    vec4 colorSnare = texture2D(uTexSnare, uv);

    vec3 hsv = rgb2hsv(colorSnare.rgb);
    if (hsv.z > 0.5 && uv.x >= 0. && uv.x <= 1. && uv.y <= 1.) {
        hsv.x += hueAdd;
        hsv.y *= satMult;
        hsv.z *= lumMult;
        return vec4(hsv2rgb(hsv), 1.);
    }
    return vec4(0,0,0,0);
}

void main() {
    vec2 texCoordKick = vTexCoord;
    if (flipKick) {
        texCoordKick.x = 1. - texCoordKick.x;
    }
    texCoordKick.x = fract(texCoordKick.x + 0.5);
    vec4 colorKick = texture2D(uTexKick, texCoordKick);

    vec3 hsvKick = rgb2hsv(colorKick.rgb);
    hsvKick.y *= 1.5;
    hsvKick.z = 0.5;
    vec4 color = vec4(hsv2rgb(hsvKick), 1.0);

//    vec2 texCoordHat = vTexCoord;
//    if (flipHat) {
//        texCoordHat.x = 1. - texCoordHat.x;
//    }
//    vec4 colorHat = texture2D(uTexHat, texCoordHat);

    if (drawSnare) {
        for (int i = 40; i >= 0; i--) {
            vec4 newColor = renderSnare(pow(0.95, float(i)), staticHueAdd + .02 * float(i), 1. + .1 * float(i), 1. + .05 * float(i), vec2(-float(i) * xAxisShift, float(i) * 0.015));
            if (newColor.a > 0.0) {
                color = newColor;
            }
        }
    }

    gl_FragColor = color;
}