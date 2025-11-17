#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.14159;

varying vec2 vTexCoord;
uniform sampler2D uTex;

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
    vec4 originalColor = texture2D(uTex, vTexCoord);

    vec3 hsv = rgb2hsv(originalColor.rgb);

    float angle = 2.*PI*hsv.x;
    vec2 offset = vec2(cos(angle), sin(angle));
    float r = texture2D(uTex, vTexCoord + offset * 0.2).r;

    angle = 2.*PI*hsv.y;
    offset = vec2(cos(angle), sin(angle));
    float g = texture2D(uTex, vTexCoord + offset * 0.1).g;

    angle = 2.*PI*hsv.z;
    offset = vec2(cos(angle), sin(angle));
    float b = texture2D(uTex, vTexCoord + offset * 0.15).b;

    gl_FragColor = vec4(g, b, r, originalColor.a);
}