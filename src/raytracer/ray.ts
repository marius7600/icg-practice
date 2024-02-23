import CameraNode from "../nodes/camera-node";
import { Scenegraph } from "../scenegraph";
import Vector from "../math/vector";

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
   * Creates a ray from the given coordinates on the canvas.
   * @param x - The x-coordinate on the canvas.
   * @param y - The y-coordinate on the canvas.
   * @param canvasHeight - The height of the canvas.
   * @param canvasWidth - The width of the canvas.
   * @param camera - The camera node.
   * @returns A Ray object representing the ray from the camera to the specified coordinates.
   */
  static makeRay(
    x: number,
    y: number,
    canvasHeight: number,
    canvasWidth: number,
    camera: CameraNode
  ): Ray {
    // Get camera position matrix
    const cameraPos = Scenegraph.getGroupNodeCamera().getTransformation().getMatrix();

    // Convert matrix to vector to get the camera position (origin of the ray)
    const origin = cameraPos.mul(new Vector(0, 0, 0, 1));
    const alpha = (camera.fovy * Math.PI) / 180;

    // Calculate the direction of the ray
    const direction = new Vector(
      x - (canvasWidth - 1) / 2,
      (canvasHeight - 1) / 2 - y,
      -(canvasWidth / 2 / Math.tan(alpha / 2)),
      0
    );
    return new Ray(origin, direction.normalize());
  }
}
