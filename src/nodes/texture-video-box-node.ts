import Node from "./node";
import Visitor from "../visitor";
import Vector from "../math/vector";


/**
 * Represents a node that contains a texture video box.
 * @extends Node
 */
export default class TextureVideoBoxNode extends Node {
    /**
     * Creates a new instance of TextureVideoBoxNode.
     * @param texture The texture of the video box. Provide the video file path to be rendered (e.g. mp4).
     * @param minPoint The minimum point of the video box.
     * @param maxPoint The maximum point of the video box.
     * @param normal The normal of the video box (optional).
     */
    constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
        super();
    }

    /**
     * Accepts a visitor and calls the appropriate visit method.
     * @param visitor The visitor to accept.
     */
    accept(visitor: Visitor) {
        visitor.visitTextureVideoBoxNode(this);
    }

    /**
     * Converts the TextureVideoBoxNode to a JSON representation.
     * @returns The JSON representation of the TextureVideoBoxNode.
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