#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uTex;

uniform float offset;

void main() {
    vec4 color = texture2D(uTex, vTexCoord);
    vec4 colorSideways = texture2D(uTex, vTexCoord.yx * vec2(1., 2.) + vec2(0., -0.5 + offset));
    vec4 colorSidewaysAlt = texture2D(uTex, vTexCoord.yx * vec2(-1., -2.) + vec2(1., +1.5 + offset));
    //gl_FragColor = vec4(color.r, colorFlip.g, color.b, max(color.a, colorFlip.a));
    gl_FragColor = vec4(1. - (color.rgb * colorSideways.rgb * colorSidewaysAlt.rgb) * 4., color.a);
    //gl_FragColor = colorSidewaysAlt;
}