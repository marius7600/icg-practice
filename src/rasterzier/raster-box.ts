import Vector from '../vector';
import Shader from '../shader/shader';
import SharedProps from '../boxSharedProperties';
import GlUtils from "../glUtils";

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
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
    colorTexture: WebGLTexture;
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
     */
    // The 3D models displayed in the application should be able to be provided with
    // a color texture. Furthermore, at least one of the objects must be provided with a color
    // texture.
    constructor(
        gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        color?: Vector,
        colorTexture?: string
    ) {

        if (color && !colorTexture) {
            // set the WebGL context
            this.gl = gl;
            const glu = new GlUtils(gl);

            // calculate the vertices and normals
            this.vertices = SharedProps.calcVertices(minPoint, maxPoint)
            this.elements = this.vertices.length / 3;
            this.normals = SharedProps.getNormals()

            // get the colors
            this.colors = glu.getColorsArray(color, this.elements)

            // create the buffers
            this.vertexBuffer = glu.createVertexBuffer(this.vertices)
            this.normalBuffer = glu.createNormalBuffer(this.normals)
            this.colorBuffer = glu.createColorBuffer(this.colors)
        } else {
            if (colorTexture) {
                // set the WebGL context
                this.gl = gl;
                const glu = new GlUtils(gl);

                // calculate the vertices and normals
                this.vertices = SharedProps.calcVertices(minPoint, maxPoint)
                this.normals = SharedProps.getNormals()
                this.elements = this.vertices.length / 3;

                // create the buffers
                this.vertexBuffer = glu.createVertexBuffer(this.vertices)
                this.normalBuffer = glu.createNormalBuffer(this.normals)

                // create the texture
                this.colorTexture = gl.createTexture();
                this.gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);

                // create the image and load the colour texture
                const image = new Image();
                image.src = colorTexture;
                image.onload = () => {
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, gl.UNSIGNED_BYTE, image);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                };

                // // create the texture buffer
                this.textureBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(SharedProps.getUVCords()), this.gl.STATIC_DRAW);

                // create uv cords
                const uv = SharedProps.getUVCords();
                const uvBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), this.gl.STATIC_DRAW);
            }
        }
    }

    /**
     * Renders the box
     * @param shader The shader used to render
     */
    render(shader: Shader) {
        // if the box has no texture render as usual
        if (!this.colorTexture) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            const positionLocation = shader.getAttributeLocation("a_position");
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

            const vertexColorAttribute = shader.getAttributeLocation("a_color")
            this.gl.enableVertexAttribArray(vertexColorAttribute);


            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            const normalLocation = shader.getAttributeLocation("a_normal");
            this.gl.enableVertexAttribArray(normalLocation);
            this.gl.vertexAttribPointer(normalLocation,
                3, this.gl.FLOAT, false, 0, 0);


            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
            this.gl.vertexAttribPointer(vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

            this.gl.disableVertexAttribArray(positionLocation);
            this.gl.disableVertexAttribArray(vertexColorAttribute);
            this.gl.disableVertexAttribArray(normalLocation);
        }
        // if the box has a texture use render from raster-texture-box.ts
        else {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            const positionLocation = shader.getAttributeLocation("a_position");
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

            // Bind the texture coordinates in this.texCoords
            // to their attribute in the shader

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
            const texCoordLocation = shader.getAttributeLocation("a_texCoord");
            this.gl.enableVertexAttribArray(texCoordLocation);
            this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
            shader.getUniformInt("sampler").set(0);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

            this.gl.disableVertexAttribArray(positionLocation);
            this.gl.disableVertexAttribArray(texCoordLocation);
        }
    }

}