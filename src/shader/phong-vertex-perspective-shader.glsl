precision mediump float;

// Attributes: Variables hold data for each vertex from application -> Can be changed per vertex
// Varyings: Passed to the fragment shader & interpolated across primitives 
// Uniforms: Variables that are constant for all vertices in a draw call

// Get the position normal and color of the vertex from the object
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;

// Pass color as attribute and forward it to the fragment shader
varying vec3 v_color;

// Pass the vertex position in view space to the fragment shader
varying vec3 v_position;

// Pass the normal of the vertex to the fragment shader
varying vec3 v_normal;

uniform mat4 M; // Model matrix
uniform mat4 V; // View matrix
uniform mat4 P; // projection matrix
uniform mat4 N; // normal matrix

// Get the number of lights and colors from the rastervisitor 
uniform vec3 u_light_positions[8];
uniform vec3 u_light_colors[8];

varying vec3 v_light_positions[8];
varying vec3 v_light_colors[8];

// varying float v_number_of_lights;

void main() {
  // Transform the vertex position to clip space 
  gl_Position = P * V * M * vec4(a_position, 1.0); 

  // Pass the color and transformed vertex position to the fragment shader
  v_color = a_color;
  v_position = vec3((V * M * vec4(a_position,1.0)).xyz);
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);

  // Pass the light positions to the fragment shader
  v_light_positions[0] = u_light_positions[0];
  v_light_positions[1] = u_light_positions[1];
  v_light_positions[2] = u_light_positions[2];
  v_light_positions[3] = u_light_positions[3];
  v_light_positions[4] = u_light_positions[4];
  v_light_positions[5] = u_light_positions[5];
  v_light_positions[6] = u_light_positions[6];
  v_light_positions[7] = u_light_positions[7];

  //Pass the light colors to the fragment shader
  v_light_colors[0] = u_light_colors[0];
  v_light_colors[1] = u_light_colors[1];
  v_light_colors[2] = u_light_colors[2];
  v_light_colors[3] = u_light_colors[3];
  v_light_colors[4] = u_light_colors[4];
  v_light_colors[5] = u_light_colors[5];
  v_light_colors[6] = u_light_colors[6];
  v_light_colors[7] = u_light_colors[7];
}
