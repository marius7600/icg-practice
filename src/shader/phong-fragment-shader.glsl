precision mediump float;

// Receive color and position values
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;
varying vec3 v_light_positions[8];
varying vec3 v_light_colors[8];

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
  // vec3 diffuse = vec3(0.0, 0.0, 0.0);
  // vec3 specular = vec3(0.0, 0.0, 0.0);
  vec3 diffuse;
  vec3 specular;

  // Calculate the diffuse & specular contribution for each light source
  for (int i = 0; i < 8; i++){
    if (i >= int(u_number_of_lights)) {
      break;
    }
    vec3 lightDir = normalize(v_light_positions[i] - v_position.xyz);
    // vec3 viewDir = normalize(v_normal);

    // diffuse += v_color * max(dot(viewDir, lightDir), 0.0);
    // vec3 r = normalize(viewDir * (2.0 * dot(viewDir, lightDir)) - lightDir);
    // specular += v_color * pow(max(dot(r, viewDir), 0.0), u_shininess);

    vec3 N = normalize(v_normal);

// In Zeile 34 wollt ihr den Vektor v (viewDir) berechnen.
// Dieser Vektor startet an der Position des Fragments und verläuft in Richtung der Kamera (bzw. Auge):
// https://lectures.hci.informatik.uni-wuerzburg.de/ss22/icg/05-02-phong-reflectance-model-deck.html#/reflection-model-geometry
// Das sich die Kamera im Ursprung (0,0,0) befindet, lässt sich dieser Vektor sehr einfach aus der fragment-Position (v_position) berechnen. 
// Also im Grunde Ursprung – fragmet_position und dann normalisiert.
    vec3 camPos = vec3(0.0, 0.0, 0.0);
    vec3 viewDir = normalize(camPos - v_position);
 
// In den Zeilen 36 und 37 ist euch dann der zweite Fehler eingeschlichen.
// Dort habt ihr viewDir verwendet.
// In der Vorlesung sieht man hier, wie sich der Diffuse Anteil berechnet:
// https://lectures.hci.informatik.uni-wuerzburg.de/ss22/icg/05-02-phong-reflectance-model-deck.html#/diffuse-lighting-1
// Dort wird der normalen-Vektor n verwendet und der Vektor s (bei euch lightDir), der zum Licht hinzeigt.
// Also habt ihr da soweit alles richtig gemacht, nur dass ihr nicht den viewDir und lightDir verwenden müsst, sondern stattdessen v_normal und lightDir.

    // Apply the light color 
    vec3 lightColor = v_light_colors[i];
    diffuse += lightColor * max(dot(N, lightDir), 0.0);
    //diffuse +=  max(dot(N, lightDir), 0.0);
    // vec3 r = normalize(v_normal * (2.0 * dot(v_normal, lightDir)) - lightDir);
    vec3 r = (2.0 * dot(N, lightDir) * N - lightDir);
    specular += lightColor * pow(max(dot(r, viewDir), 0.0), u_shininess);
    
// In der Zeile 36 ist es dann auch wieder das gleiche Problem.
// Hier steht beschrieben, wie sich r berechnen lässt (Formel 5):
// https://lectures.hci.informatik.uni-wuerzburg.de/ss22/icg/05-03-light-propagation-add-on-deck.html#/reflection-geometry-model/2
// Schaut euch dann an, welche Vektoren miteinander verrechnet werden müssen und vergleicht dann, welche Vektoren ihr miteinander verrechnet.
// Da müsst ihr dann auch nur den Vektor in der Gleichung durch den richtigen Vektor austauschen.
// Davon abgesehen müsste die Berechnung sonst stimmen.
 

  }

  // Calculate the final color
  diffuse = u_kd * diffuse;
  specular = u_ks * specular;

  // Output the color
  gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}