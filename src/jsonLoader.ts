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
import AnimationNode, { DriverNode, InputDriverNode, JumperNode, RotationNode, ScaleNode, InputScalerNode } from "./nodes/animation-nodes";
import { Scenegraph } from "./scenegraph";
import MeshNode from "./nodes/mesh-node";
import { WindowNode } from "./nodes/window-node";
import TextureTextBoxNode from "./nodes/texture-text-box-node";


export class JsonLoader {
    private static json: any
    private static sg: GroupNode
    private static camera: CameraNode

    /**
     * Converts a JSON file to a scenegraph representation.
     * @param file - The JSON file to be converted.
     * @returns A promise that resolves to an object containing the scenegraph and camera nodes.
     */
    static async JsonToScenegraph(file: File): Promise<{ sg: GroupNode, camera: CameraNode }> {
        const text = await file.text();
        this.json = await JSON.parse(text)

        const rootElementCode = this.json.root.childCodes[0];
        this.sg = this.loadGroupNode(this.json[rootElementCode])
        return { sg: this.sg, camera: this.camera }
    }




    /**
     * Retrieves a Transformation object from a JSON representation.
     * @param transformJson - The JSON object representing the transformation.
     * @returns The Transformation object.
     */
    private static getTransformation(transformJson: any): Transformation {
        transformJson.transform as MatrixTransformation;
        const traverse = this.parseMatrix(transformJson.transformation.matrix)
        const inverse = this.parseMatrix(transformJson.transformation.inverse)
        return new MatrixTransformation(traverse, inverse)
    }




    /**
     * Parses a matrix from a JSON object.
     * 
     * @param matrixJson - The JSON object representing the matrix.
     * @returns A new Matrix object.
     */
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



    /**
     * Parses a vector from JSON data.
     * @param vectorJson - The JSON data representing the vector.
     * @returns The parsed vector.
     */
    private static parseVector(vectorJson: any): Vector {
        const data = vectorJson.data as [number, number, number, number]
        return new Vector(...data)
    }

    /**
     * Retrieves the texture properties from a given node.
     * 
     * @param node - The node containing the texture properties.
     * @returns An object containing the texture, minPoint, maxPoint, and normal properties.
     */
    private static getTextureProbs(node: any) {
        const texture = <string>node.texture
        const minPoint = this.parseVector(node.minPoint)
        const maxPoint = this.parseVector(node.maxPoint)
        const normal = <string>node.normal
        return {
            texture, minPoint, maxPoint, normal
        }
    }



    /**
     * Creates a Node object based on the provided nodeJson.
     * @param nodeJson - The JSON object representing the node.
     * @param groupNodeJson - The GroupNode of the object.
     * @returns The created Node object.
     */
    private static nodeFactory(nodeJson: any, groupNodeJson: GroupNode): Node {
        const classname = nodeJson.classname
        switch (classname) {
            case "WindowNode":
                return this.loadWindowNode(nodeJson)
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
            case "TextureTextBoxNode":
                return this.loadTextureTextBoxNode(nodeJson)
            // create Animation Nodes with corresponding groupNodeJson
            case "RotationNode":
                return this.loadRotationNode(nodeJson, groupNodeJson)
            case "JumperNode":
                return this.loadJumperNode(nodeJson, groupNodeJson)
            case "DriverNode":
                return this.loadDriverNode(nodeJson, groupNodeJson)
            case "InputDriverNode":
                return this.loadDriverNodeMouse(nodeJson, groupNodeJson)
            case "ScalerNode":
                return this.loadScalerNode(nodeJson, groupNodeJson)
            case "ScalerNodeMouse":
                return this.loadScalerNodeMouse(nodeJson, groupNodeJson)
            default:
                console.error(nodeJson, " not found!");
        }
    }




