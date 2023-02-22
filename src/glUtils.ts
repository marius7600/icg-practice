import Vector from "./vector";

export default class GlUtils {
    constructor(private gl: WebGL2RenderingContext) {
    }

    createVertexBuffer(vertices: number[]) {
        return this.createArrayBuffer(vertices)
    }

    createNormalBuffer(normals: number[]) {
        return this.createArrayBuffer(normals)
    }

    createColorBuffer(colors: number[]) {
        return this.createArrayBuffer(colors)
    }

    createArrayBuffer(nrs: number[]) {

        const arrayBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, arrayBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(nrs), this.gl.STATIC_DRAW);
        return arrayBuffer;
    }

    getColorsArray(color: Vector, elements: number) {
        const colors = []
        for (let i = 0; i < elements; i++) {
            colors.push(...[color.x, color.y, color.z])
        }
        return colors
    }
};