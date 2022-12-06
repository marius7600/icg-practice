precision mediump float;

// Receive color and position values
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;
varying vec3 v_light_positions[8];

varying float v_number_of_lights;

// const vec3 v_light_position = vec3(1.0, 1.0, 1.0);

// Phong shading coefficients
varying float v_ka;
varying float v_kd;
varying float v_ks;
varying float v_shininess;
// das hier alles uniform float

void main(void) {
  // Calculate the ambient contribution
  vec3 ambient = v_ka * v_color;
  // Create variable to hold diffuse & specular contribution
  vec3 diffuse = vec3(0.0, 0.0, 0.0);
  vec3 specular = vec3(0.0, 0.0, 0.0);
  // Calculate the diffuse & specular contribution for each light source
  for (int i = 0; i < 1; i+=1){
    vec3 lightDir = normalize(v_light_positions[int(i)] - v_position);

    vec3 viewDir = normalize(v_normal);

    diffuse += v_color * max(dot(viewDir, lightDir), 0.0);

    vec3 r = normalize(viewDir * (2.0 * dot(viewDir, lightDir)) - lightDir);
    specular += v_color * pow(max(dot(r, viewDir), 0.0), v_shininess);
  }
  // Calculate the final color
  diffuse = v_kd * diffuse;
  specular = v_ks * specular;

  // Output the color
  gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
