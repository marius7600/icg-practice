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

// uniform float a_number_of_lights;

uniform vec3 u_light_positions[8];
uniform vec3 u_light_colors[8];

varying vec3 v_normal;

// Pass the vertex position in view space
// to the fragment shader
// TODO
varying vec3 v_position;

// Pass the phong shading coefficients
// to the fragment shader
uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_shininess;
varying vec3 v_light_positions[8];

// varying float v_number_of_lights;

void main() {
  
  // v_number_of_lights = a_number_of_lights; //wichtig Frage an Tino: Warum ist das Wichtig kann kommplet raus und es funktioniert immer noch?!?

  gl_Position = P * V * M * vec4(a_position, 1.0); //wichtig
  
  // Pass the color and transformed vertex position through
  // TODO
  v_color = a_color;
  // v_position = vec3(M * vec4(a_position, 1.0));
  v_position = vec3((V * M * vec4(a_position,1.0)).xyz);
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);

  // kann auch raus
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
