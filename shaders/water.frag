#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uTexture;
uniform float time;

varying vec2 vTexCoord;

void main() {
  vec2 pos = vTexCoord;
  pos.x += sin(time + pos.y * 10.0) * 0.01;
  pos.y += cos(time + pos.x * 8.0) * 0.01;
  gl_FragColor = texture2D(uTexture, pos);
}