import Node from "./node";
import Vector from "../math/vector";
import Visitor from "../visitor";

/**
 * Represents a Sphere Node in the scene graph.
 * The sphere is defined around the origin with a specified radius.
 * @extends Node
 */
export default class SphereNode extends Node {
  /**
   * Creates a new SphereNode instance.
   * @param color The color of the SphereNode.
   * @param center The center position of the SphereNode.
   * @param radius The radius of the SphereNode.
   * @param texture The optional name of the texture of the SphereNode.
   */
  constructor(
    public color: Vector,
    public center: Vector,
    public radius: number,
    public texture?: string
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern.
   * @param visitor The visitor object.
   */
  accept(visitor: Visitor) {
    visitor.visitSphereNode(this);
  }

  /**
   * Converts the SphereNode instance to JSON format.
   * @returns The JSON representation of the SphereNode.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["color"] = this.color;
    json["center"] = this.center;
    json["radius"] = this.radius;
    json["texture"] = this.texture;
    return json;
  }
}
