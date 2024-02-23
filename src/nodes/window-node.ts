import Node from './node';
import Visitor from '../visitor';
import GroupNode from './group-node';
import { Transformation, Translation } from '../math/transformation';
import Vector from '../math/vector';
import AABoxNode from './aabox-node';
import SphereNode from './sphere-node';
import { DriverNode, InputDriverNode, ScaleNode } from './animation-nodes';

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

/**
 * Represents a window node in the application. 
 * The window node contains the window background, the window menu and the minimize and maximize spheres.
 * @extends GroupNode
 */
export class WindowNode extends GroupNode {

    /**
     * State representing if the window is minimized or not.
     */
    private state: { minimized: boolean }

    /**
     * Represents if the window is in fullscreen mode or not.
     */
    public fullscreen: boolean = false;

    /**
     * Represents the position of the camera in fullscreen mode.
     */
    public fullscrenVector: Vector = new Vector(0, 0, 0, 1);

    /**
     * Represents a window node in the application.
     * @param transform The transformation of the window node.
     * @param windowName The name of the window.
     */
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

    /**
     * Toggles the window between minimized and maximized state.
     */
    public toggleMinMax() {
        if (this.state.minimized) {
            this.maximize();
        } else {
            this.minimize();
        }
    }

    /**
     * Toggles the fullscreen mode of the window.
     * If the window is currently in fullscreen mode, it will exit fullscreen mode.
     * If the window is not in fullscreen mode, it will enter fullscreen mode.
     * @param cameraGroup - The camera group node.
     * @param windowRootNode - The window root node.
     */
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
     * Updates the scale node with the specified target scale, duration, and optional name.
     * @param targetScale - The target scale vector.
     * @param duration - The duration of the scaling animation.
     * @param name - Optional name for the scale node.
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

    /**
     * Accepts a visitor and calls the appropriate visit method.
     * @param visitor The visitor to accept.
     */
    accept(visitor: Visitor) {
        visitor.visitGroupNode(this);
    }

    /**
     * Converts the WindowNode object to a JSON representation.
     * @returns The JSON representation of the WindowNode object.
     */
    toJSON() {
        const json = super.toJSON();
        json["state"] = this.state;
        json["fullscreen"] = this.fullscreen;
        json["fullscrenVector"] = this.fullscrenVector.toJSON();
        return json
    }
}