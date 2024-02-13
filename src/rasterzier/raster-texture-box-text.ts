import Vector from '../vector';
import Shader from '../shader/shader';

/**
 * A class creating buffers for a textured box to render it with WebGL
 */
export default class RasterTextTextureBox {
    /**
     * The texture containing the text
     */
    private canvasTexture: WebGLTexture;
    /**
     * The canvas containing the text as texture
     */
    private textCanvas: HTMLCanvasElement;
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
        let vertices = [
            // front
            mi.x, mi.y, ma.z, ma.x, mi.y, ma.z, ma.x, ma.y, ma.z,
            ma.x, ma.y, ma.z, mi.x, ma.y, ma.z, mi.x, mi.y, ma.z,
            // back
            ma.x, mi.y, mi.z, mi.x, mi.y, mi.z, mi.x, ma.y, mi.z,
            mi.x, ma.y, mi.z, ma.x, ma.y, mi.z, ma.x, mi.y, mi.z,
            // right
            ma.x, mi.y, ma.z, ma.x, mi.y, mi.z, ma.x, ma.y, mi.z,
            ma.x, ma.y, mi.z, ma.x, ma.y, ma.z, ma.x, mi.y, ma.z,
            // top
            mi.x, ma.y, ma.z, ma.x, ma.y, ma.z, ma.x, ma.y, mi.z,
            ma.x, ma.y, mi.z, mi.x, ma.y, mi.z, mi.x, ma.y, ma.z,
            // left
            mi.x, mi.y, mi.z, mi.x, mi.y, ma.z, mi.x, ma.y, ma.z,
            mi.x, ma.y, ma.z, mi.x, ma.y, mi.z, mi.x, mi.y, mi.z,
            // bottom
            mi.x, mi.y, mi.z, ma.x, mi.y, mi.z, ma.x, mi.y, ma.z,
            ma.x, mi.y, ma.z, mi.x, mi.y, ma.z, mi.x, mi.y, mi.z
        ];

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer = vertexBuffer;
        this.elements = vertices.length / 3;

        // let cubeTexture = gl.createTexture();
        // let cubeImage = new Image();
        // cubeImage.onload = function () {
        //     gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //     gl.bindTexture(gl.TEXTURE_2D, null);
        // }
        // cubeImage.src = texture;
        // this.texBuffer = cubeTexture;

        let uv = [
            // front
            0, 0, 1, 0, 1, 1,
            1, 1, 0, 1, 0, 0,
            // back
            0, 0, 1, 0, 1, 1,
            1, 1, 0, 1, 0, 0,
            // right
            0, 0, 1, 0, 1, 1,
            1, 1, 0, 1, 0, 0,
            // top
            0, 0, 1, 0, 1, 1,
            1, 1, 0, 1, 0, 0,
            // left
            0, 0, 1, 0, 1, 1,
            1, 1, 0, 1, 0, 0,
            // bottom
            0, 0, 1, 0, 1, 1,
            1, 1, 0, 1, 0, 0,
        ];
        let uvBuffer = this.gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv),
            gl.STATIC_DRAW);
        this.texCoords = uvBuffer;


        this.textCanvas = document.createElement("canvas");
        var ctx = this.textCanvas.getContext("2d");
        this.textCanvas.width = 512;
        this.textCanvas.height = 512;

        ctx.translate(0, this.textCanvas.height);
        ctx.scale(1, -1);


        ctx.fillStyle = "#0827d4"; // This determines the text colour, it can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
        ctx.textAlign = "center"; // This determines the alignment of text, e.g. left, center, right
        ctx.textBaseline = "middle"; // This determines the baseline of the text, e.g. top, middle, bottom
        ctx.font = "80px monospace"; // This determines the size of the text and the font family used
        ctx.fillText(
            texture,
            this.textCanvas.width / 2,
            this.textCanvas.height / 2
        );

        this.initTextureText();
        this.texBuffer = this.canvasTexture;
    }
    /**
 * Displays the texture on a 2D canvas and appends it to the document body.
 */

    private initTextureText() {
        this.canvasTexture = this.gl.createTexture();
        this.handleLoadedTexture(this.canvasTexture, this.textCanvas);
    }

    private handleLoadedTexture(
        texture: WebGLTexture,
        textureCanvas: HTMLCanvasElement
    ) {
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            textureCanvas
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MAG_FILTER,
            this.gl.LINEAR
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR_MIPMAP_NEAREST
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }


    /**
     * Renders the textured box
     * @param {Shader} shader - The shader used to render
     */
    render(shader: Shader) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = shader.getAttributeLocation("a_position");

        // console.log("positionLocation: ", positionLocation);

        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(
            positionLocation,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        // Bind the texture coordinates in this.texCoords
        // to their attribute in the shader

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoords);

        const texCoordLocation = shader.getAttributeLocation("a_texCoord");


        this.gl.enableVertexAttribArray(texCoordLocation);

        this.gl.vertexAttribPointer(
            texCoordLocation,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texBuffer);
        shader.getUniformInt("sampler").set(0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

        this.gl.disableVertexAttribArray(positionLocation);
        this.gl.disableVertexAttribArray(texCoordLocation);
    }
}