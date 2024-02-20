import Vector from "./vector";

export default class BoxSharedProperties {
    static calcVertices(mi: Vector, ma: Vector) {
        return [
            // front
            mi.x, mi.y, ma.z,
            ma.x, mi.y, ma.z,
            ma.x, ma.y, ma.z,
            ma.x, ma.y, ma.z,
            mi.x, ma.y, ma.z,
            mi.x, mi.y, ma.z,
            // back
            ma.x, mi.y, mi.z,
            mi.x, mi.y, mi.z,
            mi.x, ma.y, mi.z,
            mi.x, ma.y, mi.z,
            ma.x, ma.y, mi.z,
            ma.x, mi.y, mi.z,
            // right
            ma.x, mi.y, ma.z,
            ma.x, mi.y, mi.z,
            ma.x, ma.y, mi.z,
            ma.x, ma.y, mi.z,
            ma.x, ma.y, ma.z,
            ma.x, mi.y, ma.z,
            // top
            mi.x, ma.y, ma.z,
            ma.x, ma.y, ma.z,
            ma.x, ma.y, mi.z,
            ma.x, ma.y, mi.z,
            mi.x, ma.y, mi.z,
            mi.x, ma.y, ma.z,
            // left
            mi.x, mi.y, mi.z,
            mi.x, mi.y, ma.z,
            mi.x, ma.y, ma.z,
            mi.x, ma.y, ma.z,
            mi.x, ma.y, mi.z,
            mi.x, mi.y, mi.z,
            // bottom
            mi.x, mi.y, mi.z,
            ma.x, mi.y, mi.z,
            ma.x, mi.y, ma.z,
            ma.x, mi.y, ma.z,
            mi.x, mi.y, ma.z,
            mi.x, mi.y, mi.z
        ];
    }

    static calcVertexVecs(mi: Vector, ma: Vector) {
        const vertexCoords = this.calcVertices(mi, ma);
        return this.tripletArrayToVec(vertexCoords)
    }

    //source: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL
    static getNormals() {
        return [
            // Front
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            // Back
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            // Right
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            // Top
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Left
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,

            // Bottom
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0


        ]
    }

    static getNormalVecs() {
        return this.tripletArrayToVec(
            this.getNormals()
        )
    }


    static getUVCords() {

        return [
            // front
            0, 1, 1, 1, 1, 0,
            1, 0, 0, 0, 0, 1,
            //back
            0, 1, 1, 1, 1, 0,
            1, 0, 0, 0, 0, 1,
            //right
            0, 1, 1, 1, 1, 0,
            1, 0, 0, 0, 0, 1,
            //top
            0, 1, 1, 1, 1, 0,
            1, 0, 0, 0, 0, 1,
            //left
            0, 1, 1, 1, 1, 0,
            1, 0, 0, 0, 0, 1,
            //bottom
            0, 1, 1, 1, 1, 0,
            1, 0, 0, 0, 0, 1,
        ];
    }

    static getUVVecs() {
        const uvCords = this.getUVCords();
        const uvVecs: Vec2[] = []
        for (let i = 0; i < uvCords.length; i += 2) {
            const x = uvCords[i]
            const y = uvCords[i + 1]
            const vec2 = new Vec2(x, y);
            uvVecs.push(vec2)

        }
        return uvVecs
    }

    static generateTangentsBitangents(vertices: Vector[]) {
        const tangents: Vector[] = []
        const bitangents: Vector[] = []
        const texCords = this.getUVVecs()
        for (let i = 0; i < vertices.length; i += 3) {
            const point0 = vertices[i]
            const point1 = vertices[i + 1]
            const point2 = vertices[i + 2]

            const uv0 = texCords[i]
            const uv1 = texCords[i + 1]
            const uv2 = texCords[i + 2]

            const edge1 = point1.sub(point0)
            const edge2 = point2.sub(point0)

            const deltaUV1 = uv1.sub(uv0)
            const deltaUV2 = uv2.sub(uv0)

            const r = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x)

            const tangent = (edge1.mul(deltaUV2.y).sub(edge2.mul(deltaUV1.y))).mul(r)
            const bitangent = (edge2.mul(deltaUV1.x).sub(edge1.mul(deltaUV2.x))).mul(r).mul(-1)
            tangents.push(tangent, tangent, tangent)
            bitangents.push(bitangent, bitangent, bitangent)
        }

        return {
            tangents,
            bitangents
        }

    }

    static vecsToNumbersArray(vec: Vector[]) {
        const nrs: number[] = []
        for (let vector of vec) {
            nrs.push(vector.x, vector.y, vector.z)
        }
        return nrs
    }

    static numbersToVecsArray(nrs: number[]) {
        const vecs = []
        for (let i = 0; i < nrs.length; i += 3) {
            const x = nrs[i]
            const y = nrs[i + 1]
            const z = nrs[i + 2]
            vecs.push(new Vector(x, y, z, 1))
        }
        return vecs
    }

    private static tripletArrayToVec(nrs: number[]) {

        const vectors = []
        for (let i = 0; i < nrs.length; i += 3) {

            const x = nrs[i]
            const y = nrs[i + 1]
            const z = nrs[i + 2]
            const vector = new Vector(x, y, z, 1.0);
            vectors.push(vector)
        }
        return vectors
    }
};

class Vec2 {
    constructor(public x: number, public y: number) {
    }

    add(other: Vec2) {
        const newX = this.x + other.x;
        const newY = this.y + other.y;
        return new Vec2(newX, newY)
    }

    sub(other: Vec2) {
        const newX = this.x - other.x;
        const newY = this.y - other.y;
        return new Vec2(newX, newY)
    }
}