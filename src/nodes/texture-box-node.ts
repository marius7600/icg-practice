import Node from "./node";
import Visitor from "../visitor";
import Vector from "../math/vector";

/**
 * Class representing a Textured Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export default class TextureBoxNode extends Node {
  /**
   * Creates a new TextureBoxNode instance.
   * @param texture The image filename for the texture.
   * @param minPoint The minimum point of the box.
   * @param maxPoint The maximum point of the box.
   * @param normal The normal vector of the box (optional).
   */
  constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern.
   * @param visitor The visitor object.
   */
  accept(visitor: Visitor) {
    visitor.visitTextureBoxNode(this);
  }

  /**
   * Serializes the TextureBoxNode instance to JSON.
   * @returns The JSON representation of the TextureBoxNode.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["texture"] = this.texture;
    json["minPoint"] = this.minPoint;
    json["maxPoint"] = this.maxPoint;
    json["normal"] = this.normal;
    return json;
  }
}
