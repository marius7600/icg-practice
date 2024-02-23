import Matrix from "../math/matrix";
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
import Vector from "../math/vector";
import Visitor from "../visitor";
import AABox from "./aabox";
import Intersection from "./intersection";
import MeshObject from "./meshObject";
import phong from "./phong";
import Pyramid from "./pyramid";
import Ray from "./ray";
import Sphere from "./ray-sphere";

/**
 * Class representing Objects that can be intersected with a ray.
 * The object can have a color.
 */
interface Intersectable {
  intersect(ray: Ray): Intersection | null;
  color?: Vector;
}

/**
 * Class representing a Visitor that uses Raytracing to render a Scenegraph
 */
export default class RayVisitor implements Visitor {
  /**
   * The image data of the context to set individual pixels
   */
  imageData: ImageData;
  camera: CameraNode;
  objects: Array<Intersectable>;
  stack: Array<Matrix> = [];
  intersection: Intersection | null;
  intersectionColor: Vector;
  lightNodes: Array<LightNode> = [];
  boundingBoxes: Array<AABox> = [];
  boundingSpheres: Array<Sphere> = [];

  /**
   * Creates a new RayVisitor
   * @param context - The 2D context to render to
   * @param width - The width of the canvas
   * @param height - The height of the canvas
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

    // get all light nodes
    this.getLightNodes(rootNode);

    //build list of render objects
    rootNode.accept(this); // this = Visit: GroupNode, Visit: CameraNode, Visit: SphereNode, Visit: AABoxNode, Visit: TextureBoxNode, ...

    // calculate bounding boxes
    this.boundingBoxes = this.calcualteBoundingBoxes();
    //this.boundingSpheres = this.calculateBoundingSpheres();


    const width = this.imageData.width;
    const height = this.imageData.height;

    // iterate over all pixels and calculate the color for each pixel using raytracing and phong shading model
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

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
            //const intersection = box.intersect(ray); // For debugging purposes (only renders bounding boxes)

            // check if intersection exists and if it's closer than the current closest intersection
            if (intersection && intersection.closerThan(minIntersection)) {
              minIntersection = intersection;
              minObj = shape;
              //minObj = box; // For debugging purposes (only renders bounding boxes)
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
    }
    // put the image data to the context (canvas)
    this.context.putImageData(this.imageData, 0, 0);
  }

  /**
   * Visits a LightNode and updates its position based on the current transformation matrix.
   * @param node - The LightNode to visit.
   */
  visitLightNode(node: LightNode): void {
    // Get the current transformation matrix
    let m = this.stack.at(this.stack.length - 1);

    // Iterate over the lightNodes
    for (let i = 0; i < this.lightNodes.length; i++) {
      // Check if the current node is the same as the visited node
      if (this.lightNodes[i] === node) {
        // Update the position of the node
        this.lightNodes[i].position = m.mul(new Vector(0, 0, 0, 1));
      }

    }
  }

