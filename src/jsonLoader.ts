import Matrix from "./matrix";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import { MatrixTransformation, Transformation, Translation } from "./transformation";
import Vector from "./vector";
import Node from "./nodes/node";
import LightNode from "./nodes/light-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/sphere-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import TextureBoxNode from "./nodes/texture-box-node";
import AABoxNode from "./nodes/aabox-node";
import { DriverNode, JumperNode, RotationNode, ScaleNode } from "./nodes/animation-nodes";


export class JsonLoader {
    private static json: any


    static async JsonToScenegraph(file: File): Promise<{ sg: GroupNode, camera: CameraNode }> {
        const text = await file.text();
        this.json = await JSON.parse(text)



        const rootElementCode = this.json.root.childCodes[0];
        const sg = this.loadGroupNode(this.json[rootElementCode])
        return {
            sg,
            camera: this.loadCamera(this.json["camera"])
        }

    }

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

    private static getTransformation(transformJson: any): Transformation {
        console.log("transformJSON", transformJson);
        console.log("transformJSON.transformation.matrix", transformJson.transformation.matrix);
        transformJson.transform as MatrixTransformation;
        const traverse = this.parseMatrix(transformJson.transformation.matrix)
        const inverse = this.parseMatrix(transformJson.transformation.inverse)
        console.log("inverse", inverse);
        return new MatrixTransformation(traverse, inverse)
    }


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

    private static parseVector(vectorJson: any): Vector {
        console.log("vectorJson", vectorJson);

        const data = vectorJson.data as [number, number, number, number]
        return new Vector(...data)
    }

    private static nodeFactory(nodeJson: any): Node {
        const classname = nodeJson.classname
        switch (classname) {
            case "GroupNode":
                return this.loadGroupNode(nodeJson)
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
            case "Jumper":
                return this.loadJumperNode(nodeJson)
            case "Driver":
                return this.loadDriverNode(nodeJson)
            case "Scaler":
                return this.loadScalerNode(nodeJson)
            case "TextureBoxNode":
                return this.loadTextureBoxNode(nodeJson)
            case "TextureVideoBoxNode":
                return this.loadVideoBoxNode(nodeJson)
            case "PyramidNode":
                return this.loadPyramidNode(nodeJson)
            default: {
                console.error(`could not parse node: ${nodeJson}`)
                return null
            }

        }
    }

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

    private static loadAABoxNode(node: any): AABoxNode {
        const minPoint = this.parseVector(node.minPoint);
        const maxPoint = this.parseVector(node.maxPoint);
        const color = this.parseVector(node.color);
        const dimensions = maxPoint.sub(minPoint)
        return new AABoxNode(dimensions, color)

    }

    private static loadTextureBoxNode(node: any): TextureBoxNode {
        const { texture, minPoint, maxPoint, normal } = this.getTextureProbs(node)
        if (normal) {
            return new TextureBoxNode(texture, minPoint, maxPoint, normal)
        }
        return new TextureBoxNode(texture, minPoint, maxPoint)
    }



    private static loadVideoBoxNode(node: any): TextureVideoBoxNode {
        const { texture, minPoint, maxPoint, normal } = this.getTextureProbs(node);
        if (normal) {
            return new TextureVideoBoxNode(texture, minPoint, maxPoint, normal)
        }
        return new TextureVideoBoxNode(texture, minPoint, maxPoint)
    }

    private static loadSphereNode(node: any): SphereNode {
        const color = this.parseVector(node.color)
        const center = this.parseVector(node.center)
        const radius = <number>node.radius
        return new SphereNode(color, center, radius)
    }

    private static loadPyramidNode(node: any): PyramidNode {
        const maxPoint = this.parseVector(node.maxPoint).mul(2);
        const color = this.parseVector(node.color);
        return new PyramidNode(maxPoint, color)
    }

    private static loadLightNode(node: any): LightNode {
        const position = this.parseVector(node.position)
        const color = this.parseVector(node.color)
        return new LightNode(color, position);
    }

    private static loadRotationNode(node: any): RotationNode {
        const groupNode = this.getGroupForAnimation(node);
        const axis = this.parseVector(node.axis);
        const rotationNode = new RotationNode(groupNode, axis);
        rotationNode.angle = node.angle
        return rotationNode
    }

    private static loadJumperNode(node: any): JumperNode {
        const groupNode = this.getGroupForAnimation(node);
        const translation = this.parseVector(node.translation);
        const startingPos = this.parseMatrix(node.startingPos);
        const jumper = new JumperNode(groupNode, translation, startingPos);
        jumper.number = node.number;
        return jumper
    }

    private static loadDriverNode(node: any): DriverNode {
        const groupNode = this.getGroupForAnimation(node);
        const translationVector = this.parseVector(node.translation)
        const driver = new DriverNode(groupNode, translationVector)
        return driver
    }

    private static loadScalerNode(node: any): ScaleNode {
        const groupNode = this.getGroupForAnimation(node);
        const targetScale = this.parseVector(node.targetScale);
        const duration = node.duration
        const scaler = new ScaleNode(groupNode, targetScale, duration)
        return scaler
    }





    private static getTextureProbs(node: any) {
        const texture = <string>node.texture
        const minPoint = this.parseVector(node.minPoint)
        const maxPoint = this.parseVector(node.maxPoint)
        const normal = <string>node.normal
        return {
            texture, minPoint, maxPoint, normal
        }
    }

    private static getGroupForAnimation(node: any) {
        const childCode = node.childCodes[0];
        const gnJson = this.json[childCode];
        return this.loadGroupNode(gnJson);
    }





}