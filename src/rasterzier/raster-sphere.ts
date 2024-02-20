import Vector from '../vector';
import Shader from '../shader/shader';
import Matrix from '../matrix';

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

    vertices: number[];

    /**
     * Creates all WebGL buffers for the sphere
     * @param gl The canvas' context
     * @param center The center of the sphere
     * @param radius The radius of the sphere
     * @param color The color of the sphere
     */
    constructor(
        private gl: WebGL2RenderingContext,
        center: Vector,
        radius: number,
        private color: Vector,
        private texture?: string
    ) {

        if (color && !texture) {
            let vertices = [];
            let indices = [];
            let normals = [];

            let colours = [];

            let ringsize = 30;
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
                    vertices.push(x);
                    vertices.push(y);
                    vertices.push(z);

                    let normal = (new Vector(x, y, z, 1)).sub(center).normalize();
                    normals.push(normal.x);
                    normals.push(normal.y);
                    normals.push(normal.z);
                    colours.push(color.x, color.y, color.z);
                }
            }

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
            const vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
            this.vertexBuffer = vertexBuffer;

            // create index buffer
            const indexBuffer = gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
            this.indexBuffer = indexBuffer;

            // create normal buffer
            const normalBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
            this.normalBuffer = normalBuffer;
            this.elements = indices.length;

            // create colorBuffer
            const colorBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
            this.colorBuffer = colorBuffer;
        } else {
            // create texture coordinates
            let uv = [];
            this.vertices = [];
            let indices = [];
            let normals = [];
            let ringsize = 30;

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
                    let u = ring / (ringsize - 1);
                    let v = ring2 / (ringsize - 1);
                    uv.push(u, v);
                }
            }

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
            const vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
            this.vertexBuffer = vertexBuffer;

            // create index buffer
            const indexBuffer = gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
            this.indexBuffer = indexBuffer;

            // create normal buffer
            const normalBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
            this.normalBuffer = normalBuffer;
            this.elements = indices.length;

            // create uv cords
            this.textureBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), this.gl.STATIC_DRAW);

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
    }



    /**
     * Renders the sphere
     * @param {Shader} shader - The shader used to render
     */
    render(shader: Shader) {
        if (this.color && !this.texture) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            const positionLocation = shader.getAttributeLocation("a_position");
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
            // TODO bind colour buffer
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer); // Bind the buffer object to target
            const colorLocation = shader.getAttributeLocation("a_color");  // Get the attribute location
            this.gl.enableVertexAttribArray(colorLocation); // Enable the attribute
            this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0); // Point an attribute to a VBO
            // TODO bind normal buffer
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer); // bind normal buffer
            const normalLocation = shader.getAttributeLocation("a_normal"); // get normal attribute location
            this.gl.enableVertexAttribArray(normalLocation); // enable normal attribute
            this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0); // set normal attribute pointer
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

            this.gl.disableVertexAttribArray(positionLocation);
            // TODO disable color vertex attrib array
            this.gl.disableVertexAttribArray(colorLocation);
            // TODO disable normal vertex attrib array
            this.gl.disableVertexAttribArray(normalLocation);
        } else {

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
            this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

            this.gl.disableVertexAttribArray(positionLocation);
            this.gl.disableVertexAttribArray(texCoordLocation);
        }
    }

}