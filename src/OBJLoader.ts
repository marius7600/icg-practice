import Vector from "./math/vector";

/**
 * A class for loading OBJ files.
 * @see https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
 */
export default class OBJLoader {
    static vertices: number[][]
    static objTexCoords: number[][]
    static objNormals: number[][]
    static objVertexData: number[][][]
    static webglVertexData: number[][]
    static maxPoint: Vector
    static minPoint: Vector
    /**
     * Represents the keyword handlers for parsing OBJ file.
     */
    static keywords = {
        /**
         * Handles the 'v' keyword for parsing vertex coordinates.
         * @param parts - The array of string parts representing the vertex coordinates.
         */
        v(parts: string[]) {
            const numbers = parts.map(parseFloat);
            const x = numbers[0]
            const y = numbers[1]
            const z = numbers[2]
            if (x > OBJLoader.maxPoint.x) OBJLoader.maxPoint.x = x
            if (y > OBJLoader.maxPoint.y) OBJLoader.maxPoint.y = y
            if (z > OBJLoader.maxPoint.z) OBJLoader.maxPoint.z = z
            if (x < OBJLoader.minPoint.x) OBJLoader.minPoint.x = x
            if (y < OBJLoader.minPoint.y) OBJLoader.minPoint.y = y
            if (z < OBJLoader.minPoint.z) OBJLoader.minPoint.z = z
            OBJLoader.vertices.push(parts.map(parseFloat))
        },
        /**
         * Handles the 'f' keyword for parsing face indices.
         * @param parts - The array of string parts representing the face indices.
         */
        f(parts: string[]) {
            const numTriangles = parts.length - 2
            for (let tri = 0; tri < numTriangles; tri++) {
                OBJLoader.addVertex(parts[0])
                OBJLoader.addVertex(parts[tri + 1])
                OBJLoader.addVertex(parts[tri + 2])
            }
        },
        /**
         * Handles the 'vn' keyword for parsing vertex normals.
         * @param parts - The array of string parts representing the vertex normals.
         */
        vn(parts: string[]) {
            OBJLoader.objNormals.push(parts.map(parseFloat))
        },
        /**
         * Handles the 'vt' keyword for parsing texture coordinates.
         * @param parts - The array of string parts representing the texture coordinates.
         */
        vt(parts: string[]) {
            OBJLoader.objTexCoords.push(parts.map(parseFloat))
        }
    }


    /**
     * Adds a vertex to the OBJLoader.
     * 
     * @param vert - The vertex string to add.
     */
    static addVertex(vert: string) {
        const point = vert.split("/"); //split entry into vertexIDX, uvIDX and normalIDX
        point.forEach((objIdxStr, i) => {
            if (!objIdxStr) { //if string empty
                return
            }
            const objIDX = parseInt(objIdxStr);
            const index = objIDX + (objIDX >= 0 ? 0 : this.objVertexData[i].length) //if idx < 0 use length as idx
            this.webglVertexData[i].push(...this.objVertexData[i][index])
        })
    }


    /**
     * Loads an OBJ file asynchronously.
     * 
     * @param filename - The path to the OBJ file.
     * @returns An object containing the loaded vertex, texture coordinate, and normal data, as well as the maximum and minimum points.
     */
    static async loadOBJ(filename: string) {
        //ensure that all arrays are empty
        this.vertices = [[0, 0, 0]]
        this.objTexCoords = [[0, 0]]
        this.objNormals = [[0, 0, 0]]
        this.objVertexData = [this.vertices, this.objTexCoords, this.objNormals]
        this.webglVertexData = [[], [], []]
        this.minPoint = new Vector(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, 1)
        this.maxPoint = new Vector(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE, 1)

        const res = await fetch(filename)
        const text = await res.text()
        const lines = text.split("\n")

        for (let line of lines) {
            line = line.trim()
            if (line === "" || line.startsWith("#")) { //skip empty lines or lines with comments
                continue
            }
            const [keyword, ...parts] = line.split(" ") //get keyword and data
            // @ts-ignore
            const handler = this.keywords[keyword] // get the function that matches the keyword
            if (!handler) {
                console.warn("no handler for keyword", keyword)
                continue
            }
            handler(parts)
        }
        console.log(this.minPoint)
        return {
            vertices: this.webglVertexData[0],
            uvCoords: this.webglVertexData[1],
            normals: this.webglVertexData[2],
            maxPoint: this.maxPoint,
            minPoint: this.minPoint
        }
    }
};