import Matrix from "./math/matrix";
import AABoxNode from "./nodes/aabox-node";
import AnimationNode from "./nodes/animation-nodes";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import MeshNode from "./nodes/mesh-node";
import Node from "./nodes/node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/sphere-node";
import TextureBoxNode from "./nodes/texture-box-node";
import TextureTextBoxNode from "./nodes/texture-text-box-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import RasterTextTextureBox from "./rasterzier/raster-texture-box-text";
import AABox from "./raytracer/aabox";
import Intersection from "./raytracer/intersection";
import Pyramid from "./raytracer/pyramid";
import Ray from "./raytracer/ray";
import Sphere from "./raytracer/ray-sphere";
import Vector from "./math/vector";
import Visitor from "./visitor";

interface Intersectable {
    intersect(ray: Ray): Intersection | null;
}

export default class MouseVisitor implements Visitor {
    stack: Array<Matrix> = [];
    intersection: Intersection;
    intersectables: Array<Intersectable>;
    nodes: Array<any>;
    camera: CameraNode;
    imageData: ImageData;
    lightNodes: Array<LightNode> = [];

    ray: Ray;


    /**
     * Constructs a new instance of the MouseVisitor class.
     */
    constructor() {
        this.stack.push(Matrix.identity());
        // this.intersection = new Intersection(Infinity, null, null);
        this.intersectables = [];
        this.nodes = [];
    }

    /**
     * Visits a LightNode and performs necessary operations.
     * 
     * @param node - The LightNode to visit.
     */
    visitLightNode(node: LightNode): void {
        // throw new Error('Method not implemented.');

        // Get the transform of the current node
        let myPosition = this.stack[this.stack.length - 1].mul(node.position);
        // Add a light node to the list of light nodes
        this.lightNodes.push(new LightNode(node.color, myPosition));
    }

    /**
     * Visits a GroupNode and performs necessary operations.
     * 
     * @param node - The GroupNode to visit.
     */
    visitGroupNode(node: GroupNode): void {
        let toWorld = this.stack
            .at(this.stack.length - 1)
            .mul(node.transform.getMatrix());
        this.stack.push(toWorld);
        for (let i = 0; i < node.children.length; i++) {
            node.children[i].accept(this);
        }
        this.stack.pop();
    }

    /**
     * Visits a SphereNode and performs necessary operations.
     * 
     * @param node - The SphereNode to visit.
     */
    visitSphereNode(node: SphereNode): void {
        // throw new Error('Method not implemented.');

        let m = this.stack[this.stack.length - 1]; //translation matrix

        let xScale = m.getVal(0, 0);
        let yScale = m.getVal(0, 1);
        let zScale = m.getVal(0, 2);

        let scale = Math.sqrt(xScale * xScale + yScale * yScale + zScale * zScale);
        this.intersectables.push(
            new Sphere(m.mul(node.center), node.radius * scale, node.color)
        );
        this.nodes.push(node);
    }

    /**
     * Visits an AABoxNode and performs necessary operations.
     * 
     * @param node - The AABoxNode to visit.
     */
    visitAABoxNode(node: AABoxNode): void {
        // Get the transformation matrix for the current node
        let m = this.stack[this.stack.length - 1];
        // Transform the min and max points of the node to world coordinates
        let min = m.mul(node.minPoint);
        let max = m.mul(node.maxPoint);
        // this.intersectables.push(new AABox(min, max, node.color));
        this.intersectables.push(new AABox(min, max, node.color));
        this.nodes.push(node);
    }

    /*
    * Visits a TextureBoxNode. Do nothing.
    */
    visitTextureBoxNode(node: TextureBoxNode): void { }

    /*
* Visits a MeshNode. Do nothing.
*/
    visitMeshNode(node: MeshNode): void { }

    /*
* Visits a TextureVideoBoxNode. Do nothing.
*/
    visitTextureVideoBoxNode(node: TextureVideoBoxNode): void { }


