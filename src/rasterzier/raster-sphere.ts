import Vector from '../vector';
import Shader from '../shader/shader';
import Matrix from '../matrix';
import GlUtils from "../glUtils";

/**
 * A class creating buffers for a sphere to render it with WebGL
 */
export default class RasterSphere {
    /**
     * The buffer containing the sphere's vertices
     */
    vertexBuffer: WebGLBuffer;

    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;

    /**
     * The normals on the surface at each vertex location
     */

    normalBuffer: WebGLBuffer;
    /**
     * The buffer containing the sphere's colors
     */
    colorBuffer: WebGLBuffer;

    /**
     * The amount of indices
     */
    elements: number;

    /**
     * The buffer containing the sphere's texture
     */
    textureBuffer: WebGLBuffer;

    /**
     * The texture of the sphere
     */
    colorTexture: WebGLTexture;

    /**
     * The vertices of the sphere
     */
    vertices: number[];

    /**
     * Creates all WebGL buffers for the sphere
     * @param gl The canvas' context
     * @param center The center of the sphere
     * @param radius The radius of the sphere
     * @param color The color of the sphere
     * @param texture The texture of the sphere
     */
    constructor(
        private gl: WebGL2RenderingContext,
        center: Vector,
        radius: number,
        private color: Vector,
        private texture?: string
    ) {
        let glUtil = new GlUtils(gl);
        let indices = [];
        let normals = [];
        let colours = [];
        let uv = [];
        this.vertices = [];
        let ringsize = 30;

        // create vertices, normals and uv cords
        for (let ring = 0; ring < ringsize; ring++) {
            for (let ring2 = 0; ring2 < ringsize; ring2++) {
                let theta = ring * Math.PI * 2 / ringsize - 1;
                let phi = ring2 * Math.PI * 2 / ringsize;
                let x = (radius *
                    Math.sin(theta) *
                    Math.cos(phi) +
                    center.x
                );
                let y = (radius *
                    Math.sin(theta) *
                    Math.sin(phi) +
                    center.y
                );
                let z = (radius *
                    Math.cos(theta) +
                    center.z
                );
                this.vertices.push(x);
                this.vertices.push(y);
                this.vertices.push(z);

                let normal = (new Vector(x, y, z, 1)).sub(center).normalize();
                normals.push(normal.x);
                normals.push(normal.y);
                normals.push(normal.z);

                if (color && !texture) {
                    colours.push(color.x, color.y, color.z);
                } else {
                    let u = ring / (ringsize - 1);
                    let v = ring2 / (ringsize - 1);
                    uv.push(u, v);
                }
            }
        }

        // create indices
        for (let ring = 0; ring < ringsize - 1; ring++) {
            for (let ring2 = 0; ring2 < ringsize; ring2++) {
                indices.push(ring * ringsize + ring2);
                indices.push((ring + 1) * ringsize + ring2);
                indices.push(ring * ringsize + ((ring2 + 1) % ringsize));

                indices.push(ring * ringsize + ((ring2 + 1) % ringsize));
                indices.push((ring + 1) * ringsize + ring2);
                indices.push((ring + 1) * ringsize + ((ring2 + 1) % ringsize));
            }
        }

        // create vertex buffer
        this.vertexBuffer = glUtil.createVertexBuffer(this.vertices);

        // create index buffer
        const indexBuffer = gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        this.indexBuffer = indexBuffer;

        // create normal buffer
        this.normalBuffer = glUtil.createNormalBuffer(normals);

        this.elements = indices.length;

        // check if the sphere should have a texture
        if (color && !texture) {
            // create color buffer
            this.colorBuffer = glUtil.createColorBuffer(colours);
        } else {
            if (texture) {
                // create uv cords
                this.textureBuffer = glUtil.createTextureBuffer(uv);
                // create texture
                this.colorTexture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
                const image = new Image();
                image.src = texture;

                image.onload = () => {
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                };
            }
            else {
                throw new Error("No color or texture provided")
            }
        }
    }

    /**
     * Renders the sphere
     * @param {Shader} shader - The shader used to render
     */
    render(shader: Shader) {
        const glUtil = new GlUtils(this.gl);
        const positionLocation = glUtil.bindAndPointToAttribute(this.vertexBuffer, "a_position", 3, this.gl.FLOAT, shader);

        if (this.color && !this.texture) {
            const colorLocation = glUtil.bindAndPointToAttribute(this.colorBuffer, "a_color", 3, this.gl.FLOAT, shader);
            const normalLocation = glUtil.bindAndPointToAttribute(this.normalBuffer, "a_normal", 3, this.gl.FLOAT, shader);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

            glUtil.disableAttribute(colorLocation);
            glUtil.disableAttribute(normalLocation);
        } else {
            const texCoordLocation = glUtil.bindAndPointToAttribute(this.textureBuffer, "a_texCoord", 2, this.gl.FLOAT, shader);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
            shader.getUniformInt("sampler").set(0);
            this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

            glUtil.disableAttribute(texCoordLocation);
        }

        glUtil.disableAttribute(positionLocation);
    }
}