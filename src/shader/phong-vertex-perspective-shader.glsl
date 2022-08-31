precision mediump float;

attribute vec3 a_position;
attribute vec3 a_normal;

// Pass color as attribute and forward it
// to the fragment shader
// TODO
attribute vec3 a_color;
varying vec3 v_color;


uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N; // normal matrix

attribute float a_ka;
attribute float a_kd;
attribute float a_ks;
attribute float a_shininess;

varying vec3 v_normal;

// Pass the vertex position in view space
// to the fragment shader
// TODO
varying vec3 v_position;

// Pass the phon shading coefficients
// to the fragment shader
varying float v_ka;
varying float v_kd;
varying float v_ks;
varying float v_shininess;


void main() {
  v_kd = a_kd;
  v_ka = a_ka;
  v_ks = a_ks;
  v_shininess = a_shininess;

  gl_Position = P * V * M * vec4(a_position, 1.0);
  
  // Pass the color and transformed vertex position through
  // TODO
  v_color = a_color;
  v_position = vec3(M * vec4(a_position, 1.0));
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);
}
