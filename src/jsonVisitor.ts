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

/*
* This class is used to visit all the nodes in the scene graph and save them as a JSON file.
* 
* The JSON file is saved as a string and then downloaded. 
*/
export default class JsonVisitor implements Visitor {

    serialScene: any // sceneObject
    lastCode: number //How far inside the tree we are
    parentCodeStack: string[] //Stack of parent node codes
    animationsNodes: AnimationNode[] //List of animation nodes




    /**
     * Saves the scene graph as a JSON file.
     * 
     * @param sceneGraph - The scene graph to be saved.
     */
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


    /**
     * Visits a leaf node, saves its properties to JSON.
     * 
     * @param node - The leaf node to be visited.
     * @returns The code generated for the leaf node.
     */
    private visitLeafNode(node: Node) {
        console.log("Current Node in visitLeafNodes: ", node);
        const code = this.nextCode();
        const toJSON = (node).toJSON();
        this.serialScene[code] = toJSON
        this.addChildCodeToParentNode(code)
        return code
    }



    /**
     * Adds the provided code as a child code to the parent node.
     * @param code The code to be added as a child code.
     */
    private addChildCodeToParentNode(code: string) {
        console.log("Current Code in addChildCodeToParentNode: ", code);

        const parentCode = this.parentCodeStack[this.parentCodeStack.length - 1];
        console.log("Parent code: ", code);
        const parentNode = this.serialScene[parentCode] as SerializeGroupNode;
        console.log("Current ParentNode in addChildCodeToParentNode: ", parentNode);

        parentNode.childCodes.push(code)
    }



    /**
     * Generates the next code in the sequence.
     * @returns The next code as a string.
     */
    private nextCode(): string {
        let nextCode = "" + this.lastCode++
        return nextCode.padStart(4, "0")
    }




    /*
    * Visiting the nodes
    */



    /**
     * Visits a GroupNode and its children.
     * 
     * @param node The GroupNode to visit.
     */
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
        this.visitLeafNode(node);
    }

    // visiting TextureTextBoxNode
    visitTextureTextBoxNode(node: TextureTextBoxNode): void {
        this.visitLeafNode(node)
    }

    // visiting MeshNode
    visitMeshNode(node: MeshNode): void {
        this.visitLeafNode(node)
    }

    // visiting WindowNode
    visitWindowNode(node: WindowNode): void {
        const code = this.visitLeafNode(node);

        this.parentCodeStack.push(code)
        for (let child of node.children) {
            child.accept(this)
        }
        this.parentCodeStack.pop()

    }



    /**
     * Downloads the specified data as a file with the given filename and type.
     * 
     * @param data - The data to be downloaded.
     * @param filename - The name of the file to be downloaded.
     * @param type - The MIME type of the file.
     */
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


// class for serializing nodes
/**
 * Represents a serialized node.
 */
class SerializeNode {
    classname: string

    constructor(node: Node) {
        this.classname = node.constructor.name
    }
}


/**
 * Represents a node used for serializing a group.
 */
class SerializeGroupNode extends SerializeNode {
    childCodes: string[]
    transformation: { type: string, transformation: Transformation }

    constructor(node: GroupNode) {
        super(node);
        this.transformation = { type: node.transform.constructor.name, transformation: node.transform }
        this.childCodes = []
    }

}

