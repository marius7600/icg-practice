import Node from "./node";
import Visitor from "../visitor";
import Vector from "../vector";

/**
 * Class representing a Textured Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export default class TextureBoxNode extends Node {
  /**
   * Creates an axis aligned box textured box
   * The box's center is located at the origin
   * with all edges of length 1
   * @param texture The image filename for the texture
   */
  constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
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

  toJSON(): any {
    const json = super.toJSON();
    json["texture"] = this.texture;
    json["minPoint"] = this.minPoint;
    json["maxPoint"] = this.maxPoint;
    json["normal"] = this.normal;
    return json;

  }
}
