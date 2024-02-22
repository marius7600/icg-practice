import Node from "./node";
import Visitor from "../visitor";
import Vector from "../math/vector";


export default class TextureTextBoxNode extends Node {
    constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
        super();
    }

    accept(visitor: Visitor) {
        visitor.visitTextureTextBoxNode(this);
    }

    toJSON() {
        const json = super.toJSON();
        json["texture"] = this.texture;
        json["minPoint"] = this.minPoint;
        json["maxPoint"] = this.maxPoint;
        json["normal"] = this.normal;
        return json
    }
}