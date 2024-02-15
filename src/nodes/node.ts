import Visitor from "../visitor";

/**
 * Class representing a Node in a Scenegraph
 */
export default abstract class Node {
  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor - The visitor
   */
  abstract accept(visitor: Visitor): void

  toJSON(): any {
    return {
      classname: this.constructor.name
    }
  }
}


