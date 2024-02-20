import JsonVisitor from "./jsonVisitor";
import AnimationNode, { DriverNode, DriverNodeMouse, RotationNode, ScalerNodeMouse } from "./nodes/animation-nodes";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import SphereNode from "./nodes/sphere-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import { EmptyTransformation, RotateWithPosition, Rotation, Scaling, Transform4x4, Translation } from "./transformation";
import Vector from "./vector";
import AABoxNode from "./nodes/aabox-node";
import { JsonLoader } from "./jsonLoader";
import { RasterSetupVisitor, RasterVisitor } from "./rasterzier/rastervisitor";
import Visitor from "./visitor";
import TextureTextBoxNode from "./nodes/texture-text-box-node";
import MeshNode from "./nodes/mesh-node";
import { Game } from "./game";
import { WindowNode } from "./nodes/window-node";
import Node from "./nodes/node";
import Matrix from "./matrix";
import CameraNode from "./nodes/camera-node";

/**
 * Represents a scenegraph that holds the hierarchy of nodes in a 3D scene.
 */
export class Scenegraph {

    private static sceneGraph: GroupNode;
    private static animationNodesList: AnimationNode[] = [];
    private static driver: DriverNode;
    private static camera: CameraNode;
    private static TicTacToe: Game = new Game();

    static getGraph() {
        if (!this.sceneGraph) {
            alert("No Nodes in Scenegraph initialized! Please put Nodes in the scenegraph  first");
        }
        return this.sceneGraph;
    }

    static getToWorld(node: Node): Matrix {
        let myGraph = this.getGraph();
        let worldMatrix = Matrix.identity();

        // traverse the graph to find the node, if the node is a group node check the children
        let found = this._getToWorld(myGraph, node, worldMatrix);

        if (!found) {
            throw new Error("Node not found in the scenegraph");
        }

        return found;
    }

