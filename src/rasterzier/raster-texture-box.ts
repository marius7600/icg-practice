import Vector from '../math/vector';
import Shader from '../shader/shader';
import SharedProps from '../boxSharedProperties';
/**
 * A class representing a axis aligned box with a texture
 */
export default class RasterTextureBox {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The buffer containing the box's texture
     */
    texBuffer: WebGLBuffer;
    /**
     * The buffer containing the box's texture coordinates
     */
    texCoords: WebGLBuffer;
    /**
     * The amount of faces
     */
    elements: number;

    /**
     * Creates all WebGL buffers for the textured box
     *     6 ------- 7
     *    / |       / |
     *   3 ------- 2  |
     *   |  |      |  |
     *   |  5 -----|- 4
     *   | /       | /
     *   0 ------- 1
     *  looking in negative z axis direction
     * @param gl The canvas' context
     * @param minPoint The minimal x,y,z of the box
     * @param maxPoint The maximal x,y,z of the box
     * @param texture The URL to the image to be used as texture
     */
    constructor(
        private gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        texture: string
    ) {
        const mi = minPoint;
        const ma = maxPoint;
        let vertices = SharedProps.calcVertices(mi, ma);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer = vertexBuffer;
        this.elements = vertices.length / 3;

        let cubeTexture = gl.createTexture();
        let cubeImage = new Image();
        cubeImage.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        cubeImage.src = texture;
        this.texBuffer = cubeTexture;

        let uv = SharedProps.getUVCords();
        let uvBuffer = this.gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv),
            gl.STATIC_DRAW);
        this.texCoords = uvBuffer;
    }

    /**
     * Renders the textured box
     * @param {Shader} shader - The shader used to render
     */
    render(shader: Shader) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = shader.getAttributeLocation("a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

        // Bind the texture coordinates in this.texCoords to their attribute in the shader

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoords);
        const texCoordLocation = shader.getAttributeLocation("a_texCoord");
        this.gl.enableVertexAttribArray(texCoordLocation);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texBuffer);
        shader.getUniformInt("sampler").set(0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

        this.gl.disableVertexAttribArray(positionLocation);
        this.gl.disableVertexAttribArray(texCoordLocation);
    }
}