import Node from "./node";
import Vector from "../math/vector";
import Visitor from "../visitor";

/**
 * Represents a PyramidNode, a type of Node that represents a pyramid shape.
 * @extends Node
 */
export default class PyramidNode extends Node {
  /**
   * The minimum point of the pyramid's boundings.
   */
  minPoint: Vector;

  /**
   * The maximum point of the pyramid's boundings.
   */
  maxPoint: Vector;

  /**
   * Creates a PyramidNode instance.
   * The pyramid's center is located at the origin with all edges of length 1.
   * @param dimensions The dimensions of the pyramid.
   * @param color The color of the pyramid.
   * @param texture The texture of the pyramid (optional).
   */
  constructor(public dimensions: Vector, public color: Vector, public texture?: string) {
    super();
    this.maxPoint = dimensions.div(2);
    this.maxPoint.w = 1;
    this.minPoint = this.maxPoint.mul(-1);
    this.minPoint.w = 1;
  }

  /**
   * Accepts a visitor and calls the visitor's visitPyramidNode method.
   * @param visitor The visitor to accept.
   */
  accept(visitor: Visitor) {
    visitor.visitPyramidNode(this);
  }

  /**
   * Converts the PyramidNode instance to a JSON object.
   * @returns The JSON representation of the PyramidNode.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["minPoint"] = this.minPoint;
    json["maxPoint"] = this.maxPoint;
    json["color"] = this.color;
    json["texture"] = this.texture;
    return json;
  }
}
