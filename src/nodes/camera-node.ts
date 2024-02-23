import Node from "./node";
import Vector from "../math/vector";
import Visitor from "../visitor";

/**
 * Class representing a camera node in the Scenegraph.
 * A camera node holds the position of the camera, the point the camera is looking at,
 * the up direction of the camera, the vertical field of view in degrees, the aspect ratio
 * of the camera's view, and the distance to the near and far clipping planes.
 * @extends Node
 */
export default class CameraNode extends Node {

  /**
   * Represents a camera node in a 3D scene.
   * @param eye - The position of the camera.
   * @param center - The point the camera is looking at.
   * @param up - The up direction of the camera.
   * @param fovy - The vertical field of view in degrees.
   * @param aspect - The aspect ratio of the camera's view.
   * @param near - The distance to the near clipping plane.
   * @param far - The distance to the far clipping plane.
   */
  constructor(
    public eye: Vector,
    public center: Vector,
    public up: Vector,
    public fovy: number,
    public aspect: number,
    public near: number,
    public far: number
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor
   */
  accept(visitor: Visitor) {
    visitor.visitCameraNode(this);
  }

  /**
   * Converts the CameraNode object to a JSON representation.
   * @returns The JSON representation of the CameraNode object.
   */
  toJSON() {
    const json = super.toJSON();
    json["eye"] = this.eye;
    json["center"] = this.center;
    json["up"] = this.up;
    json["fovy"] = this.fovy;
    json["aspect"] = this.aspect;
    json["near"] = this.near;
    json["far"] = this.far;
    return json;
  }
}
