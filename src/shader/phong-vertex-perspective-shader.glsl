precision mediump float;

attribute vec3 a_position;
attribute vec3 a_normal;

// Pass color as attribute and forward it
// to the fragment shader
// TODO
attribute vec3 a_color;
varying vec3 v_color;


uniform mat4 M; // Model matrix
uniform mat4 V; // View matrix
uniform mat4 P; // projection matrix
uniform mat4 N; // normal matrix

uniform float a_ka;
uniform float a_kd;
uniform float a_ks;
uniform float a_shininess;
uniform float a_number_of_lights;

uniform vec3 u_light_positions[8];
uniform vec3 u_light_colors[8];

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
varying vec3 v_light_positions[8];

varying float v_number_of_lights;

void main() {
  v_kd = a_kd;
  v_ka = a_ka;
  v_ks = a_ks;
  v_shininess = a_shininess;
  
  v_number_of_lights = a_number_of_lights;

  gl_Position = P * V * M * vec4(a_position, 1.0);
  
  // Pass the color and transformed vertex position through
  // TODO
  v_color = a_color;
  // v_position = vec3(M * vec4(a_position, 1.0));
  v_position = vec3(V * M * vec4(a_position,1.0));
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);

  // Pass the light positions and colors to the fragment shader
  v_light_positions[0] = u_light_positions[0];
  v_light_positions[1] = u_light_positions[1];
  v_light_positions[2] = u_light_positions[2];
  v_light_positions[3] = u_light_positions[3];
  v_light_positions[4] = u_light_positions[4];
  v_light_positions[5] = u_light_positions[5];
  v_light_positions[6] = u_light_positions[6];
  v_light_positions[7] = u_light_positions[7];

  //TODO implement variable light colors
}
