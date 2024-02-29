import Vector from '../math/vector';
import Shader from '../shader/shader';
import SharedProps from '../boxSharedProperties';
import GlUtils from "../glUtils";

/**
 * A class representing an axis-aligned box to render it with WebGL.
 * The box can be textured or coloured.
 */
export default class RasterBox {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;
    /**
     * The buffer containing the box's colors
     */
    colorBuffer: WebGLBuffer;
    /**
     * The buffer containing the box's normals
     */
    normalBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;
    /**
     * The colours of the box
     */
    colors: number[];
    /**
     * The WebGL context
     */
    gl: WebGL2RenderingContext;
    /**
     * The vertices of the box
     */
    vertices: number[];
    // /**
    //  * The indices of the box
    //  */
    // indices: number[];
    /**
     * The normals of the box
     */
    normals: number[];
    /**
     * The texture of the box
     */
    texture: WebGLTexture;
    /**
     * The buffer containing the box's texture
     */
    textureBuffer: WebGLBuffer;

    /**
     * Creates all WebGL buffers for the box
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
     * @param color The color of the box
     * @param texture The texture of the box
     */
    constructor(
        gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        color?: Vector,
        texture?: string
    ) {

        // set the WebGL context
        this.gl = gl;
        const glUtil = new GlUtils(gl);

        // calculate the vertices and normals
        this.vertices = SharedProps.calcVertices(minPoint, maxPoint)
        this.elements = this.vertices.length / 3;
        this.normals = SharedProps.getNormals()

        this.vertexBuffer = glUtil.createVertexBuffer(this.vertices)
        this.normalBuffer = glUtil.createNormalBuffer(this.normals)
        if (color && !texture) {
            // get the colors
            this.colors = glUtil.getColorsArray(color, this.elements)

            // create the buffers
            this.colorBuffer = glUtil.createColorBuffer(this.colors)
        } else {
            if (texture) {
                // create the texture
                this.texture = gl.createTexture();
                this.gl.bindTexture(gl.TEXTURE_2D, this.texture);

                // // create the texture buffer
                this.textureBuffer = glUtil.createTextureBuffer(SharedProps.getUVCords())

                // create uv cords
                const uvBuffer = glUtil.createArrayBuffer(SharedProps.getUVCords());

                // create the image and load the colour texture
                const image = new Image();
                image.src = texture;
                image.onload = () => {
                    // bind the texture and set the image
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, gl.UNSIGNED_BYTE, image);
                    // apply linear filtering
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                    // clamp the texture to the edges of the box to avoid repeating
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    // unbind the texture
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                };
            }
            else {
                throw new Error("No color or texture provided")
            }
        }
    }


    /**
     * Renders the box
     * @param shader The shader used to render
     */
    render(shader: Shader) {
        const glUtil = new GlUtils(this.gl);

        const positionLocation = glUtil.bindAndPointToAttribute(this.vertexBuffer, "a_position", 3, this.gl.FLOAT, shader);

        if (!this.texture) {
            const colorLocation = glUtil.bindAndPointToAttribute(this.colorBuffer, "a_color", 3, this.gl.FLOAT, shader);
            const normalLocation = glUtil.bindAndPointToAttribute(this.normalBuffer, "a_normal", 3, this.gl.FLOAT, shader);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

            glUtil.disableAttribute(colorLocation);
            glUtil.disableAttribute(normalLocation);
        } else {
            const texCoordLocation = glUtil.bindAndPointToAttribute(this.textureBuffer, "a_texCoord", 2, this.gl.FLOAT, shader);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            shader.getUniformInt("sampler").set(0);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

            glUtil.disableAttribute(texCoordLocation);
        }

        glUtil.disableAttribute(positionLocation);
    }
}