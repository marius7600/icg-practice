import Vector from "./math/vector";
import Shader from "./shader/shader";

/**
 * Utility class for WebGL operations.
 */
export default class GlUtils {
    constructor(private gl: WebGL2RenderingContext) {
    }

    /**
     * Creates a vertex buffer and returns the WebGL buffer object.
     * 
     * @param vertices - The array of vertex data.
     * @returns The WebGL buffer object.
     */
    createVertexBuffer(vertices: number[]) {
        return this.createArrayBuffer(vertices)
    }

    /**
     * Creates a normal buffer and returns the WebGL buffer object.
     * 
     * @param normals - The array of normal data.
     * @returns The WebGL buffer object.
     */
    createNormalBuffer(normals: number[]) {
        return this.createArrayBuffer(normals)
    }

    /**
     * Creates a color buffer and returns the WebGL buffer object.
     * 
     * @param colors - The array of color data.
     * @returns The WebGL buffer object.
     */
    createColorBuffer(colors: number[]) {
        return this.createArrayBuffer(colors)
    }

    /**
     * Creates a texture buffer and returns the WebGL buffer object.
     * 
     * @param uvCoords - The array of texture coordinate data.
     * @returns The WebGL buffer object.
     */
    createTextureBuffer(uvCoords: number[]) {
        return this.createArrayBuffer(uvCoords)
    }

    /**
     * Creates an array buffer and returns the WebGL buffer object.
     * 
     * @param nrs - The array of data.
     * @returns The WebGL buffer object.
     */
    createArrayBuffer(nrs: number[]) {

        const arrayBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, arrayBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(nrs), this.gl.STATIC_DRAW);
        return arrayBuffer;
    }

    /**
     * Generates an array of colors based on the specified color and number of elements.
     * 
     * @param color - The color vector.
     * @param elements - The number of elements.
     * @returns The array of colors.
     */
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
     * @param attributeLocation - The location of the vertex attribute to disable.
     */
    disableAttribute(attributeLocation: number) {
        this.gl.disableVertexAttribArray(attributeLocation);
    }
};