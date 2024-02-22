import Vector from '../math/vector';
import Shader from '../shader/shader';
import GlUtils from "../glUtils";

/**
 * A class creating buffers for an axis aligned Pyramid to render it with WebGL
 */
export default class RasterPyramid {
    /**
     * The buffer containing the Pyramid's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;
    /**
     * The buffer containing the Pyramid's colors
     */
    colorBuffer: WebGLBuffer;
    /**
     * The buffer containing the Pyramid's normals
     */
    normalBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;
    /**
     * The WebGL context
     */
    gl: WebGL2RenderingContext;
    /**
     * The buffer containing the Pyramids texture
     */
    textureBuffer: WebGLBuffer;
    /**
     * The Texture of the Pyramid
    */
    texture: WebGLTexture;





    /**
     * Creates all WebGL buffers for the pyramid
     *
     *               3------------ 2
     *              /  \     /    /
     *             /      4      /
     *            /    /    \   /
     *           /    /      \ /
     *           0------------1
     *
     *
     *  looking in negative z axis direction
     * @param gl The canvas' context
     * @param minPoint The minimal x,y,z of the box
     * @param maxPoint The maximal x,y,z of the box
     */
    constructor(
        gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        private color?: Vector,
        texture?: string,
    ) {
        this.gl = gl;
        const glUtil = new GlUtils(gl);
        const mi = minPoint;
        const ma = maxPoint;

        let topx = (mi.x) + (ma.x - mi.x) / 2;
        let topz = mi.z + (ma.z - mi.z) / 2;


        let frontVec1 = new Vector(mi.x, mi.y, ma.z, 1);
        let frontVec2 = new Vector(ma.x, mi.y, mi.z, 1);
        let frontVec3 = new Vector(topx, ma.y, topz, 1);

        let backVec1 = new Vector(mi.x, mi.y, mi.z, 1);
        let backVec2 = new Vector(ma.x, mi.y, ma.z, 1);
        let backVec3 = new Vector(topx, ma.y, topz, 1);

        let rightVec1 = new Vector(ma.x, mi.y, mi.z, 1);
        let rightVec2 = new Vector(ma.x, mi.y, ma.z, 1);
        let rightVec3 = new Vector(topx, ma.y, topz, 1);

        let leftVec1 = new Vector(mi.x, mi.y, mi.z, 1);
        let leftVec2 = new Vector(mi.x, mi.y, ma.z, 1);
        let leftVec3 = new Vector(topx, ma.y, topz, 1);


        let normalFront = this.makecross(frontVec1, frontVec2, frontVec3);
        let normalBack = this.makecross(backVec3, backVec2, backVec1);
        let normalRight = this.makecross(rightVec1, rightVec2, rightVec3);
        let normalLeft = this.makecross(leftVec1, leftVec2, leftVec3);

        let vertices = [
            //Font
            mi.x, mi.y, ma.z, //0
            ma.x, mi.y, ma.z, //2
            topx, ma.y, topz, //4
            // //Back
            ma.x, mi.y, mi.z, //1
            mi.x, mi.y, mi.z, //3
            topx, ma.y, topz, //4
            // //Right
            ma.x, mi.y, ma.z, //2
            ma.x, mi.y, mi.z, //1
            topx, ma.y, topz, //4
            // //Left
            mi.x, mi.y, mi.z, //3
            mi.x, mi.y, ma.z, //0
            topx, ma.y, topz, //4
            // Bottom
            mi.x, mi.y, ma.z, //0
            ma.x, mi.y, mi.z, //1
            ma.x, mi.y, ma.z, //2
            mi.x, mi.y, ma.z, //0
            mi.x, mi.y, mi.z, //3
            ma.x, mi.y, mi.z, //1
        ];
        this.elements = vertices.length / 3;
        this.vertexBuffer = glUtil.createVertexBuffer(vertices)

        const normals = [
            //Front
            normalFront.x, normalFront.y, normalFront.z,
            normalFront.x, normalFront.y, normalFront.z,
            normalFront.x, normalFront.y, normalFront.z,

            //Back
            normalBack.x, normalBack.y, normalBack.z,
            normalBack.x, normalBack.y, normalBack.z,
            normalBack.x, normalBack.y, normalBack.z,
            //Right
            normalRight.x, normalRight.y, normalRight.z,
            normalRight.x, normalRight.y, normalRight.z,
            normalRight.x, normalRight.y, normalRight.z,
            //Left
            normalLeft.x, normalLeft.y, normalLeft.z,
            normalLeft.x, normalLeft.y, normalLeft.z,
            normalLeft.x, normalLeft.y, normalLeft.z,
            //Bottom
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0
        ]
        this.normalBuffer = glUtil.createNormalBuffer(normals)

        if (color && !texture) {
            let colors: number[] = []
            for (let i = 0; i < vertices.length; i++) {
                colors.push(...[color.x, color.y, color.z])
            }
            this.colorBuffer = glUtil.createColorBuffer(colors);

        } else {
            if (texture) {
                const uvCoords = [
                    //Coordinates for uv mapping of the pyramid
                    //Front
                    0.5, 0,
                    1, 1,
                    0, 1,
                    //Back
                    0.5, 0,
                    1, 1,
                    0, 1,
                    //Right
                    0.5, 0,
                    1, 1,
                    0, 1,
                    //Left
                    0.5, 0,
                    1, 1,
                    0, 1,
                    //Bottom
                    0.5, 0,
                    1, 1,
                    0, 1,
                    0.5, 0,
                    1, 1,
                    0, 1
                ];

                // // create the texture buffer
                this.textureBuffer = glUtil.createTextureBuffer(uvCoords)

                this.texture = gl.createTexture();
                this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
                this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

                const image = new Image();
                image.src = texture;

                image.onload = () => {
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, gl.UNSIGNED_BYTE, image);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                };
            }
        }
    }

    makecross(vector1: Vector, vector2: Vector, vector3: Vector) {

        let sub1 = vector1.sub(vector3);
        let sub2 = vector2.sub(vector3);

        return sub1.cross(sub2).normalize();
    }

    /**
     * Renders the box
     * @param shader The shader used to render
     */
    render(shader: Shader) {
        const glUtil = new GlUtils(this.gl);
        const positionLocation = glUtil.bindAndPointToAttribute(this.vertexBuffer, "a_position", 3, this.gl.FLOAT, shader);

        // if the pyramid has no texture render as usual
        if (this.color && !this.texture) {
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