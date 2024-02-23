import Vector from "../math/vector";
import Intersection from "./intersection";
import PhongProperties from "../phong-properties";
import LightNode from "../nodes/light-node";

/**
 * Calculate the color of an object at the intersection point according to the Phong Lighting model.
 * @param objectColor The color of the intersected object
 * @param intersection The intersection information
 * @param lightNodes The light positions
 * @param shininess The shininess parameter of the Phong model
 * @param cameraPosition The position of the camera
 * @return The resulting color
 */
export default function phong(
  objectColor: Vector,
  intersection: Intersection,
  lightNodes: Array<LightNode>,
  cameraPosition: Vector,
  phongProperties: PhongProperties
): Vector {
  const normal = intersection.normal.normalize();
  const view = cameraPosition.sub(intersection.point).normalize();

  var colorPhong = new Vector(0, 0, 0, 0);

  //Ambient light
  colorPhong = colorPhong.add(
    ambientLightning(objectColor, phongProperties.ambient)
  );

  //Diffuse Light
  colorPhong = diffuseLightning(
    lightNodes,
    phongProperties.diffuse,
    normal,
    intersection.point,
    colorPhong
  );

  //Specular Light
  colorPhong = specularLightning(
    lightNodes,
    phongProperties.specular,
    colorPhong,
    view,
    intersection.point,
    normal,
    phongProperties.shininess
  );
  return colorPhong;
}


/**
 * Calculates the ambient lighting contribution for a given color.
 * 
 * @param color - The color to apply ambient lighting to.
 * @param kA - The ambient lighting coefficient.
 * @returns The color after applying ambient lighting.
 */
function ambientLightning(color: Vector, kA: number) {
  return color.mul(kA);
}


/**
 * Calculates the diffuse lighting contribution for a given point on a surface.
 * 
 * @param lightNodes - An array of light sources.
 * @param kD - The diffuse reflection coefficient.
 * @param n - The surface normal vector at the point.
 * @param p - The position vector of the point.
 * @param phongColor - The accumulated Phong color.
 * @returns The updated Phong color after adding the diffuse lighting contribution.
 */
function diffuseLightning(
  lightNodes: Array<LightNode>,
  kD: number,
  n: Vector,
  p: Vector,
  phongColor: Vector
) {
  let I_d; // Initialize the variable for the diffuse intensity

  // Loop over each light source
  for (const lightNode of lightNodes) {
    // Calculate the direction vector from the point to the light source and normalize it
    const s = lightNode.position.sub(p).normalize();

    // Get the color of the light source
    const I_s = lightNode.color;

    // Calculate the diffuse reflection intensity
    // It's the product of the light color, the diffuse reflection coefficient, and the dot product of the direction and normal vectors
    // The dot product is divided by the length of the direction vector and multiplied by the length of the normal vector
    // If the result is negative, it's clamped to 0
    I_d = I_s.mul(kD).mul(Math.max((s.dot(n) / s.length) * n.length, 0));

    // Add the diffuse reflection intensity to the accumulated Phong color
    phongColor = phongColor.add(I_d);
  }

  // Return the updated Phong color
  return phongColor;
}


/**
 * Calculates the specular lighting contribution for a given set of light sources.
 * 
 * @param lightNodes - An array of light sources.
 * @param kS - The specular reflection coefficient.
 * @param phongColor - The current color of the object.
 * @param view - The direction of the viewer.
 * @param position - The position of the point being shaded.
 * @param normal - The surface normal at the shaded point.
 * @param shininess - The shininess exponent.
 * @returns The updated phongColor after adding the specular lighting contribution.
 */
function specularLightning(
  lightNodes: Array<LightNode>,
  kS: number,
  phongColor: Vector,
  view: Vector,
  position: Vector,
  normal: Vector,
  shininess: number
) {
  // Iterate over each light source in the scene
  for (const lightNode of lightNodes) {

    // Calculate the vector from the surface point to the light source
    const s = lightNode.position.sub(position);

    // Calculate the reflection vector. This is the direction that a perfectly reflected ray of light would take from the surface point
    const r = normal.mul(2 * normal.dot(s)).sub(s);

    // Calculate the intensity of the specular reflection.
    var I_s = lightNode.color
      .mul(kS)
      .mul(
        Math.pow(Math.max((r.dot(view) / r.length) * view.length, 0), shininess)
      );

    // Add the intensity of the specular reflection
    phongColor = phongColor.add(I_s);
  }

  // Return the total Phong color
  return phongColor;
}