    /**
     * Loads a GroupNode and its children from a JSON object.
     * 
     * @param node - The JSON object representing the GroupNode.
     * @returns The loaded GroupNode.
     */
    private static loadGroupNode(node: any): GroupNode {

        console.log("Loading GroupNode: ", node);

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


    /**
     * Loads a camera from a JSON object.
     * 
     * @param cameraJson - The JSON object representing the camera.
     * @returns The loaded CameraNode object.
     */
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


    /**
     * Loads an AABoxNode from a JSON node object.
     * @param node - The JSON node containg the data.
     * @returns The loaded AABoxNode.
     */
    private static loadAABoxNode(node: any): AABoxNode {
        const minPoint = this.parseVector(node.minPoint);
        const maxPoint = this.parseVector(node.maxPoint);
        const dimensions = maxPoint.sub(minPoint)
        if (node.color != null) {
            const color = this.parseVector(node.color)
            const aaBox = new AABoxNode(dimensions, color)
            aaBox.name = node.name
            return aaBox
        } else {
            const texture = node.texture
            const aaBox = new AABoxNode(dimensions, null, texture)
            aaBox.name = node.name
            return aaBox
        }

    }


    /**
     * Loads a TextureBoxNode from a JSON node object.
     * 
     * @param node - The JSON node object containing the texture box node data.
     * @returns The loaded TextureBoxNode instance.
     */
    private static loadTextureBoxNode(node: any): TextureBoxNode {
        const { texture, minPoint, maxPoint, normal } = this.getTextureProbs(node)
        if (normal) {
            return new TextureBoxNode(texture, minPoint, maxPoint, normal)
        }
        return new TextureBoxNode(texture, minPoint, maxPoint)
    }




    /**
     * Loads a TextureVideoBoxNode from a given JSON node.
     * @param node - The JSON node containing the data for the TextureVideoBoxNode.
     * @returns The loaded TextureVideoBoxNode.
     */
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


    /**
     * Loads a sphere node from the given JSON node object.
     * @param node - The JSON node object representing the sphere node.
     * @returns The loaded SphereNode object.
     */
    private static loadSphereNode(node: any): SphereNode {
        const center = this.parseVector(node.center)
        const radius = <number>node.radius
        if (node.color) {
            const color = this.parseVector(node.color)
            const sphere = new SphereNode(color, center, radius)
            sphere.name = node.name
            return sphere
        } else if (node.texture) {
            const texture = <string>node.texture
            const sphere = new SphereNode(null, center, radius, texture)
            sphere.name = node.name
            return sphere
        }
    }


    /**
     * Loads a pyramid node from a JSON object.
     * @param node - The JSON object representing the pyramid node.
     * @returns The loaded PyramidNode object.
     */
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

    /**
     * Loads a LightNode from a JSON object.
     * 
     * @param node - The JSON object representing the light node.
     * @returns The loaded LightNode object.
     */
    private static loadLightNode(node: any): LightNode {
        const position = this.parseVector(node.position)
        const color = this.parseVector(node.color)
        return new LightNode(color, position);
    }


    /**
     * Loads a rotation node from a JSON object and creates a RotationNode instance.
     * 
     * @param node - The JSON object representing the rotation node.
     * @param groupNode - The parent group node.
     * @returns The created RotationNode instance.
     */
    private static loadRotationNode(node: any, groupNode: any): RotationNode {
        const axis = this.parseVector(node.axis);
        const speed = node.speed
        const rotationNode = new RotationNode(groupNode, axis, speed);
        rotationNode.active = node.active
        rotationNode.name = node.name
        return rotationNode
    }


    /**
     * Loads a JumperNode from a JSON object.
     * 
     * @param node - The JSON object representing the JumperNode.
     * @param groupNode - The parent group node.
     * @returns The loaded JumperNode.
     */
    private static loadJumperNode(node: any, groupNode: any): JumperNode {
        const translation = this.parseVector(node.translation);
        const startingPos = this.parseMatrix(node.startingPos);
        const jumper = new JumperNode(groupNode, translation, startingPos);
        jumper.name = node.name
        jumper.active = node.active
        return jumper
    }

    /**
     * Loads a driver node from a JSON object.
     * 
     * @param node - The JSON object representing the driver node.
     * @param groupNode - The parent group node.
     * @returns The loaded driver node.
     */
    private static loadDriverNode(node: any, groupNode: any): DriverNode {
        const directionVector = this.parseVector(node.direction)
        const driver = new DriverNode(groupNode, directionVector)
        driver.loop = node.loop
        driver.speed = node.speed
        driver.active = node.active
        driver.name = node.name
        return driver
    }


    /**
     * Loads a input driver node for mouse input from a JSON object.
     * 
     * @param node - The JSON object representing the driver node.
     * @param groupNode - The parent group node.
     * @returns The loaded InputDriverNode instance.
     */
    private static loadDriverNodeMouse(node: any, groupNode: any): InputDriverNode {
        const driver = new InputDriverNode(groupNode)
        driver.active = node.active
        return driver
    }



    /**
     * Loads a scaler node from a JSON object.
     * 
     * @param node - The JSON object representing the scaler node.
     * @param groupNode - The parent group node.
     * @returns The loaded scaler node.
     */
    private static loadScalerNode(node: any, groupNode: any): ScaleNode {
        const targetScale = this.parseVector(node.targetScale);
        const duration = node.duration
        const scaler = new ScaleNode(groupNode, targetScale, duration)
        scaler.active = node.active
        scaler.name = node.name
        return scaler
    }


    /**
     * Loads a input scaler node mouse for mouse input from a JSON object.
     * 
     * @param node - The JSON object representing the scaler node.
     * @param groupNode - The parent group node.
     * @returns The loaded InputScalerNode instance.
     */
    private static loadScalerNodeMouse(node: any, groupNode: any): InputScalerNode {
        const scaler = new InputScalerNode(groupNode)
        scaler.active = node.active
        return scaler
    }


    /**
     * Loads a mesh node from the given JSON node object.
     * 
     * @param node - The JSON node object containing the mesh data.
     * @returns A new MeshNode instance created from the JSON data.
     */
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



    /**
     * Loads a window node from the provided JSON node.
     * @param node - The JSON node representing the window.
     * @returns The loaded WindowNode object.
     */
    private static loadWindowNode(node: any) {
        const transformation = this.getTransformation(node.transform);
        const windowNode = new WindowNode(transformation, node.name);
        const children = node.childCodes as string[]
        windowNode.fullscreen = node.fullscreen
        windowNode.fullscrenVector = this.parseVector(node.fullscrenVector)
        for (let child of children) {
            const childJSON = this.json[child]
            const childNode = this.nodeFactory(childJSON, node)
            windowNode.add(childNode)
        }
        return windowNode
    }







}