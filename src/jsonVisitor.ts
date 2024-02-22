import AnimationNode from "./nodes/animation-nodes"
import Visitor from "./visitor"; // Import the missing 'Visitor' class
import GroupNode from "./nodes/group-node";
import AABoxNode from "./nodes/aabox-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/sphere-node";
import lightNode from "./nodes/light-node";
import { Transformation } from "./math/transformation";
import TextureBoxNode from "./nodes/texture-box-node";
import Node from "./nodes/node";
import CameraNode from "./nodes/camera-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import { Scenegraph } from "./scenegraph";
import MeshNode from "./nodes/mesh-node";
import TextureTextBoxNode from "./nodes/texture-text-box-node";
import { WindowNode } from "./nodes/window-node";


export default class JsonVisitor implements Visitor {

    serialScene: any // sceneObject
    lastCode: number
    parentCodeStack: string[]
    animationsNodes: AnimationNode[]



    // save the scene graph to a JSON file
    // sceneGraphRootNode is first Object in JSON file
    // cameraNode is second Object in JSON file
    saveSceneGraph(sceneGraph: Scenegraph) {
        const root = Scenegraph.getGraph()
        this.animationsNodes = Scenegraph.getAnimationNodes()
        this.lastCode = 0 //How far inside the tree we are
        const code = this.nextCode(); //Traverse one further 
        this.serialScene = {}
        this.serialScene["root"] = { childCodes: [] }
        this.parentCodeStack = ["root"]
        root.accept(this)
        const serialScene = JSON.stringify(this.serialScene);
        this.download(serialScene, "scene.json", "JSON")
    }

    // visit leafNode and add it to the sceneGraph in serialScene
    private visitLeafNode(node: Node) {
        console.log("Current Node in visitLeafNodes: ", node);
        const code = this.nextCode();
        const toJSON = (node).toJSON();
        this.serialScene[code] = toJSON
        this.addChildCodeToParentNode(code)
        return code
    }


    // add child code to parent node to create SceneGraphStructure
    private addChildCodeToParentNode(code: string) {
        console.log("Current Code in addChildCodeToParentNode: ", code);

        const parentCode = this.parentCodeStack[this.parentCodeStack.length - 1];
        console.log("Parent code: ", code);
        const parentNode = this.serialScene[parentCode] as SerializeGroupNode;
        console.log("Current ParentNode in addChildCodeToParentNode: ", parentNode);

        parentNode.childCodes.push(code)
    }


    // generate next code for the node
    private nextCode(): string {
        let nextCode = "" + this.lastCode++
        return nextCode.padStart(4, "0")
    }


    // get all the animation nodes from the scene graph as a list
    // FIXME: getFunction should return the list
    private getAnimationNodes() {
        const animationNodes = Scenegraph.getAnimationNodes();
        this.serialScene.animationNodes = []
        for (let animationNode of animationNodes) {
            this.serialScene.animationNodes.push()
        }

    }

    // methods for visiting nodes


    // visiting froup node and its children
    visitGroupNode(node: GroupNode) {
        const code = this.visitLeafNode(node);

        this.parentCodeStack.push(code)
        for (let child of node.children) {
            child.accept(this)
        }
        this.parentCodeStack.pop()
    }

    // visiting AABoxNode
    visitAABoxNode(node: AABoxNode): void {
        this.visitLeafNode(node)
    }

    // visiting PyramidNode
    visitPyramidNode(node: PyramidNode): void {
        this.visitLeafNode(node)
    }

    // visiting SphereNode
    visitSphereNode(node: SphereNode): void {
        this.visitLeafNode(node)
    }

    // visiting TextureBoxNode
    visitTextureBoxNode(node: TextureBoxNode): void {
        this.visitLeafNode(node)
    }

    // visiting lightNode
    visitLightNode(node: lightNode): void {
        this.visitLeafNode(node)
    }

    // visiting CameraNode 
    // !!! CAMERA IS SAVED SEPARATELY IN THE saveSceneGraph method
    visitCameraNode(node: CameraNode): void {
        this.visitLeafNode(node)
    }

    // visiting GroupNodeCamera
    visitGroupNodeCamera(node: GroupNode): void {
        this.visitLeafNode(node)
    }

    // visiting TextureVideoBoxNode
    visitTextureVideoBoxNode(node: TextureVideoBoxNode): void {
        this.visitLeafNode(node)
    }

    // visiting AnimationNode
    visitAnimationNode(node: AnimationNode) {
        // const code = this.visitLeafNode(node);
        // this.parentCodeStack.push(code)
        // node.groupNode.accept(this)
        // this.parentCodeStack.pop()
        this.visitLeafNode(node);
    }

    // TODO: visiting TextureTextBoxNode
    visitTextureTextBoxNode(node: TextureTextBoxNode): void {
        this.visitLeafNode(node)
    }

    // TODO: visiting MeshNode
    visitMeshNode(node: MeshNode): void {
        this.visitLeafNode(node)
    }

    visitWindowNode(node: WindowNode): void {
        const code = this.visitLeafNode(node);

        this.parentCodeStack.push(code)
        for (let child of node.children) {
            child.accept(this)
        }
        this.parentCodeStack.pop()

    }


    // create a download link for the JSON file
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

// classes for serializing the scene graph

// class for serializing nodes
class SerializeNode {
    classname: string

    constructor(node: Node) {
        this.classname = node.constructor.name
    }
}

// class for serializing group node
class SerializeGroupNode extends SerializeNode {
    childCodes: string[]
    transformation: { type: string, transformation: Transformation }

    constructor(node: GroupNode) {
        super(node);
        this.transformation = { type: node.transform.constructor.name, transformation: node.transform }
        this.childCodes = []
    }

}

