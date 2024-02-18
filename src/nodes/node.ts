import Visitor from "../visitor";

/**
 * Class representing a Node in a Scenegraph
 */
export default abstract class Node {
  // optional name for the node
  name: string | null = null
  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor - The visitor
   */
  abstract accept(visitor: Visitor): void

  toJSON(): any {
    if (this.name) {
      return {
        name: this.name,
        classname: this.constructor.name,
      }
    }
    return {
      classname: this.constructor.name,
    }
  }
}