    static _getToWorld(node: Node, searchNode: Node, worldMatrix: Matrix): Matrix {
        if (node === searchNode) {
            return worldMatrix;
        }

        if (node instanceof GroupNode || node instanceof WindowNode) {
            for (let child of node.children) {
                let result = this._getToWorld(child, searchNode, worldMatrix.mul(node.transform.getMatrix()));
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    // get all nodes of the given type
    static getAllNodesOfType<T extends Node>(type: new (...args: any[]) => T): T[] {
        return this._getAllNodesOfType(this.sceneGraph, type);
    }

    // get all nodes of the given type
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
        if (node instanceof GroupNode && node.containsCamera(this.camera)) {
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

    static setGraph(sceneGraph: GroupNode) {
        this.sceneGraph = sceneGraph;
        return this;
    }

    static getAnimationNodes(): AnimationNode[] {
        return this.animationNodesList;
    }

    static setAnimationNodes(nodes: AnimationNode[]) {
        this.animationNodesList = nodes
    }

    static setAnimationNode(node: AnimationNode) {
        this.animationNodesList.push(node)
    }

    static getDriver() {
        return this.driver
    }

    static getCamera() {
        return this.camera
    }

    static toJSON() {
        new JsonVisitor().saveSceneGraph(this.sceneGraph)
    }

    //TODO: Animation Visitor/ flexible for ray and raster
    static fromJSON(file: File, visitor: RasterVisitor) {
        JsonLoader.JsonToScenegraph(file)
            .then(loaded => {
                Scenegraph.camera = loaded.camera
                console.log("setup new camera from json", Scenegraph.camera);

                Scenegraph.setGraph(loaded.sg)
                //const animationNodes = new AnimationVisitor().visit(loaded.sg);
                //Scenegraph.setAnimationNodes(animationNodes)
                visitor.render(loaded.sg, loaded.camera)
            });
    }

    static async createProjectGraph(canvasWidth: number, canvasHeight: number, rasterSetupVisitor: RasterSetupVisitor) {
        /***************************************************************/
        /*********************  START OF SCENEGRAPH *********************/
        /***************************************************************/
        this.sceneGraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
        this.camera = new CameraNode(
            new Vector(0, 0, 0, 1), // eye
            new Vector(0, 0, -1, 1), // center
            new Vector(0, 1, 0, 0), // up
            60, // fov
            canvasWidth / canvasHeight, // aspect
            0.1, // near
            100
        ); // far

        const groupNodeCamera = new GroupNode(new Translation(new Vector(0, 0, 0, 1)));
        groupNodeCamera.add(this.camera);
        groupNodeCamera.name = "groupNodeCamera";
        groupNodeCamera.add(this.camera);
        //const driverNodeMouse = new DriverNodeMouse(groupNodeCamera);


        //driverNodeMouse.toggleActive();

        //groupNodeCamera.add(driverNodeMouse);
        // window root von assi toni: -1.8, 0, -1, 0
        //Translate to assi toni new Vector(-1.777, 0.1, -3, 0)
        const driveToMouse = new DriverNode(groupNodeCamera, new Vector(-1.777, 0.1, -3, 0), 0.002);
        //driveToMouse.toggleActive();
        groupNodeCamera.add(driveToMouse);
        this.sceneGraph.add(groupNodeCamera);

        //this.sceneGraph.add(this.camera);

        // add group node
        const groupNodeUnderRoot = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
        this.sceneGraph.add(groupNodeUnderRoot);

        // add light node 1
        // light1 = new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(0, 4, -2, 0));
        // groupNodeUnderRoot.add(light1);

        // add light node 2
        const groupNodeLight2 = new GroupNode(new Translation(new Vector(-2, -1, -5, 0)));
        const light2 = new LightNode(new Vector(1, 0, 0, 1), new Vector(0, 0, 0, 1));
        let lightSpehre = new SphereNode(new Vector(1, 1, 0, 1), new Vector(0, 0, 0, 1), 0.25);

        groupNodeLight2.add(light2);
        groupNodeLight2.add(lightSpehre);



        const groupNodeLight3 = new GroupNode(new Translation(new Vector(0, -1, -3, 0)));
        const light3 = new LightNode(new Vector(0, 1, 0, 1), new Vector(0, -1.5, -3, 1));

        groupNodeLight3.add(light3);
        groupNodeLight3.add(lightSpehre);

        const groupNodeLight4 = new GroupNode(new Translation(new Vector(2, -1, -5, 0)));
        const light4 = new LightNode(new Vector(0, 0, 1, 1), new Vector(0, 0, 0, 1));

        groupNodeLight4.add(light4);
        groupNodeLight4.add(lightSpehre);


        const animateLight2 = new DriverNode(groupNodeLight2, new Vector(2, 0, 0, 0), 0.0005);
        animateLight2.name = "animateLight2";
        animateLight2.toggleActive();

        const animateLight3 = new DriverNode(groupNodeLight3, new Vector(0, 2, 0, 0), 0.0005);
        animateLight3.name = "animateLight3";
        animateLight3.toggleActive();

        const animateLight4 = new DriverNode(groupNodeLight4, new Vector(0, 0, 2, 0), 0.0005);
        animateLight4.name = "animateLight4";
        animateLight4.toggleActive();

        groupNodeLight2.add(animateLight2);
        groupNodeLight3.add(animateLight3);
        groupNodeLight4.add(animateLight4);


        this.sceneGraph.add(groupNodeLight2);
        this.sceneGraph.add(groupNodeLight3);
        this.sceneGraph.add(groupNodeLight4);

        ///////////// ===== ADD TASKBAR ===== /////////////
        const taskbarButtonDimension = new Vector(.7, .7, .3, 0);
        const taskbarButtonColor = new Vector(0, 1, 0, 1);

        // add Taskbar to SceneGraph
        const taskbarGroup = new GroupNode(new Translation(new Vector(0, -3.3, -1, 0)));
        groupNodeUnderRoot.add(taskbarGroup);

        const taskBarBackground = new AABoxNode(new Vector(10, .2, .3, 0), new Vector(2, 2, 0, 1));
        taskbarGroup.add(taskBarBackground)

        //add Taskbar Button on the Right
        const taskbarButtonGroupRight = new GroupNode(new Translation(new Vector(2, .45, 0, 0)));
        taskbarButtonGroupRight.name = "taskbarButtonGroupRightWindow";
        const taskbarButtonRight = new AABoxNode(taskbarButtonDimension, null, "source-missing-texture.png");
        // const taskbarButtonRight = new AABoxNode(taskbarButtonDimension, taskbarButtonColor);
        taskbarButtonRight.name = "taskbarButtonRightWindow";
        taskbarButtonGroupRight.add(taskbarButtonRight)
        taskbarGroup.add(taskbarButtonGroupRight)

        // add Taskbar Buttons on the Left
        const taskbarButtonGroupLeft = new GroupNode(new Transform4x4(new Vector(-2, .45, 0, 0), new Rotation(new Vector(0, 1, 0, 0), Math.PI)));
        taskbarButtonGroupLeft.name = "taskbarButtonGroupLeftWindow";
        const taskbarButtonLeft = new AABoxNode(taskbarButtonDimension, taskbarButtonColor);
        taskbarButtonLeft.name = "taskbarButtonLeftWindow";
        taskbarButtonGroupLeft.add(taskbarButtonLeft)
        taskbarGroup.add(taskbarButtonGroupLeft)

        ///////////// ===== ADD RIGHT WINDOW ===== /////////////

        const rightWindowGroup = new WindowNode(new Translation(new Vector(1.8, 0, -1, 0)), "RightWindow");
        groupNodeUnderRoot.add(rightWindowGroup);
        // rightWindowGroup.add(rightWindowMenu);

        // Add ticTacToe to the right window
        const ticTacToeRoot = new GroupNode(new Translation(new Vector(-1.3, -1.4, 0, 0)));
        // ticTacToeRoot.add(createTicTacToe());
        // rightWindowGroup.add(ticTacToeRoot);
        ticTacToeRoot.add(this.TicTacToe.createTicTacToe());
        rightWindowGroup.add(ticTacToeRoot);

        ///////////// ===== ADD LEFT WINDOW ===== /////////////
        // groupNode for the secound application window
        const leftWindowGroup = new WindowNode(new Translation(new Vector(-1.8, 0, -5, 0)), "LeftWindow");
        // const leftWindowGroup = new WindowNode(new Translation(new Vector(-1.8, 0, -1, 0)), "LeftWindow");
        groupNodeUnderRoot.add(leftWindowGroup);

        // Add Texture box to the left window
        const textureBoxGroup = new GroupNode(new Translation(new Vector(-1.5, 1.2, 0, 0)));
        leftWindowGroup.add(textureBoxGroup);
        //const textureBox = new TextureBoxNode("source-missing-texture.png", new Vector(0.5, 0.5, 0.5, 1), new Vector(1, 1, 1, 1), "brickwall-normal.png");
        const textureVideoBox = new TextureVideoBoxNode("assitoni.mp4", new Vector(0, 0, 0, 1), new Vector(3, 1.5, 0.1, 1));

        const textureVideoBoxGroup = new GroupNode(new EmptyTransformation);
        let rotation = rotateWithPosition(textureVideoBoxGroup, 180);
        textureVideoBoxGroup.transform = rotation;


        textureBoxGroup.add(textureVideoBoxGroup);
        textureVideoBoxGroup.add(textureVideoBox);

        const meshPosition = new GroupNode(new Transform4x4(new Vector(0.8, 0.8, 0, 0), new Rotation(new Vector(1, 0, 0, 0), -90)));
        const meshScale = new GroupNode(new Scaling(new Vector(0.04, 0.04, 0.04, 1)));
        meshPosition.add(meshScale);

        (async () => {
            try {
                const object = await loadOBJ();
                console.log("Finished importing", object);
                meshScale.add(object);
                taskbarGroup.add(meshPosition);
                object.accept(rasterSetupVisitor);
            } catch (error) {
                console.log(error);
            }
        })();

        // const cube = new TextureBoxNode("source-missing-texture.png", new Vector(0, 0, 0, 1), new Vector(0.5, 0.5, 0.5, 1), "brickwall-normal.png");
        // meshPosition.add(cube);
        // leftWindowGroup.add(meshPosition);

        //const object = await MeshNode.getNode("monkey.obj", new Vector(1, 0, 0, 0));
        // let object = null;
        // MeshNode.getNode("monkey.obj", new Vector(1, 0, 0, 0)).then(monkey => {
        //   object = monkey;
        // }).catch(error => {
        //   // Handle any errors here
        //   console.log(error);

        // });
        // meshPosition.add(object);
        // leftWindowGroup.add(meshPosition);

        //Add animation node
        const animationNode = new RotationNode(meshPosition, new Vector(0, 1, 0, 0));
        // const animationNode3 = new JumperNode(taskbarButtonGroup2, new Vector(0, 1, 0, 0));

        // const animationNode4 = new DriverNode(gn1);
        // const animationNode3 = new ScaleNode(taskbarButtonGroup2, new Vector(-1, -1, -1, 0));
        animationNode.toggleActive();

        /***************************************************************/
        /*********************  END OF SCENE GRAPH *********************/
        /***************************************************************/
    }
}

async function loadOBJ() {
    const object = await MeshNode.getNode("towelie.obj", new Vector(0, 0.2, 1, 0));
    return object;
}

function rotateWithPosition(textureVideoBoxGroup: GroupNode, angle: number) {
    const position = textureVideoBoxGroup.transform.getMatrix();
    const inverse = textureVideoBoxGroup.transform.getInverseMatrix();
    // let rotation = new Rotation(new Vector(1, 0, 0, 0), 9.25); //Weird rotation ich raffs garnicht????
    let rotation = new Rotation(new Vector(1, 0, 0, 0), angle); //Weird rotation ich raffs garnicht????
    rotation.matrix = position.mul(rotation.getMatrix());
    rotation.inverse = rotation.getInverseMatrix().mul(inverse);
    return rotation;
}