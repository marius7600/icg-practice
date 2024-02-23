// Position, texture coordinates and normal of the vertex from the vertex buffer 
// of the rastervisitor
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

// Pass the texture coordinates, normal and position to the fragment shader
varying vec2 v_texCoord;
varying vec3 v_position;
varying vec3 v_normal;

uniform mat4 M; // model matrix
uniform mat4 V; // view matrix
uniform mat4 P; // projection matrix
uniform mat4 N; // normal matrix

uniform vec3 u_light_positions[8];
uniform vec3 u_light_colors[8];

varying vec3 v_light_positions[8];
varying vec3 v_light_colors[8];

void main() {
    // Calculate the position of the vertex in the camera coordinate system and pass it to the fragment shader
    gl_Position = P * V * M * vec4(a_position, 1.0);

    // Pass the color and transformed vertex position to the fragment shader
    v_texCoord = a_texCoord;
    v_position = ((V * M  * vec4(a_position, 1.0)).xyz);
    v_normal = normalize(( V* N * vec4(a_normal, 0)).xyz);

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
