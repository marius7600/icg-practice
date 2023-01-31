precision mediump float;

// Receive color and position values
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;
varying vec3 v_light_positions[8];

uniform int u_number_of_lights;

// const vec3 v_light_position = vec3(1.0, 1.0, 1.0);

// Phong shading coefficients
uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_shininess;
// das hier alles uniform float

void main(void) {
  // Calculate the ambient contribution
  vec3 ambient = v_color * u_ka;

  // Create variable to hold diffuse & specular contribution
  vec3 diffuse = vec3(0.0, 0.0, 0.0);
  vec3 specular = vec3(0.0, 0.0, 0.0);

  // Calculate the diffuse & specular contribution for each light source
  for (int i = 0; i < 8; i++){
    if (i >= int(u_number_of_lights)) {
      break;
    }
    vec3 lightDir = normalize(v_light_positions[i] - v_position);
    vec3 viewDir = normalize(v_normal);

    diffuse += v_color * max(dot(viewDir, lightDir), 0.0);
    vec3 r = normalize(viewDir * (2.0 * dot(viewDir, lightDir)) - lightDir);
    specular += v_color * pow(max(dot(r, viewDir), 0.0), u_shininess);
  }

  // Calculate the final color
  diffuse = u_kd * diffuse;
  specular = u_ks * specular;

  // Output the color
  gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
