import Node from "./node";
import Visitor from "../visitor";
import Vector from "../vector";
import OBJLoader from "../OBJLoader";


export default class MeshNode extends Node {
    /**
      *
      * @param vertices Array of numbers that define the mesh-object
      * @param normals Array of numbers that contain information about the objects normals
      */
    constructor(
        public vertices: number[],
        public normals: number[],
        public color: Vector,
        public meshName: string,
        public maxPoint: Vector,
        public minPoint: Vector
    ) {
        super();
    }
    static async getNode(objName: string, color: Vector) {
        const obj = await OBJLoader.loadOBJ(objName)
        return new MeshNode(obj.vertices, obj.normals, color, objName, obj.maxPoint, obj.minPoint)
    }
    accept(visitor: Visitor): void {
        visitor.visitMeshNode(this);
    }
}