import Vector from '../vector';
import Intersection from '../intersection';
import PhongProperties from '../phong-properties';
import { LightNode } from '../nodes';

/**
 * Calculate the colour of an object at the intersection point according to the Phong Lighting model.
 * @param objectColor The colour of the intersected object
 * @param intersection The intersection information
 * @param lightNodes The light positions
 * @param shininess The shininess parameter of the Phong model
 * @param cameraPosition The position of the camera
 * @return The resulting colour
 */
export default function phong(
  objectColor: Vector, intersection: Intersection,
  lightNodes: Array<LightNode>,
  cameraPosition: Vector, phongProperties: PhongProperties
): Vector {
  // const lightColor = new Vector(0.8, 0.8, 0.8, 0);
  // const kA = 0.8;
  // const kD = 0.5;
  // const kS = 0.5;

  // const p = intersection.point;
  const normal = intersection.normal.normalize();
  const view = cameraPosition.sub(intersection.point).normalize();

  var colorPhong = new Vector(0,0,0,0);

  //Ambient light
  colorPhong = colorPhong.add(ambientLightning(objectColor, phongProperties.ambient));

  //Diffuse Light
  colorPhong = diffuseLightning(lightNodes, phongProperties.diffuse, normal, intersection.point, colorPhong);
 
  //Specular Light
  colorPhong = specularLightning(lightNodes, phongProperties.specular, colorPhong, view, intersection.point, normal, phongProperties.shininess);
  return colorPhong;
}

//Calculate the ambient lightning
function ambientLightning(color:Vector, kA:number){
  return color.mul(kA);
}

//Calculate the diffuse lightning
// function diffuseLightning(lightNodes: Array<LightNode>, kD:number, n:Vector, lightColor:Vector, p:Vector, phongColor:Vector){
  function diffuseLightning(lightNodes: Array<LightNode>, kD:number, n:Vector, p:Vector, phongColor:Vector){
  let I_d;
  for(const lightNode of lightNodes){
    const s = lightNode.position.sub(p).normalize();
    const I_s = lightNode.color;
    I_d = I_s.mul(kD).mul(Math.max(((s.dot(n)) / s.length * n.length), 0));
    phongColor = phongColor.add(I_d);
  }
  return phongColor;
}

//Calculate the specular lightning
// function specularLightning(lightNodes: Array<LightNode>, kS:number,lightColor:Vector, phongColor:Vector, v:Vector, p:Vector, n:Vector,shininess:number){
  function specularLightning(lightNodes: Array<LightNode>, kS:number, phongColor:Vector, view:Vector, position:Vector, normal:Vector,shininess:number){
  for(const lightNode of lightNodes){
    const s = lightNode.position.sub(position).normalize();
    // const s = lightPosition.position;
    const r = normal.mul(2*normal.dot(s)).sub(s);
    var I_s = lightNode.color.mul(kS).mul(Math.pow(Math.max((r.dot(view) / r.length * view.length), 0), shininess));
    phongColor = phongColor.add(I_s);
  }
  return phongColor;
}


