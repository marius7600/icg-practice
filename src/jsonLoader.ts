import Matrix from "./math/matrix";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import { MatrixTransformation, Transformation, Translation } from "./math/transformation";
import Vector from "./math/vector";
import Node from "./nodes/node";
import LightNode from "./nodes/light-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/sphere-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import TextureBoxNode from "./nodes/texture-box-node";
import AABoxNode from "./nodes/aabox-node";
import AnimationNode, { DriverNode, JumperNode, RotationNode, ScaleNode } from "./nodes/animation-nodes";
import { Scenegraph } from "./scenegraph";


export class JsonLoader {
    private static json: any


    // loading the JSON file and parse the Scenegraph 
    // sceneGraphRootNode is the first object in the JSON file
    static async JsonToScenegraph(file: File): Promise<{ sg: GroupNode, camera: CameraNode }> {
        const text = await file.text();
        this.json = await JSON.parse(text)

        const rootElementCode = this.json.root.childCodes[0];
        const sg = this.loadGroupNode(this.json[rootElementCode])
        return {
            sg,
            //camera: this.loadCamera(this.json["camera"])
            camera: Scenegraph.getCamera()
        }

    }



    // loading transformation from JSON Object
    private static getTransformation(transformJson: any): Transformation {
        console.log("transformJSON", transformJson);
        console.log("transformJSON.transformation.matrix", transformJson.transformation.matrix);
        transformJson.transform as MatrixTransformation;
        const traverse = this.parseMatrix(transformJson.transformation.matrix)
        const inverse = this.parseMatrix(transformJson.transformation.inverse)
        console.log("inverse", inverse);
        return new MatrixTransformation(traverse, inverse)
    }

    // parsing the matrix from JSON Object
    private static parseMatrix(matrixJson: any) {
        const d = matrixJson.data
        const data = [
            d['0'], d['4'], d['8'], d['12'],
            d['1'], d['5'], d['9'], d['13'],
            d['2'], d['6'], d['10'], d['14'],
            d['3'], d['7'], d['11'], d['15']
        ]
        return new Matrix(data)
    }

    // parsing the vector from JSON Object
    private static parseVector(vectorJson: any): Vector {
        console.log("vectorJson", vectorJson);

        const data = vectorJson.data as [number, number, number, number]
        return new Vector(...data)
    }

    // loading the group node for animation from JSON Object
    private static getGroupForAnimation(node: any) {
        // Here we are getting our animation node (driver, jumper, rotation, scaler) 

        // const gnJson = this.json[childCode];
        // console.log("Animation: ", node);

        // return this.loadGroupNode(node);
        // // console.log("Animation: ", node);
        return new GroupNode(new Translation(new Vector(0, 0, 0, 1)));
    }

    // factory method to load the node with corresponding type from JSON Object
    private static nodeFactory(nodeJson: any): Node {
        const classname = nodeJson.classname
        switch (classname) {
            case "GroupNode":
                return this.loadGroupNode(nodeJson)
            case "CameraNode":
                return this.loadCamera(nodeJson)
            case "AABoxNode":
                return this.loadAABoxNode(nodeJson)
            case "TextureBoxNode":
                return this.loadTextureBoxNode(nodeJson)
            case "SphereNode":
                return this.loadSphereNode(nodeJson)
            case "LightNode":
                return this.loadLightNode(nodeJson)
            case "RotationNode":
                return this.loadRotationNode(nodeJson)
            case "JumperNode":
                return this.loadJumperNode(nodeJson)
            case "DriverNode":
                return this.loadDriverNode(nodeJson)
            case "ScalerNode":
                return this.loadScalerNode(nodeJson)
            case "TextureVideoBoxNode":
                return this.loadVideoBoxNode(nodeJson)
            case "PyramidNode":
                return this.loadPyramidNode(nodeJson)
            // case "MeshNode":
            //     return this.loadMeshNode(nodeJson);
            // case "WindowNode":
            //     return this.loadWindowNode(nodeJson)
            default: {
                //console.error(`could not parse node:${nodeJson}`)
                console.error("could not parse: ", nodeJson.classname)
                return null
            }
        }
    }

    // loading group node from JSON Object and its children
    private static loadGroupNode(node: any): GroupNode {
        const transformation = this.getTransformation(node.transform);
        const groupNode = new GroupNode(transformation);

        const children = node.childCodes as string[]

        for (let child of children) {
            const childJSON = this.json[child]
            const childNode = this.nodeFactory(childJSON)
            groupNode.add(childNode)
        }
        return groupNode

    }

    // loading the camera from JSON Object
    // camerNode is second object in the JSON file
    private static loadCamera(cameraJson: any) {
        console.log("cameraJson", cameraJson);

        const eye = this.parseVector(cameraJson.eye)
        console.log("eye", eye);

        const center = this.parseVector(cameraJson.center)
        const up = this.parseVector(cameraJson.up)
        const fovy = cameraJson.fovy
        const aspect = cameraJson.aspect
        const near = cameraJson.near
        const far = cameraJson.far
        return new CameraNode(
            up,
            center,
            eye,
            fovy,
            aspect,
            near,
            far,
        )
    }

