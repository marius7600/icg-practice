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
    // TODO private variable for color buffer
    colorBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;

    colours: number[];

    gl: WebGL2RenderingContext;

    vertices: number[];

    indices: number[];
    normals: number[];

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
    constructor(
        gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        color: Vector) {
            this.gl = gl;
            const glu = new GlUtils(gl);
            let vertices = SharedProps.calcVertices(minPoint, maxPoint)
    
            this.elements = vertices.length / 3;
    
            const normals = SharedProps.getNormals()
    
    
            const colors = glu.getColorsArray(color, this.elements)
    
    
            this.vertexBuffer = glu.createVertexBuffer(vertices)
    
    
            this.normalBuffer = glu.createNormalBuffer(normals)
    
    
            // Code from Jacob
            this.colorBuffer = glu.createColorBuffer(colors)
    }

    /**
     * Renders the box
     * @param shader The shader used to render
     */
    render(shader: Shader) {
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

}