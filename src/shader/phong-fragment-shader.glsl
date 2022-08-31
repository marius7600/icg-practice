precision mediump float;

// Receive color and position values
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;



const vec3 lightPos = vec3(1.0, 1.0, 1.0);

const float shininess = 16.0;
const float kA = 0.3;
const float kD = 0.6;
const float kS = 0.7;


// Phong shading coefficients
varying float v_ka;
varying float v_kd;
varying float v_ks;
varying float v_shininess;

void main(void) {
  // gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
  // Phong lighting calculation
  //TODO
  vec3 lightDir = normalize(lightPos - v_position);
  vec3 viewDir = normalize(vec3(0.0, 0.0, 0.0) - v_position);
  vec3 reflectDir = normalize(reflect(-lightDir, v_normal));

  // vec3 ambient = v_ka * v_color;
  vec3 ambient = kA * v_color;

  vec3 specularTerm = normalize(v_normal*(dot(v_normal, lightDir)*2.0 - lightDir)); //    const r = n.mul(2*n.dot(s)).sub(s);
  // vec3 specular = v_color * pow(max(dot(specularTerm, viewDir), 0.0), v_shininess); //Works
  vec3 specular = v_color * pow(max(dot(specularTerm, viewDir), 0.0), shininess); //Works

  vec3 diffuse = v_color * max(dot(lightDir, v_normal), 0.0); //Works
  // specular = v_ks * specular;
  specular = kS * specular;

  // diffuse = v_kd * diffuse;
  diffuse = kD * diffuse;
  gl_FragColor = vec4(ambient + diffuse + specular, 1.0);



}
