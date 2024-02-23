precision mediump float;

// Receive color and position values from the vertex shader
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;
varying vec3 v_light_positions[8];
varying vec3 v_light_colors[8];

// Number of light sources from the rastervisitor
uniform int u_number_of_lights;


// Phong shading coefficients from the rastervisitor
uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_shininess;

void main(void) {
  // Calculate the ambient contribution
  vec3 ambient = v_color * u_ka;

  // Create variable to hold diffuse & specular contribution
  vec3 diffuse;
  vec3 specular;

  // Calculate the diffuse & specular contribution for each light source
  for (int i = 0; i < 8; i++){
    if (i >= int(u_number_of_lights)) {
      break;
    }
    vec3 lightDir = normalize(v_light_positions[i] - v_position.xyz);
    vec3 N = normalize(v_normal);

    // Get the camera to calculate the view direction
    vec3 camPos = vec3(0.0, 0.0, 0.0);
    vec3 viewDir = normalize(camPos - v_position);


    // Apply the light color 
    vec3 lightColor = v_light_colors[i];
    diffuse += lightColor * max(dot(N, lightDir), 0.0);

    vec3 r = (2.0 * dot(N, lightDir) * N - lightDir);
    specular += lightColor * pow(max(dot(r, viewDir), 0.0), u_shininess);
  }

  // Calculate the final color
  diffuse = u_kd * diffuse;
  specular = u_ks * specular;

  // Output the color
  gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}