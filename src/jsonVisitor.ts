import AnimationNode from "./nodes/animation-nodes"
import Visitor from "./visitor"; // Import the missing 'Visitor' class
import GroupNode from "./nodes/group-node";
import AABoxNode from "./nodes/aabox-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/shere-node";
import lightNode from "./nodes/light-node";
import { Transformation } from "./transformation";
import TextureBoxNode from "./nodes/texture-box-node";
import Node from "./nodes/node";
import CameraNode from "./nodes/camera-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import { Scenegraph } from "./scenegraph";
import MeshNode from "./nodes/mesh-node";
import TextureTextBoxNode from "./nodes/texture-text-box-node";


export default class JsonVisitor implements Visitor {
    visitTextureTextBoxNode(node: TextureTextBoxNode): void {
        throw new Error("Method not implemented.");
    }
    visitMeshNode(node: MeshNode): void {
        throw new Error("Method not implemented.");
    }
    serialScene: any
    lastCode: number
    parentCodeStack: string[]
    animationsNodes: AnimationNode[]



    saveSceneGraph(sceneGraph: Scenegraph) {
        const root = Scenegraph.getGraph()
        this.animationsNodes = Scenegraph.getAnimationNodes()
        this.lastCode = 0
        const code = this.nextCode();
        this.serialScene = {}
        this.serialScene["root"] = { childCodes: [] }
        this.serialScene["camera"] = Scenegraph.getCamera()
        this.parentCodeStack = ["root"]
        root.accept(this)
        const serialScene = JSON.stringify(this.serialScene);
        this.download(serialScene, "scene.json", "JSON")
    }


    private getAnimationNodes() {
        const animationNodes = Scenegraph.getAnimationNodes();
        this.serialScene.animationNodes = []
        for (let animationNode of animationNodes) {
            this.serialScene.animationNodes.push()
        }

    }

    visitGroupNode(node: GroupNode) {
        const code = this.visitLeafNode(node);

        this.parentCodeStack.push(code)
        for (let child of node.children) {
            child.accept(this)
        }
        this.parentCodeStack.pop()
    }

    visitAABoxNode(node: AABoxNode): void {
        this.visitLeafNode(node)
    }

    visitPyramidNode(node: PyramidNode): void {
        this.visitLeafNode(node)
    }

    visitSphereNode(node: SphereNode): void {
        this.visitLeafNode(node)
    }


    visitTextureBoxNode(node: TextureBoxNode): void {
        this.visitLeafNode(node)
    }


    visitLightNode(node: lightNode): void {
        this.visitLeafNode(node)
    }

    visitCameraNode(node: CameraNode): void {
        //this.visitLeafNode(node)
    }

    visitGroupNodeCamera(node: GroupNode): void {
        this.visitLeafNode(node)
    }

    visitTextureVideoBoxNode(node: TextureVideoBoxNode): void {
        this.visitLeafNode(node)
    }

    visitAnimationNode(node: AnimationNode) {
        const code = this.visitLeafNode(node);
        this.parentCodeStack.push(code)
        node.groupNode.accept(this)
        this.parentCodeStack.pop()
    }


    private visitLeafNode(node: Node) {
        const code = this.nextCode();
        const toJSON = (node).toJSON();
        this.serialScene[code] = toJSON
        this.addChildCodeToParentNode(code)
        return code
    }

    private addChildCodeToParentNode(code: string) {

        const parentCode = this.parentCodeStack[this.parentCodeStack.length - 1];
        const parentNode = this.serialScene[parentCode] as SerializeGroupNode;
        parentNode.childCodes.push(code)
    }

    private nextCode(): string {
        let nexCode = "" + this.lastCode++
        return nexCode.padStart(4, "0")
    }

    private download(data: string, filename: string, type: string) {
        var file = new Blob([data], { type: type });
        // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        // window.open(url)
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);

    }


};

class SerializeNode {
    classname: string

    constructor(node: Node) {
        this.classname = node.constructor.name
    }
}

class SerializeGroupNode extends SerializeNode {
    childCodes: string[]
    transformation: { type: string, transformation: Transformation }

    constructor(node: GroupNode) {
        super(node);
        this.transformation = { type: node.transform.constructor.name, transformation: node.transform }
        this.childCodes = []

    }

}

