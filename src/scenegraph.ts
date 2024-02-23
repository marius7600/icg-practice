import JsonVisitor from "./jsonVisitor";
import AnimationNode, { DriverNode, InputDriverNode, RotationNode, InputScalerNode } from "./nodes/animation-nodes";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import SphereNode from "./nodes/sphere-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import { EmptyTransformation, RotateWithPosition, Rotation, Scaling, Transform4x4, Translation } from "./math/transformation";
import Vector from "./math/vector";
import AABoxNode from "./nodes/aabox-node";
import { JsonLoader } from "./jsonLoader";
import { RasterSetupVisitor, RasterVisitor } from "./rasterzier/rastervisitor";
import Visitor from "./visitor";
import TextureTextBoxNode from "./nodes/texture-text-box-node";
import MeshNode from "./nodes/mesh-node";
import { TicTacToe } from "./ticTacToe";
import { WindowNode } from "./nodes/window-node";
import Node from "./nodes/node";
import Matrix from "./math/matrix";
import CameraNode from "./nodes/camera-node";
import PyramidNode from "./nodes/pyramid-node";

/**
 * Represents a scenegraph that holds the hierarchy of nodes in a 3D scene.
 */
export class Scenegraph {

    private static sceneGraph: GroupNode;
    private static animationNodesList: AnimationNode[] = [];
    private static driver: DriverNode;
    private static camera: CameraNode;
    private static TicTacToe: TicTacToe = new TicTacToe();

    /**
     * Retrieves the scene graph.
     * @returns The scene graph.
     */
    static getGraph() {
        if (!this.sceneGraph) {
            alert("No Nodes in Scenegraph initialized! Please put Nodes in the scenegraph first");
        }
        return this.sceneGraph;
    }

    /**
     * Sets the scene graph for the application.
     * @param sceneGraph - The scene graph to set.
     */
    static setGraph(sceneGraph: GroupNode) {
        this.sceneGraph = sceneGraph;
    }

    /**
     * Retrieves all nodes of a specific type from the scene graph.
     * 
     * @template T - The type of nodes to retrieve.
     * @param type - The constructor function of the node type.
     * @returns An array of nodes of the specified type.
     */
    static getAllNodesOfType<T extends Node>(type: new (...args: any[]) => T): T[] {
        return this._getAllNodesOfType(this.sceneGraph, type);
    }


    /**
     * Recursive helper method to retrieve all nodes of a specific type from the scene graph.
     * @template T - The type of nodes to retrieve.
     * @param node - The root node to start the search from.
     * @param type - The constructor function of the node type to retrieve.
     * @returns An array of nodes of the specified type.
     */
    static _getAllNodesOfType<T extends Node>(node: Node, type: new (...args: any[]) => T): T[] {
        let nodes: T[] = [];
        if (node instanceof type) {
            nodes.push(node);
        }
        if (node instanceof GroupNode || node instanceof WindowNode) {
            for (let child of node.children) {
                nodes = nodes.concat(this._getAllNodesOfType(child, type));
            }
        }
        return nodes;
    }


    /**
     * Retrieves a GroupNode with the specified name from the scene graph.
     * 
     * @param name - The name of the GroupNode to retrieve.
     * @returns The GroupNode with the specified name, or null if not found.
     */
    static getGroupNode(name: string): GroupNode | null {
        return this._getGroupNode(this.sceneGraph, name);
    }