  /**
   * Calculates the bounding boxes for the objects collected by the ray visitor.
   * @returns An array of AABox objects representing the bounding boxes.
   */
  calcualteBoundingBoxes(): AABox[] {
    let boundingBoxes: AABox[] = [];

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

      } else if (shape instanceof MeshObject) {
        min.x = Math.min(min.x, shape.minPoint.x);
        min.y = Math.min(min.y, shape.minPoint.y);
        min.z = Math.min(min.z, shape.minPoint.z);

        max.x = Math.max(max.x, shape.maxPoint.x);
        max.y = Math.max(max.y, shape.maxPoint.y);
        max.z = Math.max(max.z, shape.maxPoint.z);
      }
      else {
        console.log("Unknown shape node " + shape);
      }
      boundingBoxes.push(new AABox(min, max, null));
    }
    return boundingBoxes;
  }

  /**
   * Calculates the bounding spheres for the objects in the ray visitor.
   * @returns An array of Sphere objects representing the bounding spheres.
   */
  calculateBoundingSpheres(): Sphere[] {
    let boundingSpheres: Sphere[] = [];

    for (let shape of this.objects) {
      let center: Vector;
      let radius: number;

      if (shape instanceof Sphere) {
        let sphere = shape as Sphere;
        center = sphere.center;
        radius = sphere.radius;
      } else if (shape instanceof AABox || shape instanceof Pyramid) {
        let box = shape as AABox;
        center = box.minPoint.add(box.maxPoint).mul(0.5);
        radius = box.maxPoint.sub(center).length;
      } else if (shape instanceof MeshObject) {
        let mesh = shape as MeshObject;
        let min = mesh.minPoint;
        let max = mesh.maxPoint;
        center = min.add(max).mul(0.5);
        radius = max.sub(center).length;
      } else {
        console.log("Unknown shape node " + shape);
        continue;
      }

      boundingSpheres.push(new Sphere(center, radius, null));
    }

    return boundingSpheres;
  }



  /**
  * Searches for light nodes and sets them in the lights array
  * @parm {Node} The node to search for light nodes
  */
  getLightNodes(node: Node) {
    if (node instanceof LightNode) {
      this.lightNodes.push(node);
    } else if (node instanceof GroupNode) {
      for (let i = 0; i < node.children.length; i++) {
        this.getLightNodes(node.children[i]);
      }
    }
  }

  /**
   * Visits a group node and pushes the transformation matrix to the stack and visits its children nodes 
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    let toWorld = this.stack.at(this.stack.length - 1).mul(node.transform.getMatrix());
    this.stack.push(toWorld);
    for (let i = 0; i < node.children.length; i++) {
      node.children[i].accept(this); // Je nachdem welche Art von Node: Accept Methode aufrufen im visitor
    }
    this.stack.pop();
  }

  /**
   * Visits a sphere node, creates a new sphere object and push it to the objects array
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    // Get the current transformation matrix to set the spheres position
    let m = this.stack[this.stack.length - 1];

    let xScale = m.getVal(0, 0);
    let yScale = m.getVal(0, 1);
    let zScale = m.getVal(0, 2);

    let scale = Math.sqrt(xScale * xScale + yScale * yScale + zScale * zScale);
    this.objects.push(
      new Sphere(m.mul(node.center), node.radius * scale, node.color)
    );
  }

  /**
   * Visits an axis aligned box node, creates a new AABox object and push it to the objects array
   * @param node The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    let mat = this.stack[this.stack.length - 1];
    let min = mat.mul(node.minPoint);
    let max = mat.mul(node.maxPoint);
    this.objects.push(new AABox(min, max, node.color));
  }

  /**
 * Visits a PyramidNode, creates a new Pyramid and push it to the objects array.
 * @param node - The PyramidNode to visit.
 */
  visitPyramidNode(node: PyramidNode) {
    let mat = this.stack[this.stack.length - 1];
    let min = mat.mul(node.minPoint);
    let max = mat.mul(node.maxPoint);
    this.objects.push(new Pyramid(min, max, node.color));
  }


  /**
   * Visits a textured box node, nothing to do here since we don't support textures yet
   */
  visitTextureBoxNode(node: TextureBoxNode) { }

  /**
 * Visits a texture video box node, nothing to do here since we don't support textures yet
 */
  visitTextureVideoBoxNode(node: TextureVideoBoxNode): void { }

  /**
 * Visits a texture text node, nothing to do here since we don't support textures yet
 */
  visitTextureTextBoxNode(node: TextureTextBoxNode): void { }

  /**
   * Visits a MeshNode and transforms its vertices using the current transformation matrix.
   * Creates a new MeshObject with the transformed vertices and adds it to the objects array.
   * 
   * @param node - The MeshNode to visit.
   */
  visitMeshNode(node: MeshNode): void {
    // Get the current transformation matrix
    let mat = this.stack[this.stack.length - 1];
    let matData = mat.data; // Cache mat.data to avoid repeated property lookups

    // Preallocate array size for efficiency
    let transformedVertices = new Float32Array(node.vertices.length);

    for (let i = 0; i < node.vertices.length; i += 3) {
      let vertex = [node.vertices[i], node.vertices[i + 1], node.vertices[i + 2], 1];

      transformedVertices[i] = matData[0] * vertex[0] + matData[4] * vertex[1] + matData[8] * vertex[2] + matData[12] * vertex[3];
      transformedVertices[i + 1] = matData[1] * vertex[0] + matData[5] * vertex[1] + matData[9] * vertex[2] + matData[13] * vertex[3];
      transformedVertices[i + 2] = matData[2] * vertex[0] + matData[6] * vertex[1] + matData[10] * vertex[2] + matData[14] * vertex[3];
    }

    // Create a new MeshObject with the transformed vertices and add it to the objects array
    const mesh = new MeshObject(transformedVertices, node.normals, node.color, node.maxPoint, node.minPoint);
    this.objects.push(mesh);
    return;
  }


  /**
   * Visits a CameraNode and performs necessary operations.
   * 
   * @param node - The CameraNode to visit.
   */
  visitCameraNode(node: CameraNode) {
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
  }

  /**
   * Visits a camera node, nothing to do here
   */
  visitGroupNodeCamera(node: GroupNode) { }

  /**
   * Visits an animation node, nothing to do here
   */
  visitAnimationNode(node: AnimationNode): void {
  }
}
