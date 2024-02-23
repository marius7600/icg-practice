import Node from "./node";
import Visitor from "../visitor";
import Vector from "../math/vector";


/**
 * Represents a axis-aligned box with a texture in the scene graph.
 * @extends Node
 */
export default class TextureTextBoxNode extends Node {
    /**
     * Creates a new TextureTextBoxNode instance.
     * @param texture - The texture of the node. The texture is text and displayed as unicode characters.
     * @param minPoint - The minimum point of the bounding box.
     * @param maxPoint - The maximum point of the bounding box.
     * @param normal - The normal of the node.
     */
    constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
        super();
    }

    /**
     * Accepts a visitor and calls the appropriate visit method.
     * @param visitor - The visitor to accept.
     */
    accept(visitor: Visitor) {
        visitor.visitTextureTextBoxNode(this);
    }

    /**
     * Converts the TextureTextBoxNode to a JSON object.
     * @returns The JSON representation of the TextureTextBoxNode.
     */
    toJSON() {
        const json = super.toJSON();
        json["texture"] = this.texture;
        json["minPoint"] = this.minPoint;
        json["maxPoint"] = this.maxPoint;
        json["normal"] = this.normal;
        return json;
    }
}