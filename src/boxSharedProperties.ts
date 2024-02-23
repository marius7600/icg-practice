import Vector from "./math/vector";

export default class BoxSharedProperties {
    /**
     * Calculates the vertices of a box given the minimum and maximum coordinates.
     * 
     * @param mi - The minimum coordinates of the box.
     * @param ma - The maximum coordinates of the box.
     * @returns An array of vertices representing the box.
     */
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

    /**
     * Calculates the vertex vectors of a box given the minimum and maximum coordinates.
     * @param mi The minimum coordinates of the box.
     * @param ma The maximum coordinates of the box.
     * @returns The vertex vectors of the box.
     */
    static calcVertexVecs(mi: Vector, ma: Vector) {
        const vertexCoords = this.calcVertices(mi, ma);
        return this.tripletArrayToVec(vertexCoords)
    }

    /**
     * Returns an array of normals for the box faces.
     * The normals are represented as a flat array of numbers.
     * Each set of three numbers represents the x, y, and z components of a normal vector.
     * The order of the normals in the array is as follows:
     * - Front face: [0.0, 0.0, 1.0]
     * - Back face: [0.0, 0.0, -1.0]
     * - Right face: [1.0, 0.0, 0.0]
     * - Top face: [0.0, 1.0, 0.0]
     * - Left face: [-1.0, 0.0, 0.0]
     * - Bottom face: [0.0, -1.0, 0.0]
     * 
     * @returns {number[]} The array of normals.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL
     */
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

    /**
     * Returns an array of normal vectors.
     * 
     * @returns An array of normal vectors.
     */
    static getNormalVecs() {
        return this.tripletArrayToVec(
            this.getNormals()
        )
    }


    /**
     * Returns the UV coordinates for the box faces.
     * The UV coordinates are arranged in the following order: front, back, right, top, left, bottom.
     * Each face has 6 UV coordinates, representing the texture mapping for the vertices of the face.
     * @returns An array of UV coordinates.
     */
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

    /**
     * Converts an array of numbers representing triplets into an array of Vector objects.
     * Each triplet in the array represents the x, y, and z coordinates of a vector.
     * @param nrs - The array of numbers representing triplets.
     * @returns An array of Vector objects.
     */
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
