import Node from "./node";
import Visitor from "../visitor";
import Vector from "../vector";


export default class TextureTextBoxNode extends Node {
    constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public id?: number, public normal?: string) {
        super();
    }

    accept(visitor: Visitor) {
        visitor.visitTextureTextBoxNode(this);
    }

    toJSON() {
        return {
            TextureTextBoxNode: {
                texture: this.texture,
                normal: this.normal,
            },
        };
    }
}