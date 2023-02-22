import Vector from '../vector';
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
    private colorBuffer: WebGLBuffer;
    private normalBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;


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
        private gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        color: Vector
        ) {
        this.gl = gl;
        const glu = new GlUtils(gl);
        const mi = minPoint;
        const ma = maxPoint;

        let topx = (mi.x)+(ma.x-mi.x)/2;
        let topz = mi.z + (ma.z-mi.z) / 2;


        let frontVec1 = new Vector(mi.x, mi.y, ma.z, 1);
        let frontVec2 = new Vector(ma.x, mi.y, mi.z,1);
        let frontVec3 = new Vector(topx, ma.y, topz,1);

        let backVec1 = new Vector(mi.x, mi.y, mi.z,1);
        let backVec2 = new Vector(ma.x, mi.y, ma.z,1);
        let backVec3 = new Vector(topx, ma.y, topz,1);

        let rightVec1 = new Vector(ma.x, mi.y, mi.z,1);
        let rightVec2 = new Vector(ma.x, mi.y, ma.z,1);
        let rightVec3 = new Vector(topx, ma.y, topz,1);

        let leftVec1 = new Vector(mi.x, mi.y, mi.z,1);
        let leftVec2 = new Vector(mi.x, mi.y, ma.z,1);
        let leftVec3 = new Vector(topx, ma.y, topz,1);


        let normalFront = makecross(frontVec1, frontVec2, frontVec3);
        let normalBack = makecross(backVec3,backVec2,backVec1);
        let normalRight = makecross(rightVec1, rightVec2, rightVec3);
        let normalLeft = makecross(leftVec1,leftVec2,leftVec3);

        function makecross(vector1: Vector,vector2:Vector, vector3: Vector){

            let sub1 = vector1.sub(vector3);
            let sub2 = vector2.sub(vector3);

            return sub1.cross(sub2).normalize();
        }


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

        const normals = [

            //Front
            normalFront.x, normalFront.y, normalFront.z,
            normalFront.x, normalFront.y, normalFront.z,
            normalFront.x, normalFront.y, normalFront.z,

            //Back
            normalBack.x,normalBack.y,normalBack.z,
            normalBack.x,normalBack.y,normalBack.z,
            normalBack.x,normalBack.y,normalBack.z,
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

        const colors = [
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z,
            color.x, color.y, color.z

        ];


        this.vertexBuffer = glu.createVertexBuffer(vertices)

        // const indexBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        // this.indexBuffer = indexBuffer;
        // this.elements = indices.length;


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
        this.gl.vertexAttribPointer(positionLocation,
            3, this.gl.FLOAT, false, 0, 0);

        const vertexColorAttribute = shader.getAttributeLocation("a_color")
        this.gl.enableVertexAttribArray(vertexColorAttribute);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        const normalLocation = shader.getAttributeLocation("a_normal");
        this.gl.enableVertexAttribArray(normalLocation);
        this.gl.vertexAttribPointer(normalLocation,
            3, this.gl.FLOAT, false, 0, 0);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.vertexAttribPointer(vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);
        // TODO bind colour buffer

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

        this.gl.disableVertexAttribArray(positionLocation);
        this.gl.disableVertexAttribArray(vertexColorAttribute);
        this.gl.disableVertexAttribArray(normalLocation);
    }
}