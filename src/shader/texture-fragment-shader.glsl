precision mediump float;

uniform sampler2D sampler;
uniform sampler2D normSampler;

varying vec2 v_texCoord;
varying vec3 v_position;
varying vec3 v_normal;
// varying vec3 v_tangent;
// varying vec3 v_bitangent;

uniform float u_ka;
uniform float u_kd;
uniform float u_ks;
uniform float u_shininess;

vec3 ambientLight=vec3(0, 0, 0);
vec3 diffuseLight=vec3(0, 0, 0);
vec3 specularLight=vec3(0, 0, 0);

const vec3 lightColor=vec3(0.8, 0.8, 0.8);
const vec4 viewPosition=vec4(0, 0, 0, 1);

uniform vec3 LightPositions[8];
uniform int amtLights;

// quelle: https://learnopengl.com/Lighting/Basic-Lighting
void main(void) {
    vec4 texel = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
    vec3 texelColor = texel.xyz;

    vec4 normalTexture = texture2D(normSampler, vec2(v_texCoord.s, v_texCoord.t));

    // vec3 z_tangent =  normalize(v_tangent);
    // vec3 z_bitangent =  normalize(v_bitangent);
    vec3 z_normal = normalize(v_normal);

    // mat3 tangentBitangentNormal = mat3(
    // z_tangent.x, z_tangent.y, z_tangent.z,
    // z_bitangent.x, z_bitangent.y, z_bitangent.z,
    // z_normal.x, z_normal.y, z_normal.z
    // );

    //ambient
    ambientLight= texelColor * u_ka;


    // vec3 norm = normalize(tangentBitangentNormal*((normalTexture.xyz * 2.0) -1.0));
    // Calculate the normal without tangent bitangent normal matrix
    vec3 norm = normalize((normalTexture.xyz * 2.0) -1.0);

    for (int i=0; i<8; i++){
        if (i >= amtLights){ break; }

        //diffuse
        vec3 lightDir = normalize(LightPositions[i] - v_position);
        float diffuse = max(dot(lightDir, norm), 0.0);
        diffuseLight += diffuse * texelColor * u_kd;


        //specular
        //float shininess = u_shininess;
        vec3 viewDir = normalize((viewPosition.xyz - v_position));
        vec3 reflectDir = reflect(-lightDir, norm);
        float specular = pow(max(dot(viewDir, reflectDir), 0.0),  u_shininess);

        specularLight += specular * lightColor * u_ks;
    }
    //result
    gl_FragColor= vec4(ambientLight + diffuseLight +  specularLight, texel.a);


}
