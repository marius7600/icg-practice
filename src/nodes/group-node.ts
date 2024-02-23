import Node from "./node";
import { Transformation } from "../math/transformation";
import Visitor from "../visitor";
import CameraNode from "./camera-node";

/**
 * Class representing a GroupNode in the Scenegraph.
 * A GroupNode holds a transformation and is able
 * to have child nodes attached to it.
 * @extends Node
 */
export default class GroupNode extends Node {
  /**
   * The children of the group node
   */
  public children: Node[];

  /**
   * Constructor
   * @param transform The node's transformation
   */
  constructor(public transform: Transformation) {
    super();
    this.children = [];
    this.transform = transform;
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitGroupNode(this);
  }

  /**
   * Method to get the current transformation of the group node
   */
  getTransformation(): Transformation {
    return this.transform;
  }


  /**
   * Adds a child node
   * @param childNode The child node to add
   */
  add(childNode: Node) {
    this.children.push(childNode);
  }


  /**
   * Accepts a visitor that operates on GroupNodeCamera instances.
   * Is used to find the camera node in the group node.
   * @param visitor The visitor to accept.
   */
  acceptOnlyCamera(visitor: Visitor) {
    visitor.visitGroupNodeCamera(this);
  }

  /**
   * Removes a child node from the group node.
   * @param childNode - The child node to be removed.
   */
  remove(childNode: Node) {
    let indexOfchild = this.children.indexOf(childNode);
    this.children.splice(indexOfchild, 1);
  }

  /**
   * Checks if the group node contains a camera node.
   * @param cameraNode - The camera node to check for.
   * @returns True if the group node contains the camera node, false otherwise.
   */
  containsCamera(cameraNode: CameraNode) {
    return this.children.includes(cameraNode);
  }

  /**
   * Converts the GroupNode object to a JSON representation.
   * @returns The JSON representation of the GroupNode object.
   */
  toJSON() {
    const json = super.toJSON();
    json["childCodes"] = []
    json["transform"] = { type: this.transform.constructor.name, transformation: this.transform }
    json["name"] = this.name;
    return json
  }
}
