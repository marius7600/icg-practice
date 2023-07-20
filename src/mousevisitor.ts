import Matrix from "./matrix";
import AABoxNode from "./nodes/aabox-node";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import Node from "./nodes/node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/shere-node";
import TextureBoxNode from "./nodes/texture-box-node";
import AABox from "./raytracer/aabox";
import Intersection from "./raytracer/intersection";
import Pyramid from "./raytracer/pyramid";
import Ray from "./raytracer/ray";
import Sphere from "./raytracer/ray-sphere";
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

    constructor() {
        this.stack.push(Matrix.identity());
        // this.intersection = new Intersection(Infinity, null, null);
        this.intersectables = [];
        this.nodes = [];
    }

    visitLightNode(node: LightNode): void {
        // throw new Error('Method not implemented.');

        // Get the transform of the current node
        let myPosition = this.stack[this.stack.length - 1].mul(node.position);
        // Add a light node to the list of light nodes
        this.lightNodes.push(new LightNode(node.color, myPosition));
    }
    visitGroupNode(node: GroupNode): void {
        // throw new Error('Method not implemented.');

        let toWorld = this.stack
            .at(this.stack.length - 1)
            .mul(node.transform.getMatrix());
        this.stack.push(toWorld);
        for (let i = 0; i < node.children.length; i++) {
            node.children[i].accept(this);
        }
        this.stack.pop();
    }
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
    visitAABoxNode(node: AABoxNode): void {
        // throw new Error('Method not implemented.');

        let m = this.stack[this.stack.length - 1];
        let min = m.mul(node.minPoint);
        let max = m.mul(node.maxPoint);
        // this.intersectables.push(new AABox(min, max, node.color));
        this.intersectables.push(new AABox(min, max, node.color));
        this.nodes.push(node);
    }
    visitTextureBoxNode(node: TextureBoxNode): void {
        // throw new Error('Method not implemented.');
    }
    visitCameraNode(node: CameraNode): void {
        // throw new Error('Method not implemented.');

        let center = this.stack[this.stack.length - 1].mul(node.center);
        let eye = node.eye.mul(1);
        eye.z -= 2;
        eye = this.stack[this.stack.length - 1].mul(node.eye);
        let up = this.stack[this.stack.length - 1].mul(node.up);
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
    visitGroupNodeCamera(node: GroupNode): void {
        // throw new Error('Method not implemented.');
    }
    visitPyramidNode(node: PyramidNode): void {
        // throw new Error('Method not implemented.');
        let mat = this.stack[this.stack.length - 1];
        let min = mat.mul(node.minPoint);
        let max = mat.mul(node.maxPoint);
        this.intersectables.push(new Pyramid(min, max, node.color));
        this.nodes.push(node);
    }

    /**
     * Calculates the closest node to the mouse position
     * @param sceneGraph sceneGraph to be rendered
     * @param mouse_x x coordinate of the mouse
     * @param mouse_y y coordinate of the mouse
     * @param context context of the canvas either CanvasRenderingContext2D or WebGL2RenderingContext
     * @returns the closest node to the mouse position
     */
    getSelectedNode(
        sceneGraph: Node,
        mouse_x: number,
        mouse_y: number,
        context: CanvasRenderingContext2D | WebGL2RenderingContext
    ): Node {
        this.intersection = new Intersection(Infinity, null, null);
        this.intersectables = [];
        this.nodes = [];
        this.camera = null;
        this.imageData = null;
        this.lightNodes = [];

        sceneGraph.accept(this);

        this.ray = Ray.makeRay(
            mouse_x,
            mouse_y,
            context.canvas.height,
            context.canvas.width,
            this.camera
        );

        let minIntersection = new Intersection(Infinity, null, null);
        let selectedNode: Node = null;
        for (
            let i = 0;
            i < this.intersectables.length && i < this.nodes.length;
            i++
        ) {
            try {
                this.intersection = this.intersectables[i].intersect(this.ray);
            } catch (e) {
                console.log(e);
                continue;
            }
            if (this.intersection && this.intersection.closerThan(minIntersection)) {
                console.log("New minIntersection found: " + this.intersection);
                minIntersection = this.intersection;
                selectedNode = this.nodes[i];
            }
        }
        return selectedNode;
    }
}
