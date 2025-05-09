precision highp float;

uniform sampler2D uTexture;
uniform float time;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  uv.x += sin(time + uv.y * 10.0) * 0.01;
  uv.y += cos(time + uv.x * 8.0) * 0.01;
  gl_FragColor = texture2D(uTexture, uv);
}
