import Node from "./node";
import Vector from "../math/vector";
import Visitor from "../visitor";

export default class PyramidNode extends Node {
  minPoint: Vector;
  maxPoint: Vector;
  /**
   * Creates a Pyramid.
   * The Pyramids center is located at the origin
   * with all edges of length 1
   * @param dimensions
   * @param color The colour of the Pyramid
   */
  constructor(public dimensions: Vector, public color: Vector, public texture?: string) {
    super();
    this.maxPoint = dimensions.div(2);
    this.maxPoint.w = 1;
    this.minPoint = this.maxPoint.mul(-1);
    this.minPoint.w = 1;
  }

  accept(visitor: Visitor) {
    visitor.visitPyramidNode(this);
  }

  toJSON(): any {
    const json = super.toJSON();
    json["minPoint"] = this.minPoint;
    json["maxPoint"] = this.maxPoint;
    json["color"] = this.color;
    json["texture"] = this.texture;
    return json;
  }
}
