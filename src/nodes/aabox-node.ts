import Node from "./node";
import Vector from "../vector";
import Visitor from "../visitor";

/**
 * Class representing an Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export default class AABoxNode extends Node {
  minPoint: Vector; // The minimum point of the box
  maxPoint: Vector; // The maximum point of the box

  /**
   * Creates an axis aligned box.
   * The box's center is located at the origin
   * with all edges of length 1
   * @param color The colour of the cube
   */
  constructor(public dimensions: Vector, public color: Vector) {
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
    // TODO
    visitor.visitAABoxNode(this);
  }

  toString() {
    return `AABoxNode: ${this.color}`;
  }
}
