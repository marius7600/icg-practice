import Matrix from '../matrix';
import Vector from '../vector';
import Sphere from './ray-sphere';
import Intersection from '../intersection';
import Ray from './ray';
import Visitor from '../visitor';
import phong from './phong';
import {
  Node, GroupNode, SphereNode,
  AABoxNode, TextureBoxNode, CameraNode   
} from '../nodes';
import AABox from './aabox';
import PhongProperties from '../phong-properties';


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
  camera: CameraNode;
  objects: Array<Intersectable>;


  // TODO declare instance variables here
  stack:  [{ matrix: Matrix, inverse: Matrix }];
  intersection: Intersection | null;
  intersectionColor: Vector;


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
    this.stack = [{ matrix: Matrix.identity(), inverse: Matrix.identity() }];
    this.intersection = null;
  }

  /**
   * Renders the Scenegraph
   * @param rootNode The root node of the Scenegraph
   * @param camera The camera used
   * @param lightPositions The light light positions
   */
  render(
    rootNode: Node,
    camera: CameraNode,
    lightPositions: Array<Vector>,
    phongProperties: PhongProperties
  ) {
    // clear
    let data = this.imageData.data;
    data.fill(0);
    this.objects = [];

    //build list of render objects
    rootNode.accept(this);

    // raytrace
    const width = this.imageData.width;
    const height = this.imageData.height;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const ray = Ray.makeRay(x, y, height, width, camera);
        
        let minIntersection = new Intersection(Infinity, null, null);
        let minObj = null;

        for (let shape of this.objects) {
          const intersection = shape.intersect(ray);
          if (intersection && intersection.closerThan(minIntersection)) {
            minIntersection = intersection;
            minObj = shape;
          }
        }
        
        // TODO initialize the matrix stack
        //Initialize the matrix stack with identity matrices
        // this.stack = [{ matrix: Matrix.identity(), inverse: Matrix.identity() }];
        // this.intersection = null;
        // rootNode.accept(this);

        if (minObj) {
          if (!minObj.color) {
            data[4 * (width * y + x) + 0] = 0;
            data[4 * (width * y + x) + 1] = 0;
            data[4 * (width * y + x) + 2] = 0;
            data[4 * (width * y + x) + 3] = 255;
          } else {
            let color = phong(minObj.color, minIntersection, lightPositions, camera.eye, phongProperties);
            data[4 * (width * y + x) + 0] = color.r * 255;
            data[4 * (width * y + x) + 1] = color.g * 255;
            data[4 * (width * y + x) + 2] = color.b * 255;
            data[4 * (width * y + x) + 3] = color.a * 255;
          }
        }
      }
    }
    this.context.putImageData(this.imageData, 0, 0);
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    // TODO traverse the graph and build the model matrix
    let toWorld = this.stack.at(this.stack.length - 1).matrix.mul(node.transform.getMatrix());
    // this.stack.push({ matrix: wiggse, inverse: wiggse.inverse() });
    this.stack.push({ matrix: toWorld, inverse: toWorld.transpose() });   // TODO is this correct?
    for (let i = 0; i < node.children.length; i++) {
      node.children[i].accept(this);
    }
    this.stack.pop();
  }

  /**
   * Visits a sphere node
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {

    let m = this.stack[this.stack.length - 1];
    // console.log(m);
    // console.log(node.radius)

    let xScale = m.matrix.getVal(0, 0);
    let yScale = m.matrix.getVal(0, 1);
    let zScale = m.matrix.getVal(0, 2);

    let scale = Math.sqrt(xScale * xScale + yScale * yScale + zScale * zScale);
    // console.log(scale);
    this.objects.push(new Sphere(m.matrix.mulVec(node.center),
      node.radius * scale, node.color));
  }

  /**
   * Visits an axis aligned box node
   * @param node The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    let mat = Matrix.identity();
    this.stack = [{ matrix: Matrix.identity(), inverse: Matrix.identity() }];
    mat = this.stack[this.stack.length - 1].matrix.mul(mat);

    this.objects.push(new AABox(
      mat.mulVec(new Vector(-0.5, -0.5, -0.5, 1)),
      mat.mulVec(new Vector(0.5, 0.5, 0.5, 1)),
      node.color
    ));
  }

  /**
   * Visits a textured box node
   * @param node The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) { }

  visitCameraNode(node: CameraNode) {
    let center = this.stack[this.stack.length - 1].matrix.mulVec(node.center);
    let eye = node.eye.mul(1);
    eye.z -= 2;
    eye = this.stack[this.stack.length - 1].matrix.mulVec(node.eye);
    let up = this.stack[this.stack.length - 1].matrix.mulVec(node.up);
    this.camera = new CameraNode(eye, center, up, node.fovy, node.aspect,
      node.near, node.far);
  }

    /**
   * Visits a camera node
   * @param node The node to visit
   */
     visitGroupNodeCamera(node: GroupNode) {

    }
}

