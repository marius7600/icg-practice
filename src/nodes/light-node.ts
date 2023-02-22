import Node from "./node";
import Vector from "../vector";
import Visitor from "../visitor";

/**
 * Class representing a Light in the Scenegraph
 * @extends Node
 * @param color {Vector} The colour of the light
 * @param position {Vector} The position of the light
 */
export default class LightNode extends Node {
  constructor(public color: Vector, public position: Vector) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitLightNode(this);
  }
}
