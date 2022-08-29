import Vector from './vector';
import Intersection from './intersection';

/**
 * Calculate the colour of an object at the intersection point according to the Phong Lighting model.
 * @param color The colour of the intersected object
 * @param intersection The intersection information
 * @param lightPositions The light positions
 * @param shininess The shininess parameter of the Phong model
 * @param cameraPosition The position of the camera
 * @return The resulting colour
 */
export default function phong(
  color: Vector, intersection: Intersection,
  lightPositions: Array<Vector>, shininess: number,
  cameraPosition: Vector
): Vector {
  const lightColor = new Vector(0.8, 0.8, 0.8, 0);
  const kA = 0.8;
  const kD = 0.5;
  const kS = 0.5;

  const p = intersection.point;
  const n = intersection.normal;
  const v = cameraPosition.sub(p).normalize();

  var colorPhong = new Vector(0,0,0,0);

  //Ambient light
  colorPhong = colorPhong.add(ambientLightning(color,kA));

  //Diffuse Light
  colorPhong = diffuseLightning(lightPositions,kD,n,lightColor,p,colorPhong);
 
  //Specular Light
  colorPhong = specularLightning(lightPositions,kS,lightColor,colorPhong,v,p,n,shininess);
  return colorPhong;
}

//Calculate the ambient lightning
function ambientLightning(color:Vector, kA:number){
  return color.mul(kA);
}

//Calculate the diffuse lightning
function diffuseLightning(lightPositions: Array<Vector>, kD:number, n:Vector, lightColor:Vector, p:Vector, phongColor:Vector){
  let I_d;
  for(const lightPosition of lightPositions){
    const s = lightPosition.sub(p).normalize();
    const I_s = lightColor;
    I_d = I_s.mul(kD).mul(Math.max(((s.dot(n)) / s.length * n.length), 0));
    phongColor = phongColor.add(I_d);
  }
  return phongColor;
}

//Calculate the specular lightning
function specularLightning(lightPositions: Array<Vector>, kS:number,lightColor:Vector, phongColor:Vector, v:Vector, p:Vector, n:Vector,shininess:number){
  for(const lightPosition of lightPositions){
    const s = lightPosition.sub(p).normalize();
    const r = n.mul(2*n.dot(s)).sub(s);
    var I_s = lightColor.mul(kS).mul(Math.pow(Math.max((r.dot(v) / r.length * v.length), 0), shininess));
    phongColor = phongColor.add(I_s);
  }
  return phongColor;
}


