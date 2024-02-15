import JsonVisitor from "./jsonVisitor";
import AnimationNode, { DriverNode, RotationNode } from "./nodes/animation-nodes";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import SphereNode from "./nodes/shere-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import { EmptyTransformation, RotateWithPosition, Rotation, Transform4x4, Translation } from "./transformation";
import Vector from "./vector";
import AABoxNode from "./nodes/aabox-node";

export class Scenegraph {

    private static sceneGraph: GroupNode;
    private static animationNodes: AnimationNode[] = [];
    private static driver: DriverNode;
    private static camera: CameraNode;

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

    static getCamera() {
        return this.camera
    }

    static toJSON() {
        new JsonVisitor().saveSceneGraph(this.sceneGraph)
    }

    // static fromJSON(file: File) {
    //     JsonLoader.JsonToScenegraph(file)
    //         .then(loaded => {
    //             Scenegraph.camera = loaded.camera
    //             Scenegraph.setGraph(loaded.sg)
    //             const animationNodes = new AnimationVisitor().visit(loaded.sg);
    //             Scenegraph.setAnimationNodes(animationNodes)
    //             Renderer.getInstance().update()
    //         });


    // }

    static async createProjectGraph(canvasWith: number, canvasHeight: number) {
        /***************************************************************/
        /*********************  START OF SCENEGRAPH *********************/
        /***************************************************************/

        this.sceneGraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
        const cameraNode = new CameraNode(
            new Vector(0, 0, 0, 1), // eye
            new Vector(0, 0, -1, 1), // center
            new Vector(0, 1, 0, 0), // up
            60, // fov
            canvasWith / canvasHeight, // aspect
            0.1, // near
            100); // far

        this.camera = cameraNode;

        this.sceneGraph.add(cameraNode);

        // add group node
        const groupNode1 = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
        this.sceneGraph.add(groupNode1);

        // add light node
        const light1 = new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(0, 4, -2, 0));
        groupNode1.add(light1);


        const taskbarButtonDimension = new Vector(.7, .7, .3, 0);
        const taskbarButtonColor = new Vector(0, 1, 0, 1);

        // add Taskbar to SceneGraph
        const taskbarGroup = new GroupNode(new Translation(new Vector(0, -3.3, -1, 0)));
        groupNode1.add(taskbarGroup);

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

        // variables for the windows
        const windowDimension = new Vector(3, 3, 0, 1);
        const windowBackgroundColor = new Vector(0.8, 0.8, 0.8, 1);

        const windowMenuDimension = new Vector(3, 0.5, 0.01, 1);
        const windowMenuBackgroundColor = new Vector(0, 0, 1, 1);

        const minimizeSphereDimension = new Vector(1.3, 0, 0, 1);
        const minimizeSphereRadius = 0.13;
        const minimizeSphereColor = new Vector(0.9, 0.7, 0.3, 1);

        // groupNode for the first application window
        const windowGroup1 = new GroupNode(new Translation(new Vector(1.8, 0, -1, 0)));
        groupNode1.add(windowGroup1);

        // add background for windowGroup1
        const window1Background = new AABoxNode(windowDimension, windowBackgroundColor);
        windowGroup1.add(window1Background);

        const window1Menu = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
        const window1MenuBackground = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
        window1Menu.add(window1MenuBackground);

        const window1minimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
        window1Menu.add(window1minimizeSphere);

        windowGroup1.add(window1Menu);

        // groupNode for the secound application window
        const windowGroup2 = new GroupNode(new Translation(new Vector(-1.8, 0, -1, 0)));
        groupNode1.add(windowGroup2);

        // add background for windowGroup2
        const window2Background = new AABoxNode(windowDimension, windowBackgroundColor);
        windowGroup2.add(window2Background);

        const window2Menu = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
        windowGroup2.add(window2Menu);

        // Add menue bar on window 2 
        const window2MenuBackground = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
        window2Menu.add(window2MenuBackground);

        // Add minimize sphere on window 2
        const window2MinimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
        window2Menu.add(window2MinimizeSphere);

        // Add Texture box to SceneGraph
        const textureBoxGroup = new GroupNode(new Translation(new Vector(-2, -1, 1, 0)));
        windowGroup1.add(textureBoxGroup);
        //const textureBox = new TextureBoxNode("source-missing-texture.png", new Vector(0.5, 0.5, 0.5, 1), new Vector(1, 1, 1, 1), "brickwall-normal.png");
        const textureVideoBox = new TextureVideoBoxNode("assitoni.mp4", new Vector(-0.5, -0.5, -0.5, 1), new Vector(.5, .5, .5, 1));

        const textureVideoBoxGroup = new GroupNode(new EmptyTransformation);
        //let rot = new Rotation(new Vector(1, 0, 0, 0), 180);
        //let rotation = rot.RotateWithPosition(textureVideoBoxGroup, rot);
        let rotation = new RotateWithPosition(textureVideoBoxGroup, new Rotation(new Vector(1, 0, 0, 0), 180));
        textureVideoBoxGroup.transform = rotation;

        textureBoxGroup.add(textureVideoBoxGroup);
        textureVideoBoxGroup.add(textureVideoBox);

        //Add animation node
        const animationNode = new RotationNode(textureBoxGroup, new Vector(1, 0, 0, 0));
        // const animationNode3 = new JumperNode(taskbarButtonGroup2, new Vector(0, 1, 0, 0));

        // const animationNode4 = new DriverNode(gn1);
        // const animationNode3 = new ScaleNode(taskbarButtonGroup2, new Vector(-1, -1, -1, 0));
        animationNode.toggleActive();

        /***************************************************************/
        /*********************  END OF SCENE GRAPH *********************/
        /***************************************************************/

    }
}
