attribute vec3 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N; // normal matrix

void main() {
  gl_Position = P * V * M * vec4(a_position, 1.0);
  v_color = a_color;
}