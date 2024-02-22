import Node from './node';
import Visitor from '../visitor';
import GroupNode from './group-node';
import { Transformation, Translation } from '../math/transformation';
import Vector from '../math/vector';
import AABoxNode from './aabox-node';
import SphereNode from './sphere-node';
import { DriverNode, DriverNodeMouse, ScaleNode } from './animation-nodes';

// variables for the windows
const windowDimension = new Vector(3, 3, 0, 1);
const windowBackgroundColor = new Vector(0.8, 0.8, 0.8, 1);

const windowMenuDimension = new Vector(3, 0.5, 0.01, 1);
const windowMenuBackgroundColor = new Vector(0, 0, 1, 1);

const minimizeSphereDimension = new Vector(1.3, 0, 0, 1);
const minimizeSphereRadius = 0.13;
const minimizeSphereColor = new Vector(0.9, 0.7, 0.3, 1);

const maximizeSphereColor = new Vector(0, 0.7, 0.3, 1);
const maximizeSphereDimension = new Vector(0.9, 0, 0, 1);

let scaleNode: ScaleNode = new ScaleNode(this, new Vector(0, 0, 0, 0), 1);


export class WindowNode extends GroupNode {

    private state: { minimized: boolean }
    private fullscreen: boolean = false;
    private fullscrenVector: Vector = new Vector(0, 0, 0, 1);

    constructor(public transform: Transformation, windowName: string) {
        super(transform);
        this.state = { minimized: false };

        this.name = windowName; // Name of the node

        const windowBackground = new AABoxNode(windowDimension, windowBackgroundColor);
        this.add(windowBackground);

        const windowMenuRoot = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
        const windowMenu = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
        windowMenuRoot.add(windowMenu);

        const windowMinimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
        windowMinimizeSphere.name = "minimizeSphere" + windowName;
        windowMenuRoot.add(windowMinimizeSphere);

        const windowMaximizeSphere = new SphereNode(maximizeSphereColor, maximizeSphereDimension, minimizeSphereRadius);
        windowMaximizeSphere.name = "maximizeSphere" + windowName;
        windowMenuRoot.add(windowMaximizeSphere);
        this.add(windowMenuRoot);
    }

    public toggleMinMax() {
        if (this.state.minimized) {
            this.maximize();
        } else {
            this.minimize();
        }
    }

    public fullScreen(cameraGroup: GroupNode, windowRootNode: GroupNode) {
        if (this.fullscreen) {
            this.fullscreen = false;
            this.fullscrenVector = this.fullscrenVector.mul(-1);
        } else {
            // Offset for the camera position relative to the window root node
            const offset = new Vector(0.02300000000000013, 0.1, -2, 0);

            // Position of the current window root node in world space
            const windowRootWorldPosition = windowRootNode.transform.getMatrix().mul(new Vector(0, 0, 0, 1));

            // Calculate the desired camera position for the current window by adding the offset to the window root node's position
            const desiredCameraPosition = windowRootWorldPosition.add(offset);

            this.fullscrenVector = desiredCameraPosition;
            this.fullscreen = true;
        }
        const animation = new DriverNode(cameraGroup, this.fullscrenVector, 0.002, false);
        cameraGroup.add(animation);
        animation.toggleActive();
    }

    /**
     * Updates the scale node of the window.
     * If the scale node already exists in the children array, it is replaced with the new scale node.
     * Otherwise, the new scale node is added to the children array.
     */
    private updateScaleNode(targetScale: Vector, duration: number, name?: string) {
        scaleNode.groupNode = this;
        scaleNode.targetScale = targetScale;
        scaleNode.duration = duration;
        scaleNode.elapsedTime = 0;
        scaleNode.name = name;
        const index = this.children.findIndex(child => child === scaleNode);
        if (index !== -1) {
            this.children[index] = scaleNode;
        } else {
            this.children.push(scaleNode);
        }
    }

    /**
     * Minimizes the window node if the scale node is not active.
     * Only minimizes if the scale node is not active.
     */
    private minimize() {
        // only minimize if the scale node is not active
        if (!scaleNode.active) {
            const originalScale = new Vector(1, 1, 1, 1);
            const scaleAmout = 0.001;
            const targetScale = originalScale.mul(scaleAmout);
            const duration = 5000; // in milliseconds
            scaleNode.toggleActive();
            this.updateScaleNode(targetScale, duration, "minimize");
            this.state.minimized = true;
        }
    }


    /**
     * Maximizes the window node.
     * Only maximizes if the scale node is not active.
     */
    private maximize() {
        // only maximize if the scale node is not active
        if (!scaleNode.active) {
            const targetScale = new Vector(1.001, 1.001, 1.001, 1);
            const duration = 2; // 2 Sekunden Dauer der Animation
            scaleNode.toggleActive();
            this.updateScaleNode(targetScale, duration, "maximize");
            this.state.minimized = false;
        }
    }



    accept(visitor: Visitor) {
        visitor.visitGroupNode(this);
    }

    toJSON() {
        return {
            transform: this.transform,
            state: this.state,
            fullscreen: this.fullscreen,
            fullscrenVector: this.fullscrenVector,
            children: this.children,
            name: this.name
        }
    }
}