import Matrix from "../matrix";
import AABoxNode from "../nodes/aabox-node";
import AnimationNode from "../nodes/animation-nodes";
import CameraNode from "../nodes/camera-node";
import GroupNode from "../nodes/group-node";
import LightNode from "../nodes/light-node";
import MeshNode from "../nodes/mesh-node";
import Node from "../nodes/node";
import PyramidNode from "../nodes/pyramid-node";
import SphereNode from "../nodes/sphere-node";
import TextureBoxNode from "../nodes/texture-box-node";
import TextureTextBoxNode from "../nodes/texture-text-box-node";
import TextureVideoBoxNode from "../nodes/texture-video-box-node";
import PhongProperties from "../phong-properties";
import Vector from "../vector";
import Visitor from "../visitor";
import AABox from "./aabox";
import Intersection from "./intersection";
import phong from "./phong";
import Pyramid from "./pyramid";
import Ray from "./ray";
import Sphere from "./ray-sphere";

interface Intersectable {
  intersect(ray: Ray): Intersection | null;
  color?: Vector;
}

/**
 * Class representing a Visitor that uses
 * Raytracing to render a Scenegraph
 */
export default class RayVisitor implements Visitor {
  /**
   * The image data of the context to
   * set individual pixels
   */
  imageData: ImageData;
  camera: CameraNode; // TODO do we need this? Camera is alwas given with render function
  objects: Array<Intersectable>;

  // TODO declare instance variables here
  // stack:  [{ matrix: Matrix, inverse: Matrix }];
  stack: Array<Matrix> = [];
  intersection: Intersection | null;
  intersectionColor: Vector;
  lightNodes: Array<LightNode> = [];
  boundingBoxes: Array<AABox> = [];

  /**
   * Creates a new RayVisitor
   * @param context The 2D context to render to
   * @param width The width of the canvas
   * @param height The height of the canvas
   */
  constructor(
    private context: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    this.imageData = context.getImageData(0, 0, width, height);
    this.stack.push(Matrix.identity());
    this.intersection = null;
  }

  visitLightNode(node: LightNode): void {
    // Get the transform of the current node
    let myPosition = this.stack[this.stack.length - 1].mul(node.position);
    // Add a light node to the list of light nodes
    this.lightNodes.push(new LightNode(node.color, myPosition));
  }

  /**
   * Calculates the bounding boxes for the objects collected by the ray visitor.
   * @returns An array of AABox objects representing the bounding boxes.
   */
  calcualteBoundingBoxes(): AABox[] {
    let boundingBoxes: AABox[] = [];
    console.log(this.objects.length);
    for (let shape of this.objects) {
      let min = new Vector(Infinity, Infinity, Infinity, 1);
      let max = new Vector(-Infinity, -Infinity, -Infinity, 1);
      if (shape instanceof Sphere) {
        let sphere = shape as Sphere;
        let center = sphere.center;
        let radius = sphere.radius;

        min.x = Math.min(min.x, center.x - radius);
        min.y = Math.min(min.y, center.y - radius);
        min.z = Math.min(min.z, center.z - radius);

        max.x = Math.max(max.x, center.x + radius);
        max.y = Math.max(max.y, center.y + radius);
        max.z = Math.max(max.z, center.z + radius);
      }
      else if (shape instanceof AABox) {
        let aabox = shape as AABox;
        min.x = Math.min(min.x, aabox.minPoint.x);
        min.y = Math.min(min.y, aabox.minPoint.y);
        min.z = Math.min(min.z, aabox.minPoint.z);

        max.x = Math.max(max.x, aabox.maxPoint.x);
        max.y = Math.max(max.y, aabox.maxPoint.y);
        max.z = Math.max(max.z, aabox.maxPoint.z);
      }
      else if (shape instanceof Pyramid) {
        let pyramid = shape as Pyramid;
        min.x = Math.min(min.x, pyramid.minPoint.x);
        min.y = Math.min(min.y, pyramid.minPoint.y);
        min.z = Math.min(min.z, pyramid.minPoint.z);

        max.x = Math.max(max.x, pyramid.maxPoint.x);
        max.y = Math.max(max.y, pyramid.maxPoint.y);
        max.z = Math.max(max.z, pyramid.maxPoint.z);
      }
      else {
        console.log("Unknown shape node " + shape);
      }
      boundingBoxes.push(new AABox(min, max, null));
    }
    return boundingBoxes;
  }

