import Vector from '../vector';

/**
 * Class representing a ray
 */
export default class Ray {
  /**
   * Creates a new ray with origin and direction
   * @param origin The origin of the Ray
   * @param direction The direction of the Ray
   */
  constructor(public origin: Vector, public direction: Vector) { }

  /**
   * Creates a ray from the camera through the image plane.
   * @param x The pixel's x-position in the canvas
   * @param y The pixel's y-position in the canvas
   * @param camera The Camera
   * @return The resulting Ray
   */
  static makeRay(x: number, y: number, canvasHeight: number, canvasWidth: number,
    camera: { eye: Vector, center: Vector, up: Vector, fovy: number, aspect: number, near: number }): Ray {
    // const origin = new Vector(0, 0, 0, 1);
    // const direction = new Vector(x - ((camera.width - 1) / 2), ((camera.height - 1) / 2) - y, -((camera.width / 2) / (Math.tan(camera.alpha / 2))), 0);
    // return new Ray(origin, direction);
    const fov = camera.fovy * Math.PI / 180;
    const view = camera.center.sub(camera.eye).normalize();
    const direction = camera.up.cross(view);
    const width = ((x / (canvasWidth - 1)) * 2 - 1) * camera.near * Math.tan(fov) * camera.aspect;
    const height = ((y / (canvasHeight - 1)) * 2 - 1) * camera.near * Math.tan(fov);
    const dir = view.mul(camera.near).add(direction.mul(width)).add(camera.up.mul(height));

    return new Ray(camera.eye, dir.normalize())
  }
}