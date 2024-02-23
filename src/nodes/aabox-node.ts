import Node from "./node";
import Vector from "../math/vector";
import Visitor from "../visitor";

/**
 * Class representing an Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export default class AABoxNode extends Node {
  minPoint: Vector; // The minimum point of the box
  maxPoint: Vector; // The maximum point of the box


  /**
   * Creates a new AABoxNode instance.
   * @param dimensions - The dimensions of the AABoxNode.
   * @param color - The color of the AABoxNode.
   * @param texture - The texture of the AABoxNode (optional).
   */
  constructor(public dimensions: Vector, public color: Vector, public texture?: string) {
    super();
    this.maxPoint = dimensions.div(2);
    this.maxPoint.w = 1;
    this.minPoint = this.maxPoint.mul(-1);
    this.minPoint.w = 1;
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param  {Visitor} visitor - The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitAABoxNode(this);
  }


  /**
   * Converts the AABoxNode object to a JSON representation.
   * @returns The JSON representation of the AABoxNode object.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["minPoint"] = this.minPoint;
    json["maxPoint"] = this.maxPoint;
    json["color"] = this.color;
    json["texture"] = this.texture;
    return json;
  };
}