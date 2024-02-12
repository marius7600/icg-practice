import Vector from '../vector';
import Shader from '../shader/shader';

/**
 * A class creating buffers for a textured box to render it with WebGL
 */
export default class RasterVideoTextureBox {
    private video: HTMLVideoElement;
    private checkCopyVideo: Boolean;
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



        if (typeof texture === 'string') {
            let cubeTexture = gl.createTexture();
            let cubeImage = new Image();
            cubeImage.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.bindTexture(gl.TEXTURE_2D, null);
            };
            cubeImage.src = texture;
            this.texBuffer = cubeTexture;
        } else {
            this.texBuffer = texture;
        }



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


        this.texBuffer = this.initTexture(gl);
        this.video = this.setupVideo(texture);
        this.checkCopyVideo = false;
    }

    setupVideo(url: string) {
        const video = document.createElement("video");

        let playing = false;
        let timeupdate = false;

        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        video.addEventListener(
            "playing",
            () => {
                playing = true;
                this.checkReady(playing, timeupdate);
            },
            true
        );
        video.addEventListener(
            "timeupdate",
            () => {
                timeupdate = true;
                this.checkReady(playing, timeupdate);
            },
            true
        );

        video.src = url;
        video.play();

        return video;
    }

    private checkReady(playing: boolean, timeupdate: boolean) {
        if (playing && timeupdate) {
            this.checkCopyVideo = true;
        }
    }

    private initTexture(gl: WebGL2RenderingContext) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because video havs to be download over the internet
        // they might take a moment until it's ready so
        // put a single pixel in the texture so we can
        // use it immediately.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );

        // Turn off mips and set wrapping to clamp to edge so it
        // will work regardless of the dimensions of the video.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        return texture;
    }

    private updateTexture(
        gl: WebGL2RenderingContext,
        texture: WebGLTexture,
        video: HTMLVideoElement
    ) {
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            video
        );
    }



    /**
     * Renders the textured box
     * @param {Shader} shader - The shader used to render
     */
    render(shader: Shader) {
        if (this.checkCopyVideo) {
            this.updateTexture(this.gl, this.texBuffer, this.video);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = shader.getAttributeLocation("a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

        // Bind the texture coordinates in this.texCoords
        // to their attribute in the shader

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