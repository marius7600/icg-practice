import AABoxNode from './nodes/aabox-node';
import CameraNode from './nodes/camera-node';
import GroupNode from './nodes/group-node';
import LightNode from './nodes/light-node';
import PyramidNode from './nodes/pyramid-node';
import SphereNode from './nodes/shere-node';
import TextureBoxNode from './nodes/texture-box-node';

import Sphere from './raytracer/ray-sphere';
import AABox from './raytracer/aabox';

interface Intersectable {
    intersect(ray: Ray): Intersection | null;
}

import Matrix from './matrix';
import Intersection from './raytracer/intersection';

import Ray from './raytracer/ray';
import Visitor from './visitor';
export default class MouseVisitor implements Visitor {

    stack: Array<Matrix> = [];
    intersection: Intersection | null;
    objects: Array<Intersectable>;
    camera: CameraNode;
    imageData: ImageData;
    lightNodes: Array<LightNode> = [];

    constructor() {
        this.stack.push(Matrix.identity());
        this.intersection = null;
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
        this.objects.push(
            new Sphere(m.mul(node.center), node.radius * scale, node.color)
        );
    }
    visitAABoxNode(node: AABoxNode): void {
        // throw new Error('Method not implemented.');

        let m = this.stack[this.stack.length - 1];
        let min = m.mul(node.minPoint);
        let max = m.mul(node.maxPoint);
        this.objects.push(new AABox(min, max, node.color));
    }
    visitTextureBoxNode(node: TextureBoxNode): void {
        throw new Error('Method not implemented.');
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
        throw new Error('Method not implemented.');
    }
    visitPyramidNode(node: PyramidNode): void {
        throw new Error('Method not implemented.');
    }


    /**
     * Calculates the closest node to the mouse position
     * @param sceneGraph sceneGraph to be rendered
     * @param mouse_x x coordinate of the mouse
     * @param mouse_y y coordinate of the mouse
     * @returns the closest node to the mouse position
     */
    getSelectedNode(sceneGraph: GroupNode, mouse_x: number, mouse_y: number, context: CanvasRenderingContext2D): Node {
        let width = context.canvas.width;
        let height = context.canvas.height;

        let selectedNode: Node = null;
        sceneGraph.accept(this);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const ray = Ray.makeRay(x, y, height, width, this.camera);

                let minIntersection: Intersection = null;
                let minObject: Intersectable = null;

                for (let object of this.objects) {
                    const intersection = object.intersect(ray);
                    if (intersection && intersection.closerThan(minIntersection)) {
                        minIntersection = intersection;
                        minObject = object;
                    }
                }

            }
        }

        return selectedNode;
    }
}