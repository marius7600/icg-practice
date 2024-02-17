import Node from "./node";
import { Transformation } from "../transformation";
import Visitor from "../visitor";
import CameraNode from "./camera-node";

/**
 * Class representing a GroupNode in the Scenegraph.
 * A GroupNode holds a transformation and is able
 * to have child nodes attached to it.
 * @extends Node
 */
export default class GroupNode extends Node {
  // TODO declare instance variables
  public children: Node[];

  /**
   * Constructor
   * @param transform The node's transformation
   */
  constructor(public transform: Transformation) {
    super();
    // TODO
    this.children = [];
    this.transform = transform;
  }

  /**
   * Method to get the current transformation of the group node
   */
  getTransformation(): Transformation {

    return this.transform;
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    // TODO
    visitor.visitGroupNode(this);
  }

  /**
   * Adds a child node
   * @param childNode The child node to add
   */
  add(childNode: Node) {
    // TODO
    this.children.push(childNode);
  }

  //Für camera traversal
  acceptOnlyCamera(visitor: Visitor) {
    visitor.visitGroupNodeCamera(this);
  }

  remove(childNode: Node) {
    let indexOfchild = this.children.indexOf(childNode);
    this.children.splice(indexOfchild, 1);
  }

  containsCamera(cameraNode: CameraNode) {
    return !!this.children.includes(cameraNode);
  }

  toJSON() {
    const json = super.toJSON();
    json["childCodes"] = []
    json["transform"] = { type: this.transform.constructor.name, transformation: this.transform }
    return json
  }
}
