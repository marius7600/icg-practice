import Node from "./node";
import AABox from "../raytracer/aabox";
import Vector from "../vector";
import GroupNode from "./group-node";
import Matrix from "../matrix";
import { EmptyTransformation, Translation } from "../transformation";
import AABoxNode from "./aabox-node";
import Visitor from "../visitor";

/*
Class representing a taskbar node.
Taskbar is always at the Bottom of the screen and represents a AABox.
Taskbar contains a list of windows which can be clicked to bring to the front.
*/
export default class TaskbarNode extends Node {
    public root: GroupNode;
    private bottom: GroupNode;

    constructor(
    ) {
        super();
        // root node with empty transformation
        this.root = new GroupNode(new EmptyTransformation());

        this.bottom = new GroupNode(new Translation(new Vector(0, -3, -2, 0)));

        this.root.add(this.bottom)
        const taskBarBox = new AABoxNode(new Vector(10, 1, 1, 0), new Vector(2, 2, 0, 1));
        this.bottom.add(taskBarBox)

    }

    accept(visitor: Visitor) {
        visitor.visitTaskbarNode(this);
    }
}