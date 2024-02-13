import Node from "./node";
import Vector from "../vector";
import Visitor from "../visitor";

export default class CameraNode extends Node {
  /**
   * Creates a new Camera
   * @param eye {Vector} - eye-Vector of camera
   * @param center {Vector} - center Vector of camera
   * @param up {Vector} - up Vector of camera
   * @param fovy - field of view
   * @param aspect - aspect ratio
   * @param near - nearPlane
   * @param far - farPlane
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

  toJSON() {
    return {
      CameraNode: {},
    };
  }
}
