import Vector from "./math/vector";
import Shader from "./shader/shader";

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

    createTextureBuffer(uvCoords: number[]) {
        return this.createArrayBuffer(uvCoords)
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

    /**
     * Binds a WebGL buffer and points it to the specified attribute in the shader.
     * 
     * @param buffer - The WebGL buffer to bind.
     * @param attributeName - The name of the attribute in the shader.
     * @param size - The number of components per attribute.
     * @param type - The data type of each component.
     * @param shader - The shader program.
     * @returns The attribute location in the shader.
     */
    bindAndPointToAttribute(buffer: WebGLBuffer, attributeName: string, size: number, type: number, shader: Shader) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        const location = shader.getAttributeLocation(attributeName);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, type, false, 0, 0);
        return location;
    }

    /**
     * Disables the vertex attribute at the specified location.
     * 
     * @param location - The location of the vertex attribute to disable.
     */
    disableAttribute(attributeLocation: number) {
        this.gl.disableVertexAttribArray(attributeLocation);
    }
};