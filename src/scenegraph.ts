import JsonVisitor from "./jsonVisitor";
import AnimationNode, { DriverNode, RotationNode } from "./nodes/animation-nodes";
import camera from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import SphereNode from "./nodes/shere-node";
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

export class Scenegraph {

    private static sceneGraph: GroupNode;
    private static animationNodesList: AnimationNode[] = [];
    private static driver: DriverNode;
    private static camera: camera;
    private static TicTacToe: Game = new Game();

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
        this.camera = new camera(
            new Vector(0, 0, 0, 1), // eye
            new Vector(0, 0, -1, 1), // center
            new Vector(0, 1, 0, 0), // up
            60, // fov
            canvasWidth / canvasWidth, // aspect
            0.1, // near
            100
        ); // far
        this.sceneGraph.add(this.camera);

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

        const animateLight2 = new DriverNode(groupNodeLight2, new Vector(2, 0, 0, 0), 0.0005);
        animateLight2.toggleActive();

        const animateLight3 = new DriverNode(groupNodeLight3, new Vector(0, 2, 0, 0), 0.0005);
        groupNodeLight2.add(animateLight2);
        groupNodeLight3.add(animateLight3);
        animateLight3.toggleActive();

        this.sceneGraph.add(groupNodeLight2);
        this.sceneGraph.add(groupNodeLight3);




        ///////////// ===== ADD TASKBAR ===== /////////////
        const taskbarButtonDimension = new Vector(.7, .7, .3, 0);
        const taskbarButtonColor = new Vector(0, 1, 0, 1);

        // add Taskbar to SceneGraph
        const taskbarGroup = new GroupNode(new Translation(new Vector(0, -3.3, -1, 0)));
        groupNodeUnderRoot.add(taskbarGroup);

        const taskBarBackground = new AABoxNode(new Vector(10, .2, .3, 0), new Vector(2, 2, 0, 1));
        taskbarGroup.add(taskBarBackground)

        //add Taskbar Button 1
        const taskbarButtonGroup1 = new GroupNode(new Translation(new Vector(2, .45, 0, 0)));
        const taskbarButton1 = new AABoxNode(taskbarButtonDimension, taskbarButtonColor);
        taskbarButtonGroup1.add(taskbarButton1)
        taskbarGroup.add(taskbarButtonGroup1)

        // add Taskbar Buttons 2
        const taskbarButtonGroup2 = new GroupNode(new Transform4x4(new Vector(-2, .45, 0, 0), new Rotation(new Vector(0, 1, 0, 0), Math.PI)));
        const taskbarButton2 = new AABoxNode(taskbarButtonDimension, taskbarButtonColor);
        taskbarButtonGroup2.add(taskbarButton2)
        taskbarGroup.add(taskbarButtonGroup2)

        ///////////// ===== WINDOW VARIABLES ===== /////////////
        // variables for the windows
        const windowDimension = new Vector(3, 3, 0, 1);
        const windowBackgroundColor = new Vector(0.8, 0.8, 0.8, 1);

        const windowMenuDimension = new Vector(3, 0.5, 0.01, 1);
        const windowMenuBackgroundColor = new Vector(0, 0, 1, 1);

        const minimizeSphereDimension = new Vector(1.3, 0, 0, 1);
        const minimizeSphereRadius = 0.13;
        const minimizeSphereColor = new Vector(0.9, 0.7, 0.3, 1);

        ///////////// ===== ADD RIGHT WINDOW ===== /////////////
        // groupNode for the first application window
        const rightWindowGroup = new GroupNode(new Translation(new Vector(1.8, 0, -1, 0)));
        groupNodeUnderRoot.add(rightWindowGroup);

        // add background for rightWindowGroup
        const rightWindowBackground = new AABoxNode(windowDimension, windowBackgroundColor);
        rightWindowGroup.add(rightWindowBackground);

        const rightWindowMenu = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
        const rightWindowMenuBackground = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
        rightWindowMenu.add(rightWindowMenuBackground);

        const rightWindowMinimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
        rightWindowMenu.add(rightWindowMinimizeSphere);

        rightWindowGroup.add(rightWindowMenu);

        // Add ticTacToe to the right window
        const ticTacToeRoot = new GroupNode(new Translation(new Vector(-1.3, -1.4, 0, 0)));
        // ticTacToeRoot.add(createTicTacToe());
        // rightWindowGroup.add(ticTacToeRoot);
        ticTacToeRoot.add(this.TicTacToe.createTicTacToe());
        rightWindowGroup.add(ticTacToeRoot);

        ///////////// ===== ADD LEFT WINDOW ===== /////////////
        // groupNode for the secound application window
        const leftWindowGroup = new GroupNode(new Translation(new Vector(-1.8, 0, -1, 0)));
        groupNodeUnderRoot.add(leftWindowGroup);

        // add background for leftWindowGroup
        const window2Background = new AABoxNode(windowDimension, windowBackgroundColor);
        leftWindowGroup.add(window2Background);

        // add menue bar for leftWindowGroup
        const leftWindowMenu = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
        leftWindowGroup.add(leftWindowMenu);

        // Add menue bar on window 2 
        const leftWindowMenuBackground = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
        leftWindowMenu.add(leftWindowMenuBackground);

        // Add minimize sphere on window 2
        const leftWindowMinimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
        leftWindowMenu.add(leftWindowMinimizeSphere);

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

function createTicTacToe() {
    // Scale the size of the cubes
    const ticTacToeScaling = new GroupNode(new Scaling(new Vector(1.5, 1.5, 1.5, 1)));
    //Add the cubes to the scaler
    let idCounter = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            //Position of the cubes in the tic tac toe
            const position = new GroupNode(new Translation(new Vector(i * 0.6, j * 0.6, 0, 1)));
            let cube = new TextureTextBoxNode("", new Vector(0, 0, 0, 1), new Vector(0.5, 0.5, 0.1, 1), idCounter);
            position.add(cube);
            ticTacToeScaling.add(position);
            idCounter++;
        }
    }
    return ticTacToeScaling;
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