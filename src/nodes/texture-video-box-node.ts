import Node from "./node";
import Visitor from "../visitor";
import Vector from "../vector";


export default class TextureVideoBoxNode extends Node {
    constructor(public texture: string, public minPoint: Vector, public maxPoint: Vector, public normal?: string) {
        super();
    }

    accept(visitor: Visitor) {
        visitor.visitTextureVideoBoxNode(this);
    }

    toJSON() {
        return {
            TextureVideoBoxNode: {
                texture: this.texture,
                normal: this.normal,
            },
        };
    }
}