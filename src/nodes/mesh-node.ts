import Node from "./node";
import Visitor from "../visitor";
import Vector from "../math/vector";
import OBJLoader from "../OBJLoader";


/**
 * Represents a mesh node in a 3D scene.
 */
export default class MeshNode extends Node {

    /**
     * Creates a new MeshNode instance.
     * @param vertices - The array of vertex coordinates.
     * @param normals - The array of normal vectors.
     * @param color - The color of the mesh.
     * @param meshName - The name of the meshes OBJ file.
     * @param maxPoint - The maximum point of the mesh bounding box.
     * @param minPoint - The minimum point of the mesh bounding box.
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

    /**
     * Retrieves a MeshNode instance from an OBJ file.
     * @param objName - The name of the OBJ file.
     * @param color - The color of the mesh.
     * @returns A promise that resolves to a MeshNode instance.
     */
    static async getNode(objName: string, color: Vector) {
        const obj = await OBJLoader.loadOBJ(objName);
        return new MeshNode(obj.vertices, obj.normals, color, objName, obj.maxPoint, obj.minPoint)
    }

    /**
     * Accepts a visitor and calls the corresponding visit method.
     * @param visitor - The visitor object.
     */
    accept(visitor: Visitor): void {
        visitor.visitMeshNode(this);
    }

    /**
     * Converts the MeshNode instance to a JSON object.
     * @returns The JSON representation of the MeshNode instance.
     */
    toJSON(): any {
        const json = super.toJSON();
        json["vertices"] = this.vertices;
        json["normals"] = this.normals;
        json["color"] = this.color.toJSON();
        json["meshName"] = this.meshName;
        json["maxPoint"] = this.maxPoint.toJSON();
        json["minPoint"] = this.minPoint.toJSON();
        json["name"] = this.name;
        return json;
    };
}