    // loading AABoxNode from JSON Object
    private static loadAABoxNode(node: any): AABoxNode {
        const minPoint = this.parseVector(node.minPoint);
        const maxPoint = this.parseVector(node.maxPoint);
        const dimensions = maxPoint.sub(minPoint)
        if (node.color) {
            const color = this.parseVector(node.color)
            return new AABoxNode(dimensions, color)
        } else if (node.texture) {
            const texture = <string>node.texture
            return new AABoxNode(dimensions, null, texture)
        }

    }

    // loading TextureBoxNode from JSON Object
    private static loadTextureBoxNode(node: any): TextureBoxNode {
        const { texture, minPoint, maxPoint, normal } = this.getTextureProbs(node)
        if (normal) {
            return new TextureBoxNode(texture, minPoint, maxPoint, normal)
        }
        return new TextureBoxNode(texture, minPoint, maxPoint)
    }



    // loading TextureVideoBoxNode from JSON Object
    private static loadVideoBoxNode(node: any): TextureVideoBoxNode {
        const { texture, minPoint, maxPoint, normal } = this.getTextureProbs(node);
        if (normal) {
            return new TextureVideoBoxNode(texture, minPoint, maxPoint, normal)
        }
        return new TextureVideoBoxNode(texture, minPoint, maxPoint)
    }

    // loading SphereNode from JSON Object
    private static loadSphereNode(node: any): SphereNode {
        const center = this.parseVector(node.center)
        const radius = <number>node.radius
        if (node.color) {
            const color = this.parseVector(node.color)
            return new SphereNode(color, center, radius)
        } else if (node.texture) {
            const texture = <string>node.texture
            return new SphereNode(null, center, radius, texture)
        }
    }

    // loading PyramidNode from JSON Object
    private static loadPyramidNode(node: any): PyramidNode {
        const maxPoint = this.parseVector(node.maxPoint).mul(2);
        const dimensions = maxPoint.sub(this.parseVector(node.minPoint));
        if (node.color) {
            const color = this.parseVector(node.color)
            return new PyramidNode(dimensions, color)
        } else if (node.texture) {
            const texture = <string>node.texture
            return new PyramidNode(dimensions, null, texture)
        }
    }

    // loading LightNode from JSON Object
    private static loadLightNode(node: any): LightNode {
        const position = this.parseVector(node.position)
        const color = this.parseVector(node.color)
        return new LightNode(color, position);
    }

    // loading RotationNode from JSON Object
    private static loadRotationNode(node: any): RotationNode {
        const groupNode = this.getGroupForAnimation(node);
        const axis = this.parseVector(node.axis);
        const rotationNode = new RotationNode(groupNode, axis);
        rotationNode.angle = node.angle
        return rotationNode
    }

    // loading JumperNode from JSON Object
    private static loadJumperNode(node: any): JumperNode {
        const groupNode = this.getGroupForAnimation(node);
        const translation = this.parseVector(node.translation);
        const startingPos = this.parseMatrix(node.startingPos);
        const jumper = new JumperNode(groupNode, translation, startingPos);
        jumper.number = node.number;
        return jumper
    }

    // loading DriverNode from JSON Object
    private static loadDriverNode(node: any): DriverNode {
        const groupNode = this.getGroupForAnimation(node);
        const directionVector = this.parseVector(node.direction)
        const driver = new DriverNode(groupNode, directionVector)
        return driver
    }

    // loading ScalerNode from JSON Object
    private static loadScalerNode(node: any): ScaleNode {
        const groupNode = this.getGroupForAnimation(node);
        const targetScale = this.parseVector(node.targetScale);
        const duration = node.duration
        const scaler = new ScaleNode(groupNode, targetScale, duration)
        return scaler
    }

    // loading TextureProbs from JSON Object
    private static getTextureProbs(node: any) {
        const texture = <string>node.texture
        const minPoint = this.parseVector(node.minPoint)
        const maxPoint = this.parseVector(node.maxPoint)
        const normal = <string>node.normal
        return {
            texture, minPoint, maxPoint, normal
        }
    }

    private static loadMeshNode(node: any) {
        // console.log("Mesh: ", node);
        // const transformation = this.getTransformation(node.transform);
        // const meshNode = new GroupNode(transformation);
        // const children = node.childCodes as string[]

        // for (let child of children) {
        //     const childJSON = this.json[child]
        //     const childNode = this.nodeFactory(childJSON)
        //     meshNode.add(childNode)
        // }
        // return meshNode
    }

    private static loadWindowNode(node: any) {
        // console.log("Window: ", node.transform);

        // const transformation = this.getTransformation(node.transform);
        // const meshNode = new GroupNode(transformation);
        // const children = node.childCodes as string[]

        // for (let child of children) {
        //     const childJSON = this.json[child]
        //     const childNode = this.nodeFactory(childJSON)
        //     meshNode.add(childNode)
        // }
        // return meshNode
    }







}