    /**
     * Retrieves a GroupNode with the specified name from the given Node and its descendants.
     * 
     * @param node - The root Node to search from.
     * @param name - The name of the GroupNode to retrieve.
     * @returns The GroupNode with the specified name, or null if not found.
     */
    static _getGroupNode(node: Node, name: string): GroupNode | null {
        if (node.name === name && node instanceof GroupNode) {
            return node;
        }

        if (node instanceof GroupNode || node instanceof WindowNode) {
            for (let child of node.children) {
                let result = this._getGroupNode(child, name);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }


    /**
     * Retrieves the WindowNode with the specified name from the scene graph.
     * 
     * @param name - The name of the WindowNode to retrieve.
     * @returns The WindowNode with the specified name, or null if not found.
     */
    static getWindowNode(name: string): WindowNode | null {
        return this._getWindowNode(this.sceneGraph, name);
    }


    /**
     * Recursively searches for a WindowNode with the specified name in the scene graph.
     * 
     * @param node - The starting node for the search.
     * @param name - The name of the WindowNode to find.
     * @returns The found WindowNode, or null if not found.
     */
    static _getWindowNode(node: Node, name: string): WindowNode | null {
        if (node.name === name && node instanceof WindowNode) {
            return node;
        }

        if (node instanceof GroupNode || node instanceof WindowNode) {
            for (let child of node.children) {
                let result = this._getWindowNode(child, name);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    /**
     * Get the groupNode over the camera node, so that the camera is the child 
     * of the groupNode.
     * @returns The groupNode over the camera node.
     */
    static getGroupNodeCamera(): GroupNode {
        return this._getGroupNodeCamera(this.sceneGraph);
    }

    /**
     * Recursively searches for the groupNode over the camera node in the scene graph.
     * 
     * @param node - The starting node for the search.
     * @returns The found groupNode over the camera node.
     */
    static _getGroupNodeCamera(node: Node): GroupNode {

        if (node instanceof GroupNode && node.containsCamera(this.getCamera())) {
            return node;
        }

        if (node instanceof GroupNode || node instanceof WindowNode) {
            for (let child of node.children) {
                let result = this._getGroupNodeCamera(child);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }


    /**
     * Retrieves the animation nodes from the scene graph.
     * @returns An array of AnimationNode objects.
     */
    static getAnimationNodes(): AnimationNode[] {
        return this.animationNodesList;
    }


    /**
     * Sets the animation node for the scene graph.
     * @param {AnimationNode} node - The animation node to be set.
     */
    static setAnimationNode(node: AnimationNode) {
        this.animationNodesList.push(node)
    }

    /**
     * Returns the camera object of the scene graph.
     * @returns The camera object.
     */
    static getCamera() {
        return this.camera
    }

    /**
     * Converts the scene graph to JSON format.
     * @returns {void}
     */
    static toJSON() {
        new JsonVisitor().saveSceneGraph(this.sceneGraph)
    }

    /**
     * Creates a scenegraph from a JSON file.
     * 
     * @param file - The JSON file to load.
     * @param visitor - The raster visitor.
     * @param rasterSetupVisitor - The raster setup visitor.
     */
    static fromJSON(file: File, visitor: RasterVisitor, rasterSetupVisitor: RasterSetupVisitor) {
        JsonLoader.JsonToScenegraph(file)
            .then(loaded => {
                this.camera = loaded.camera
                console.log("setup new camera from json", loaded.camera);
                console.log("Setup scenegraph:", loaded.sg)


                this.setGraph(loaded.sg)
                rasterSetupVisitor.setup(loaded.sg);
            });
    }

    /**
     * Creates the scene graph for the scene by adding all nodes to the scene graph. 
     * @param canvasWidth - The width of the canvas.
     * @param canvasHeight - The height of the canvas.
     * @param rasterSetupVisitor - The raster setup visitor.
     * @returns A Promise that resolves to the created scene graph.
     */
    static async createProjectGraph(canvasWidth: number, canvasHeight: number, rasterSetupVisitor: RasterSetupVisitor) {
        /***************************************************************/
        /*********************  START OF SCENEGRAPH *********************/
        /***************************************************************/
        this.sceneGraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
        //this.sceneGraph.name = "rootSceneGraph";
        this.camera = new CameraNode(
            new Vector(0, 0, 0, 1), // eye
            new Vector(0, 0, -1, 1), // center
            new Vector(0, 1, 0, 0), // up
            60, // fov
            canvasWidth / canvasHeight, // aspect
            0.1, // near
            100 // far
        );
        // Add group node for the camera 
        const groupNodeCamera = new GroupNode(new Translation(new Vector(0, 0, 0, 1)));
        this.camera.name = "sceneCamera";
        groupNodeCamera.add(this.camera);
        groupNodeCamera.name = "groupNodeCamera";

        // Add driver to the camera group node to move the camera
        const driveCamera = new DriverNode(groupNodeCamera, new Vector(-1.777, 0.1, -3, 0), 0.002);
        groupNodeCamera.add(driveCamera);
        this.sceneGraph.add(groupNodeCamera);

        // Group node under the root which contains all other nodes
        const groupNodeUnderRoot = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
        groupNodeUnderRoot.name = "groupNodeUnderRoot";
        this.sceneGraph.add(groupNodeUnderRoot);

        // Group node holding the movable AABox
        const pyramidNode = new GroupNode(new Translation(new Vector(0, 2.15, 0, 0)));
        //const pyramidNode = new GroupNode(new Transform4x4(new Vector(0, 0, 0, 0), new Rotation(new Vector(1, 0, 0, 0), 180)));
        const pyramid = new PyramidNode(new Vector(1, 1, 1, 1), new Vector(1, 0, 1, 1));
        pyramid.name = "Testbox";
        pyramidNode.add(pyramid);



        // Driver for moving the AABox with W,A,S,D
        const driveBox = new InputDriverNode(pyramidNode);
        pyramidNode.add(driveBox);
        driveBox.toggleActive();
        groupNodeUnderRoot.add(pyramidNode);

        // Yellow light sphere
        let lightSpehre = new SphereNode(new Vector(1, 1, 0, 1), new Vector(0, 0, 0, 1), 0.25);

        // add light node 2
        const groupNodeLight2 = new GroupNode(new Translation(new Vector(-2, -1, -5, 0)));
        groupNodeLight2.name = "groupNodeLight2";
        const light2 = new LightNode(new Vector(1, 0, 0, 1), new Vector(0, 0, 0, 1));

        groupNodeLight2.add(light2);
        groupNodeLight2.add(lightSpehre);

        // add light node 3
        const groupNodeLight3 = new GroupNode(new Translation(new Vector(0, -3, -3, 0)));
        groupNodeLight3.name = "groupNodeLight3";
        const light3 = new LightNode(new Vector(0, 1, 0, 1), new Vector(0, -1.5, -3, 1));

        groupNodeLight3.add(light3);
        groupNodeLight3.add(lightSpehre);

        // add light node 4
        const groupNodeLight4 = new GroupNode(new Translation(new Vector(2, -1, -5, 0)));
        groupNodeLight4.name = "groupNodeLight4";
        const light4 = new LightNode(new Vector(0, 0, 1, 1), new Vector(0, 0, 0, 1));

        groupNodeLight4.add(light4);
        groupNodeLight4.add(lightSpehre);


        // Add animation nodes to the light nodes
        const animateLight2 = new DriverNode(groupNodeLight2, new Vector(2, 0, 0, 0), 0.0005, true);
        animateLight2.name = "animateLight2";
        animateLight2.toggleActive();

        const animateLight3 = new DriverNode(groupNodeLight3, new Vector(0, 3, 0, 0), 0.0005, true);
        animateLight3.name = "animateLight3";
        animateLight3.toggleActive();

        const animateLight4 = new DriverNode(groupNodeLight4, new Vector(0, 0, 2, 0), 0.0005, true);
        animateLight4.name = "animateLight4";
        animateLight4.toggleActive();

        groupNodeLight2.add(animateLight2);
        groupNodeLight3.add(animateLight3);
        groupNodeLight4.add(animateLight4);


        // Add the light nodes to the scene graph
        this.sceneGraph.add(groupNodeLight2);
        this.sceneGraph.add(groupNodeLight3);
        this.sceneGraph.add(groupNodeLight4);

        ///////////// ===== ADD TASKBAR ===== /////////////
        const taskbarButtonDimension = new Vector(.7, .7, .3, 0);
        const taskbarButtonColor = new Vector(0, 1, 0, 1);

        // add Taskbar to SceneGraph
        const taskbarGroup = new GroupNode(new Translation(new Vector(0, -3.3, -1, 0)));
        taskbarGroup.name = "taskbarGroup";
        groupNodeUnderRoot.add(taskbarGroup);

        const taskBarBackground = new AABoxNode(new Vector(10, .2, .3, 0), new Vector(2, 2, 0, 1));
        taskbarGroup.add(taskBarBackground)

        //add Taskbar Button on the Right
        const taskbarButtonGroupRight = new GroupNode(new Translation(new Vector(2, .45, 0, 0)));
        taskbarButtonGroupRight.name = "taskbarButtonGroupRightWindow";
        const taskbarButtonRight = new AABoxNode(taskbarButtonDimension, null, "tictactoe.png");
        taskbarButtonRight.name = "taskbarButtonRightWindow";
        taskbarButtonGroupRight.add(taskbarButtonRight)
        taskbarGroup.add(taskbarButtonGroupRight)

        // add Taskbar Buttons on the Left
        const taskbarButtonGroupLeft = new GroupNode(new Translation(new Vector(-2, .45, 0, 0)));
        taskbarButtonGroupLeft.name = "taskbarButtonGroupLeftWindow";
        const taskbarButtonLeft = new AABoxNode(taskbarButtonDimension, null, "psychoandreas.png");
        taskbarButtonLeft.name = "taskbarButtonLeftWindow";
        taskbarButtonGroupLeft.add(taskbarButtonLeft)
        taskbarGroup.add(taskbarButtonGroupLeft)

        ///////////// ===== ADD RIGHT WINDOW ===== /////////////

        const rightWindowGroup = new WindowNode(new Translation(new Vector(1.8, 0, -1, 0)), "RightWindow");
        groupNodeUnderRoot.add(rightWindowGroup);

        // Add ticTacToe to the right window
        const ticTacToeRoot = new GroupNode(new Translation(new Vector(-1.3, -1.4, 0, 0)));
        ticTacToeRoot.name = "ticTacToeRoot";
        ticTacToeRoot.add(this.TicTacToe.createTicTacToe());
        rightWindowGroup.add(ticTacToeRoot);

        ///////////// ===== ADD LEFT WINDOW ===== /////////////

        const leftWindowGroup = new WindowNode(new Translation(new Vector(-1.8, 0, -1, 0)), "LeftWindow");
        groupNodeUnderRoot.add(leftWindowGroup);

        // Add Texture box to the left window
        const textureBoxGroup = new GroupNode(new Translation(new Vector(-1.5, 1.2, 0, 0)));
        textureBoxGroup.name = "textureBoxGroup";
        leftWindowGroup.add(textureBoxGroup);

        const textureVideoBoxGroup = new GroupNode(new EmptyTransformation);
        textureVideoBoxGroup.name = "textureVideoBoxGroup";
        let rotation = rotateWithPosition(textureVideoBoxGroup, 180);
        textureVideoBoxGroup.transform = rotation;

        const textureVideoBox = new TextureVideoBoxNode("fish.mp4", new Vector(0, 0, 0, 1), new Vector(3, 1.5, 0.1, 1));

        textureBoxGroup.add(textureVideoBoxGroup);
        textureVideoBoxGroup.add(textureVideoBox);

        // Add mesh Node
        const meshPosition = new GroupNode(new Translation(new Vector(0, .2, -2, 0)));
        meshPosition.name = "meshPosition";
        const meshScale = new GroupNode(new Scaling(new Vector(0.8, 0.8, 0.8, 1)));
        meshScale.name = "meshScale";
        meshPosition.add(meshScale);

        // async function to load the mesh
        (async () => {
            try {
                const object = await loadOBJ();
                console.log("Finished importing", object);
                meshScale.add(object);
                meshPosition.add(meshScale);
                taskbarGroup.add(meshPosition);
                object.accept(rasterSetupVisitor);
            } catch (error) {
                console.log(error);
            }
        })();

        // /***************************************************************/
        // /*********************  END OF SCENE GRAPH *********************/
        // /***************************************************************/
    }
}

/**
 * Loads an OBJ file and returns a mesh object.
 * Asynchronously because it take some time to load the mesh.
 * @returns {Promise<MeshNode>} A promise that resolves to the loaded mesh object.
 */
async function loadOBJ() {
    const object = await MeshNode.getNode("cube.obj", new Vector(0, 0.2, 1, 0));
    return object;
}


/**
 * Rotates a group node with a given angle.
 * @param groupNodeToRotate - The group node to rotate.
 * @param angle - The angle of rotation in radians.
 * @returns The rotation transformation applied to the group node.
 */
function rotateWithPosition(groupNodeToRotate: GroupNode, angle: number) {
    const position = groupNodeToRotate.transform.getMatrix();
    const inverse = groupNodeToRotate.transform.getInverseMatrix();
    let rotation = new Rotation(new Vector(1, 0, 0, 0), angle);
    rotation.matrix = position.mul(rotation.getMatrix());
    rotation.inverse = rotation.getInverseMatrix().mul(inverse);
    return rotation;
}