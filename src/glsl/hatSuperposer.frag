#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D uTexMain;
uniform sampler2D uTexHat;

uniform float scale;
uniform vec2 offset;

uniform float superposerOpacity;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = vTexCoord;
    uv *= scale;
    uv += offset;
    uv = fract(uv);

    vec4 colorMain = texture2D(uTexMain, uv);
    vec4 colorHat = texture2D(uTexHat, vTexCoord);

    vec3 hsvMain = rgb2hsv(colorMain.rgb);
    vec3 hsvHat = rgb2hsv(colorHat.rgb);

    hsvMain.z = hsvHat.z * (superposerOpacity*0.5) + hsvMain.z * (1. - (superposerOpacity*0.5));
    hsvMain.x = fract(hsvMain.x + (hsvHat.z * superposerOpacity + hsvMain.z * (1. - superposerOpacity)));

    hsvMain.y = clamp(hsvMain.y, hsvMain.z*0.7, 1.0);
    hsvMain.z = clamp(hsvMain.z, 0.2, 1.0);

    gl_FragColor = vec4(hsv2rgb(hsvMain), colorMain.a);
}
