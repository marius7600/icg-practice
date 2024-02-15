import Node from "./node";
import Visitor from "../visitor";
import Vector from "../vector";


export default class TextureVideoBoxNode extends Node {
    // TODO: video is mirrored
    constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
        super();
    }

    accept(visitor: Visitor) {
        visitor.visitTextureVideoBoxNode(this);
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