    /**
     * Visits a TextureTextBoxNode and creates an AABox that represents the bounding box of the node.
     * Pushes the box to the intersectables array and the node to the nodes array.
     * @param node - The TextureTextBoxNode to visit.
     */
    visitTextureTextBoxNode(node: TextureTextBoxNode): void {
        // Get the transformation matrix for the current node
        let m = this.stack[this.stack.length - 1];

        // Transform the min and max points of the node
        let min = m.mul(node.minPoint);
        let max = m.mul(node.maxPoint);

        // Create an AABox that represents the bounding box of the node
        let box = new AABox(min, max, new Vector(0, 0, 0, 1));

        // Add the box to the intersectables array
        this.intersectables.push(box);

        // Add the node to the nodes array
        this.nodes.push(node);
    }

    /**
     * Visits a CameraNode and sets is attributes to the current camera.
     * 
     * @param node - The CameraNode to visit.
     */
    visitCameraNode(node: CameraNode): void {
        this.camera = new CameraNode(
            node.eye,
            node.center,
            node.up,
            node.fovy,
            node.aspect,
            node.near,
            node.far
        );
    }

    /**
     * Visits a GroupNodeCamera. Do nothing.
     */
    visitGroupNodeCamera(node: GroupNode): void { }

    /**
     * Visits a PyramidNode. 
     * Creates a Pyramid object and adds it to the intersectables and nodes arrays.
     * @param node The PyramidNode to visit.
     */
    visitPyramidNode(node: PyramidNode): void {
        let mat = this.stack[this.stack.length - 1];
        let min = mat.mul(node.minPoint);
        let max = mat.mul(node.maxPoint);
        this.intersectables.push(new Pyramid(min, max, node.color));
        this.nodes.push(node);
    }

    /**
     * Visits an AnimationNode and does nothing.
     */
    visitAnimationNode(node: AnimationNode): void { }

    /**
     * Calculates the closest node to the mouse position
     * @param sceneGraph sceneGraph to be rendered
     * @param mouse_x x coordinate of the mouse
     * @param mouse_y y coordinate of the mouse
     * @param context context of the canvas either CanvasRenderingContext2D or WebGL2RenderingContext
     * @returns the closest node to the mouse position
     */
    public getSelectedNode(
        sceneGraph: Node,
        mouse_x: number,
        mouse_y: number,
        context: CanvasRenderingContext2D | WebGL2RenderingContext
    ): Node {
        // Initialize intersection with default values
        this.intersection = new Intersection(Infinity, null, null);

        // Initialize arrays for intersectables, nodes, and lightNodes
        this.intersectables = [];
        this.nodes = [];
        this.lightNodes = [];

        // Initialize camera and imageData as null
        this.camera = null;
        this.imageData = null;

        // Accept the current object as a visitor to the sceneGraph
        sceneGraph.accept(this);

        // Create a ray from the mouse position and the camera
        this.ray = Ray.makeRay(
            mouse_x,
            mouse_y,
            context.canvas.height,
            context.canvas.width,
            this.camera
        );

        // Initialize minimum intersection and selectedNode with default values
        let minIntersection = new Intersection(Infinity, null, null);
        let selectedNode: Node = null;

        // Loop through intersectables and nodes
        for (let i = 0; i < this.intersectables.length && i < this.nodes.length; i++) {
            try {
                // Try to find an intersection between the ray and the current intersectable
                this.intersection = this.intersectables[i].intersect(this.ray);
            } catch (e) {
                // Log any errors and continue with the next iteration
                console.log(e);
                continue;
            }
            // If an intersection is found and it's closer than the current minimum intersection
            if (this.intersection && this.intersection.closerThan(minIntersection)) {
                // Update the minimum intersection and the selected node
                minIntersection = this.intersection;
                selectedNode = this.nodes[i];
            }
        }

        // Return the selected node
        return selectedNode;
    }
}