  /**
   * Renders the Scenegraph
   * @param rootNode The root node of the Scenegraph
   * @param camera The camera used
   */
  render(
    rootNode: Node,
    phongProperties: PhongProperties,
    numSamples: number
  ) {
    // clear
    let data = this.imageData.data;
    data.fill(0);
    this.objects = [];
    this.lightNodes = [];

    //build list of render objects
    rootNode.accept(this); // this = Visit: GroupNode, Visit: CameraNode, Visit: SphereNode, Visit: AABoxNode, Visit: TextureBoxNode

    // calculate bounding boxes
    this.boundingBoxes = this.calcualteBoundingBoxes();

    // raytrace
    const width = this.imageData.width;
    const height = this.imageData.height;

    //For schleife für alle Pixel
    for (let i = 0; i < numSamples; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);

      const ray = Ray.makeRay(x, y, height, width, this.camera); // ray = new Ray(origin, direction)

      let minIntersection = new Intersection(Infinity, null, null);
      let minObj = null; // minObj is the closest object to the camera

      // iterate over all objects and check for intersection with its bounding box
      for (let j = 0; j < this.objects.length; j++) {
        let box = this.boundingBoxes[j];
        let shape = this.objects[j];

        // check if ray intersects bounding box
        if (box.intersect(ray)) {
          // check if ray intersects shape
          const intersection = shape.intersect(ray);
          // const intersection = box.intersect(ray);

          // check if intersection exists and if it's closer than the current closest intersection
          if (intersection && intersection.closerThan(minIntersection)) {
            minIntersection = intersection;
            minObj = shape;
            // minObj = box;
          }
        }
        else {
          continue;
        }
      }

      if (minObj) {
        if (!minObj.color) {
          // if no color is given then set pixel to black , else calculate color with phong
          data[4 * (width * y + x) + 0] = 0;
          data[4 * (width * y + x) + 1] = 0;
          data[4 * (width * y + x) + 2] = 0;
          data[4 * (width * y + x) + 3] = 255;
        } else {
          let color = phong(
            minObj.color,
            minIntersection,
            this.lightNodes,
            this.camera.center,
            phongProperties
          );

          data[4 * (width * y + x) + 0] += color.r * 255;
          data[4 * (width * y + x) + 1] += color.g * 255;
          data[4 * (width * y + x) + 2] += color.b * 255;
          data[4 * (width * y + x) + 3] = 255;
        }
      }
    }

    // Accumulate old to the new data
    let myImageData = this.context.getImageData(0, 0, width, height);
    for (let i = 0; i < myImageData.data.length; i += 4) {
      if (myImageData.data[i] != 0 // For all old non-empty pixels 
        && myImageData.data[i + 1] != 0
        && myImageData.data[i + 2] != 0
        && myImageData.data[i + 3] != 0
      ) { // Uebernimm alle alten Pixel falls vorhanden
        this.imageData.data[i] = myImageData.data[i];
        this.imageData.data[i + 1] = myImageData.data[i + 1];
        this.imageData.data[i + 2] = myImageData.data[i + 2];
        this.imageData.data[i + 3] = myImageData.data[i + 3];
      }
    }
    this.context.putImageData(this.imageData, 0, 0); // put the image data to the context (canvas)
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    // TODO traverse the graph and build the model matrix
    let toWorld = this.stack.at(this.stack.length - 1).mul(node.transform.getMatrix());


    this.stack.push(toWorld);
    for (let i = 0; i < node.children.length; i++) {
      node.children[i].accept(this); // Je nachdem welche Art von Node: Accept Methode aufrufen im visitor
    }
    this.stack.pop();
  }

  /**
   * Visits a sphere node
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    let m = this.stack[this.stack.length - 1]; //translation matrix

    let xScale = m.getVal(0, 0);
    let yScale = m.getVal(0, 1);
    let zScale = m.getVal(0, 2);

    let scale = Math.sqrt(xScale * xScale + yScale * yScale + zScale * zScale);
    // console.log(scale);
    this.objects.push(
      new Sphere(m.mul(node.center), node.radius * scale, node.color)
    );
  }

  /**
   * Visits an axis aligned box node and push it to the objects array
   * @param node The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    // Visit the node and push it to the objects array
    // this.objects.push(new AABox(node.minPoint, node.maxPoint, node.color));

    // this.stack[0] = Matrix.identity();
    let mat = this.stack[this.stack.length - 1];
    let min = mat.mul(node.minPoint);
    let max = mat.mul(node.maxPoint);
    this.objects.push(new AABox(min, max, node.color));

  }


  /**
   * Visits a textured box node
   * @param node The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) { }

  visitTextureVideoBoxNode(node: TextureVideoBoxNode): void { }

  visitTextureTextBoxNode(node: TextureTextBoxNode): void { }

  visitMeshNode(node: MeshNode): void { }

  visitCameraNode(node: CameraNode) {
    // Frage an Marius: warum machen wir uns den ganzen aufwand, und verwenden nicht einfach node.eye, node.center, node.up?
    let center = this.stack[this.stack.length - 1].mul(node.center);
    let eye = node.eye.mul(1);
    eye.z -= 2;
    eye = this.stack[this.stack.length - 1].mul(node.eye);
    let up = this.stack[this.stack.length - 1].mul(node.up);
    this.camera = new CameraNode(
      node.eye,
      node.center,
      node.up,
      node.fovy,
      node.aspect,
      node.near,
      node.far
    );
    // coordinaten hardcoden für test der camera
    // this.camera = new CameraNode(new Vector(0, 0, 0, 1), new Vector(0, 0, -1, 1), new Vector(0, 1, 0, 0), node.fovy, node.aspect, node.near, node.far);
  }

  /**
   * Visits a camera node
   * @param node The node to visit
   */
  visitGroupNodeCamera(node: GroupNode) { }

  visitPyramidNode(node: PyramidNode) {
    let mat = this.stack[this.stack.length - 1];
    let min = mat.mul(node.minPoint);
    let max = mat.mul(node.maxPoint);
    this.objects.push(new Pyramid(min, max, node.color));

  }

  visitAnimationNode(node: AnimationNode): void {
    //TODO-Animation
    console.log("AnimationNode visited; not implemented yet");

  }
}
