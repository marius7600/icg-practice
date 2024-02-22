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
import AnimationNode, { DriverNode, DriverNodeMouse, JumperNode, RotationNode, ScaleNode, ScalerNodeMouse } from "./nodes/animation-nodes";
import { Scenegraph } from "./scenegraph";
import MeshNode from "./nodes/mesh-node";
import { WindowNode } from "./nodes/window-node";
import TextureTextBoxNode from "./nodes/texture-text-box-node";


export class JsonLoader {
    private static json: any
    private static sg: GroupNode
    private static camera: CameraNode


    // loading the JSON file and parse the Scenegraph 
    // sceneGraphRootNode is the first object in the JSON file
    static async JsonToScenegraph(file: File): Promise<{ sg: GroupNode, camera: CameraNode }> {
        const text = await file.text();
        this.json = await JSON.parse(text)

        const rootElementCode = this.json.root.childCodes[0];
        this.sg = this.loadGroupNode(this.json[rootElementCode])
        return { sg: this.sg, camera: this.camera }
    }



    // loading transformation from JSON Object
    private static getTransformation(transformJson: any): Transformation {
        transformJson.transform as MatrixTransformation;
        const traverse = this.parseMatrix(transformJson.transformation.matrix)
        const inverse = this.parseMatrix(transformJson.transformation.inverse)
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
        const data = vectorJson.data as [number, number, number, number]
        return new Vector(...data)
    }

    // factory method to load the node with corresponding type from JSON Object
    private static nodeFactory(nodeJson: any, groupNodeJson: any): Node {
        const classname = nodeJson.classname
        switch (classname) {
            case "GroupNode":
                return this.loadGroupNode(nodeJson)
            case "CameraNode":
                return this.loadCamera(nodeJson)
            case "LightNode":
                return this.loadLightNode(nodeJson)
            case "AABoxNode":
                return this.loadAABoxNode(nodeJson)
            case "TextureBoxNode":
                return this.loadTextureBoxNode(nodeJson)
            case "SphereNode":
                return this.loadSphereNode(nodeJson)
            case "TextureVideoBoxNode":
                return this.loadVideoBoxNode(nodeJson)
            case "PyramidNode":
                return this.loadPyramidNode(nodeJson)
            case "MeshNode":
                return this.loadMeshNode(nodeJson);
            case "WindowNode":
                return this.loadWindowNode(nodeJson)
            case "TextureTextBoxNode":
                return this.loadTextureTextBoxNode(nodeJson)
            // create Animation Nodes with corresponding groupNodeJson
            case "RotationNode":
                return this.loadRotationNode(nodeJson, groupNodeJson)
            case "JumperNode":
                return this.loadJumperNode(nodeJson, groupNodeJson)
            case "DriverNode":
                return this.loadDriverNode(nodeJson, groupNodeJson)
            case "DriverNodeMouse":
                return this.loadDriverNodeMouse(nodeJson, groupNodeJson)
            case "ScalerNode":
                return this.loadScalerNode(nodeJson, groupNodeJson)
            case "ScalerNodeMouse":
                return this.loadScalerNodeMouse(nodeJson, groupNodeJson)
            default:
                console.error(nodeJson, " not found!");

        }
    }



    // loading group node from JSON Object and its children
    private static loadGroupNode(node: any): GroupNode {

        //console.log("Loading GroupNode: ", node);

        const transformation = this.getTransformation(node.transform);
        const groupNode = new GroupNode(transformation);

        const children = node.childCodes as string[]

        for (let child of children) {
            const childJSON = this.json[child]
            const childNode = this.nodeFactory(childJSON, groupNode)
            groupNode.add(childNode)
            groupNode.name = node.name
            //childNode.name = node.name

        }
        return groupNode

    }

    // loading the camera from JSON Object
    // camerNode is second object in the JSON file
    private static loadCamera(cameraJson: any): CameraNode {
        const eye = this.parseVector(cameraJson.eye)
        const center = this.parseVector(cameraJson.center)
        const up = this.parseVector(cameraJson.up)
        const fovy = cameraJson.fovy
        const aspect = cameraJson.aspect
        const near = cameraJson.near
        const far = cameraJson.far
        const camera = new CameraNode(
            eye,
            center,
            up,
            fovy,
            aspect,
            near,
            far
        )
        this.camera = camera
        return camera
    }

    // loading AABoxNode from JSON Object
    private static loadAABoxNode(node: any): AABoxNode {
        const minPoint = this.parseVector(node.minPoint);
        const maxPoint = this.parseVector(node.maxPoint);
        const dimensions = maxPoint.sub(minPoint)
        if (node.color != null) {
            const color = this.parseVector(node.color)
            return new AABoxNode(dimensions, color)
        } else {
            const texture = node.texture
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

    private static loadTextureTextBoxNode(node: any): TextureTextBoxNode {
        const { texture, minPoint, maxPoint, normal } = this.getTextureProbs(node);
        if (normal) {
            return new TextureTextBoxNode(texture, minPoint, maxPoint, normal)
        }
        return new TextureTextBoxNode(texture, minPoint, maxPoint)
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
    private static loadRotationNode(node: any, groupNode: any): RotationNode {
        const axis = this.parseVector(node.axis);
        const rotationNode = new RotationNode(groupNode, axis);
        rotationNode.angle = node.angle
        rotationNode.active = node.active
        return rotationNode
    }

    // loading JumperNode from JSON Object
    private static loadJumperNode(node: any, groupNode: any): JumperNode {
        const translation = this.parseVector(node.translation);
        const startingPos = this.parseMatrix(node.startingPos);
        const jumper = new JumperNode(groupNode, translation, startingPos);
        jumper.active = node.active
        return jumper
    }

    // loading DriverNode from JSON Object
    private static loadDriverNode(node: any, groupNode: any): DriverNode {
        const directionVector = this.parseVector(node.direction)
        const driver = new DriverNode(groupNode, directionVector)
        driver.loop = node.loop
        driver.speed = node.speed
        driver.active = node.active
        return driver
    }

    // loading DriverNodeMouse from JSON Object
    private static loadDriverNodeMouse(node: any, groupNode: any): DriverNodeMouse {
        const driver = new DriverNodeMouse(groupNode)
        driver.active = node.active
        return driver
    }


    // loading ScalerNode from JSON Object
    private static loadScalerNode(node: any, groupNode: any): ScaleNode {
        const targetScale = this.parseVector(node.targetScale);
        const duration = node.duration
        const scaler = new ScaleNode(groupNode, targetScale, duration)
        scaler.active = node.active
        return scaler
    }

    // loading ScalerNodeMouse from JSON Object
    private static loadScalerNodeMouse(node: any, groupNode: any): ScalerNodeMouse {
        const scaler = new ScalerNodeMouse(groupNode)
        scaler.active = node.active
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
        // Set attributes from mesh 
        const vertices = node.vertices;
        const normals = node.normals;
        const color = this.parseVector(node.color);
        const meshName = node.meshName;
        const maxPoint = this.parseVector(node.maxPoint);
        const minPoint = this.parseVector(node.minPoint);
        return new MeshNode(vertices, normals, color, meshName, maxPoint, minPoint);
    }

    private static loadWindowNode(node: any) {
        const transformation = this.getTransformation(node.transform);
        const windowNode = new WindowNode(transformation, node.name);
        const children = node.childCodes as string[]

        for (let child of children) {
            const childJSON = this.json[child]
            const childNode = this.nodeFactory(childJSON, node)
            windowNode.add(childNode)
        }
        return windowNode
    }







}