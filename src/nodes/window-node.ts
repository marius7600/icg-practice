import Node from './node';
import Visitor from '../visitor';
import GroupNode from './group-node';
import { Transformation, Translation } from '../transformation';
import Vector from '../vector';
import AABoxNode from './aabox-node';
import SphereNode from './sphere-node';
import { ScaleNode } from './animation-nodes';

// variables for the windows
const windowDimension = new Vector(3, 3, 0, 1);
const windowBackgroundColor = new Vector(0.8, 0.8, 0.8, 1);

const windowMenuDimension = new Vector(3, 0.5, 0.01, 1);
const windowMenuBackgroundColor = new Vector(0, 0, 1, 1);

const minimizeSphereDimension = new Vector(1.3, 0, 0, 1);
const minimizeSphereRadius = 0.13;
const minimizeSphereColor = new Vector(0.9, 0.7, 0.3, 1);


export class WindowNode extends GroupNode {

    private state: { minimized: boolean }

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
        this.add(windowMenuRoot);
    }

    public toggleMinMax() {
        if (this.state.minimized) {
            this.maximize();
        } else {
            this.minimize();
        }
    }

    private minimize() {
        const originalScale = new Vector(1, 1, 1, 1);
        const scaleAmout = 0.001;
        const targetScale = originalScale.mul(scaleAmout);
        const duration = 5000; // in milliseconds

        let minMaxAnimation = new ScaleNode(this, targetScale, duration);
        minMaxAnimation.toggleActive();
        this.children.push(minMaxAnimation);
        this.state.minimized = true;
    }


    private maximize() {
        const targetScale = new Vector(1.001, 1.001, 1.001, 1);
        const duration = 2; // 2 Sekunden Dauer der Animation
        let minMaxAnimation = new ScaleNode(this, targetScale, duration);
        minMaxAnimation.toggleActive();
        this.children.push(minMaxAnimation);
        this.state.minimized = false;
    }
    accept(visitor: Visitor) {
        visitor.visitGroupNode(this);
    }
    toJSON() {
        const json = super.toJSON();
        return json;
    }
}