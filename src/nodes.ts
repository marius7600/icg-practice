import Visitor from './visitor';
import Vector from './vector';
import { Transformation } from './transformation';

/**
 * Class representing a Node in a Scenegraph
 */
export class Node {
  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor - The visitor
   */
  accept(visitor: Visitor) { }
}

/**
 * Class representing a GroupNode in the Scenegraph.
 * A GroupNode holds a transformation and is able
 * to have child nodes attached to it.
 * @extends Node
 */
export class GroupNode extends Node {
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
}

/**
 * Class representing a Sphere in the Scenegraph
 * @extends Node
 */
export class SphereNode extends Node {

  /**
   * Creates a new Sphere.
   * The sphere is defined around the origin 
   * with radius 1.
   * @param color The colour of the Sphere
   */
  constructor(
    public color: Vector,
    public center: Vector,
    public radius: number,
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    // TODO
    visitor.visitSphereNode(this);
  }
}

/**
 * Class representing an Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class AABoxNode extends Node {

  /**
   * Creates an axis aligned box.
   * The box's center is located at the origin
   * with all edges of length 1
   * @param color The colour of the cube
   */
  constructor(public color: Vector) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param  {Visitor} visitor - The visitor
   */
  accept(visitor: Visitor) {
    // TODO
    visitor.visitAABoxNode(this);
  }
}

/**
 * Class representing a Textured Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class TextureBoxNode extends Node {
  /**
   * Creates an axis aligned box textured box
   * The box's center is located at the origin
   * with all edges of length 1
   * @param texture The image filename for the texture
   */
  constructor(public texture: string) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    // TODO
    visitor.visitTextureBoxNode(this);
  }
}

/**
 * Class representing a Light in the Scenegraph
 * @extends Node
 * @param color {Vector} The colour of the light
 * @param position {Vector} The position of the light
 */
export class LightNode extends Node {
  constructor(
    public color: Vector,
    public position: Vector
  ) {
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

export class CameraNode extends Node {
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
    public far: number) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor
   */

  accept(visitor: Visitor) {
      visitor.visitCameraNode(this)
  }
}