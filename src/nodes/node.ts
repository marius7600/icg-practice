import Visitor from "../visitor";

/**
 * Abstract class representing a Node in a Scenegraph
 */
export default abstract class Node {
  // optional name for the node
  name: string | null = null
  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor - The visitor
   */
  abstract accept(visitor: Visitor): void

  /**
   * Converts the Node object to a JSON representation.
   * @returns The JSON representation of the Node object.
   */
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


