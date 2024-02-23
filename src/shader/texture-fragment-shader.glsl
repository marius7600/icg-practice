precision mediump float;

uniform sampler2D sampler;
uniform sampler2D normSampler;

varying vec2 v_texCoord;
varying vec3 v_position;
varying vec3 v_normal;

uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_shininess;

const vec3 lightColor=vec3(0.8, 0.8, 0.8);
const vec4 viewPosition=vec4(0, 0, 0, 1);

varying vec3 v_light_positions[8];
varying vec3 v_light_colors[8];
uniform int u_number_of_lights;
uniform int amtLights;

// quelle: https://learnopengl.com/Lighting/Basic-Lighting
void main(void) {
    vec4 texel = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
    vec3 texelColor = texel.xyz;

    vec4 normalTexture = texture2D(normSampler, vec2(v_texCoord.s, v_texCoord.t));

    vec3 z_normal = normalize(v_normal);


    vec3 norm = normalize((normalTexture.xyz * 2.0) -1.0);

     // Calculate the ambient contribution
    vec3 ambient = texelColor * u_ka;


    // Create variable to hold diffuse & specular contribution
    vec3 diffuse;
    vec3 specular;

        // Calculate the diffuse & specular contribution for each light source
    for (int i = 0; i < 8; i++){
    if (i >= int(u_number_of_lights)) {
        break;
    }

    vec3 lightDir = normalize(v_light_positions[i] - v_position);
    
    // Use norm instead of v_normal
    vec3 N = normalize(norm);

    // Get the camera to calculate the view direction
    vec3 camPos = vec3(0.0, 0.0, 0.0);
    vec3 viewDir = normalize(camPos - v_position);

    // Apply the light color 
    vec3 lightColor = v_light_colors[i];
    diffuse += lightColor * max(dot(N, lightDir), 0.0) * texelColor;

    vec3 r = (2.0 * dot(N, lightDir) * N - lightDir);
    specular += lightColor * pow(max(dot(r, viewDir), 0.0), u_shininess);
    }

    // Calculate the final color
    diffuse = u_kd * diffuse;
    specular = u_ks * specular;
    vec4 result = vec4(ambient + diffuse + specular, texel.a);
        // Output the color
    gl_FragColor = vec4(result);


}
