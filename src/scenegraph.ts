import JsonVisitor from "./jsonVisitor";
import AnimationNode, { DriverNode } from "./nodes/animation-nodes";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import SphereNode from "./nodes/shere-node";
import { EmptyTransformation, Translation } from "./transformation";
import Vector from "./vector";

export class Scenegraph {

    private static sceneGraph: GroupNode;
    private static animationNodes: AnimationNode[] = [];
    private static driver: DriverNode;

    static getGraph() {
        if (!this.sceneGraph) {
            alert("No Nodes in Scenegraph initialized! Please put Nodes in the scenegraph  first");
        }
        return this.sceneGraph;
    }

    static setGraph(sceneGraph: GroupNode) {
        this.sceneGraph = sceneGraph;
        return this;
    }

    static getAnimationNodes(): AnimationNode[] {
        return this.animationNodes;
    }

    static setAnimationNodes(nodes: AnimationNode[]) {
        this.animationNodes = nodes
    }

    static getDriver() {
        return this.driver
    }

    static toJSON() {
        new JsonVisitor().saveSceneGraph(this.sceneGraph)
    }

    // static fromJSON(file: File) {
    //     JsonLoader.JsonToScenegraph(file)
    //         .then(loaded => {
    //             Renderer.getInstance().camera = loaded.camera
    //             Scenegraph.setGraph(loaded.sg)
    //             const animationNodes = new AnimationVisitor().visit(loaded.sg);
    //             Scenegraph.setAnimationNodes(animationNodes)
    //             Renderer.getInstance().update()
    //         });


    // }
}
