import Matrix from "../matrix";
import AABoxNode from "../nodes/aabox-node";
import CameraNode from "../nodes/camera-node";
import GroupNode from "../nodes/group-node";
import LightNode from "../nodes/light-node";
import Node from "../nodes/node";
import PyramidNode from "../nodes/pyramid-node";
import SphereNode from "../nodes/shere-node";
import TextureBoxNode from "../nodes/texture-box-node";
import PhongProperties from "../phong-properties";
import Shader from "../shader/shader";
import Vector from "../vector";
import Visitor from "../visitor";
import RasterPyramid from "./raster-Pyramid";
import RasterBox from "./raster-box";
import RasterSphere from "./raster-sphere";
import RasterTextureBox from "./raster-texture-box";

interface Renderable {
  render(shader: Shader): void;
}

/**
 * Class representing a Visitor that uses Rasterisation 2
 * to render a Scenegraph
 */
export class RasterVisitor implements Visitor {
  // TODO declare instance variables here
  stack: [{ traverse: Matrix; inverse: Matrix }];
  lightNodes: Array<LightNode> = [];
  matrix: Matrix = Matrix.identity(); // TODO kann man evtl. durch Stack ersetzen?!

  private lookat: Matrix; //view matrix to transform vertices from the world coordinate system to the view coordinate system
  private perspective: Matrix; //perspective matrix to transform vertices from the view coordinate system to the

  /**
   * Creates a new RasterVisitor
   * @param gl The 3D context to render to
   * @param shader The default shader to use
   * @param textureshader The texture shader to use
   */
  constructor(
    private gl: WebGL2RenderingContext,
    private shader: Shader,
    private textureshader: Shader,
    private renderables: WeakMap<Node, Renderable>,
    private phongProperties: PhongProperties
  ) {
    // TODO setup
    this.stack = [{ traverse: Matrix.identity(), inverse: Matrix.identity() }];
    this.phongProperties = phongProperties;
  }

  /**
   * Renders the Scenegraph
   * @param rootNode The root node of the Scenegraph
   * @param camera The camera used
   */
  render(rootNode: Node, camera: CameraNode) {
    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.lightNodes = [];

    this.setupCamera(camera);

    this.getLightNodes(rootNode);

    // traverse and render
    rootNode.accept(this);
  }

  /**
   * Seachres for light nodes and sets them in the lights array
   * @parm {Node} The node to search for light nodes
   */
  getLightNodes(node: Node) {
    // console.log("getting light nodes");
    if (node instanceof LightNode) {
      // this.lights.push(new LightNode(node.color, this.matrix.mulVec(node.position)));
      // this.lightNodes.push(new LightNode(node.color, this.stack.at(this.stack.length - 1).traverse.mulVec(node.position)));
      // node.position = this.stack.at(this.stack.length - 1).traverse.mulVec(node.position);
      this.lightNodes.push(node);
    } else if (node instanceof GroupNode) {
      for (let i = 0; i < node.children.length; i++) {
        this.getLightNodes(node.children[i]);
      }
    }
  }

  /**
   * Helper function to setup camera matrices
   * @param camera The camera used
   */
  setupCamera(camera: CameraNode) {
    this.lookat = Matrix.lookat(camera.eye, camera.center, camera.up);

    this.perspective = Matrix.perspective(
      camera.fovy,
      camera.aspect,
      camera.near,
      camera.far
    );
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    // TODO
    this.stack.push({
      traverse: node.transform.getMatrix(),
      inverse: node.transform.getInverseMatrix(),
    });
    for (let i = 0; i < node.children.length; i++) {
      node.children[i].accept(this);
    }
    this.stack.pop();
  }

  /**
   * Visits a sphere node
   * @param node The node to visit
   */
  visitSphereNode(node: SphereNode) {
    this.visitNode(node);
  }

  /**
   * Visits an axis aligned box node
   * @param  {AABoxNode} node - The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    this.visitNode(node);
  }

  /**
   * Visits a textured box node
   * @param  {TextureBoxNode} node - The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) {
    this.visitNode(node);
  }

  /**
   * Visits a group node in the camera traversal used in GroupNode Base Class
   * searches für Camera, if found visitCameraNode() is called
   * @param node The node to visit
   */
  visitGroupNodeCamera(node: GroupNode) {
    let mat = this.stack.at(this.stack.length - 1).traverse;

    let matTraverse = mat.mul(node.transform.getMatrix());
    //let matInv = matTraverse.invert();
    this.stack.push({
      traverse: matTraverse,
      inverse: node.transform.getInverseMatrix(),
    });

    let cameraFound = false;
    for (let child of node.children) {
      if (cameraFound) {
        break;
      } else if (child instanceof CameraNode) {
        child.accept(this);
        cameraFound = true;
      } else if (child instanceof GroupNode) {
        child.acceptOnlyCamera(this); // Rekursiver Aufruf der exakten Methode s. Group Node Klasse
      }
    }
    this.stack.pop();
  }

  visitCameraNode(node: CameraNode) {
    let m = this.stack.at(this.stack.length - 1).traverse;
    let centerLookat = m.mul(node.center);
    let eyePos = m.mul(node.eye);
    let upVec = m.mul(node.up);

    if (node) {
      this.lookat = Matrix.lookat(eyePos, centerLookat, upVec);

      this.perspective = Matrix.perspective(
        node.fovy,
        node.aspect,
        node.near,
        node.far
      );
    }
  }

  visitLightNode(node: LightNode): void {
    // TODO implement this
    // console.log('Method visitLightNode not implemented');
    this.stack.at(this.stack.length - 1).traverse.mul(node.position);
  }

  visitPyramidNode(node: PyramidNode) {
    this.visitNode(node);
  }

  private visitNode(node: Node) {
    let shader = this.shader;
    if (node instanceof TextureBoxNode) {
      shader = this.textureshader;
    }
    shader.use();

    let toWorld = Matrix.identity();
    let fromWorld = Matrix.identity();
    // TODO Calculate the model matrix for the box
    for (let i = 0; i < this.stack.length; i++) {
      toWorld = toWorld.mul(this.stack[i].traverse);
      fromWorld = this.stack[i].inverse.mul(toWorld);
    }

    shader.getUniformMatrix("M").set(toWorld);
    let V = shader.getUniformMatrix("V");
    if (V && this.lookat) {
      V.set(this.lookat);
    }

    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }

    let N = shader.getUniformMatrix("N");
    //let normal = this.lookat.mul(fromWorld).transpose(); // erst invert dann transpose
    let normal = fromWorld.transpose();

    if (N && normal) {
      N.set(normal); // pass to shader
    }

    // TODO set the material properties
    shader.getUniformFloat("u_ka").set(this.phongProperties.ambient);
    shader.getUniformFloat("u_kd").set(this.phongProperties.diffuse);
    shader.getUniformFloat("u_ks").set(this.phongProperties.specular);
    shader.getUniformFloat("u_shininess").set(this.phongProperties.shininess);

    shader.getUniformInt("u_number_of_lights").set(this.lightNodes.length);
    for (let i = 0; i < this.lightNodes.length; i++) {
      shader
        .getUniformVec3("u_light_positions[" + i + "]")
        .set(this.lightNodes[i].position); //unschön aber funktioniert
      shader
        .getUniformVec3("u_light_colors[" + i + "]")
        .set(this.lightNodes[i].color);
    }

    this.renderables.get(node)?.render(shader);
  }
}

/**
 * Class representing a Visitor that sets up buffers
 * for use by the RasterVisitor
 * */
export class RasterSetupVisitor {
  /**
   * The created render objects
   */
  public objects: WeakMap<Node, Renderable>;

  /**
   * Creates a new RasterSetupVisitor
   * @param context The 3D context in which to create buffers
   */
  constructor(private gl: WebGL2RenderingContext) {
    this.objects = new WeakMap();
  }

  /**
   * Sets up all needed buffers
   * @param rootNode The root node of the Scenegraph
   */
  setup(rootNode: Node) {
    // Clear to white, fully opaque
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // Clear everything
    this.gl.clearDepth(1.0);
    // Enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    rootNode.accept(this);
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    for (let child of node.children) {
      child.accept(this);
    }
  }

  /**
   * Visits a sphere node
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    this.objects.set(
      node,
      new RasterSphere(this.gl, node.center, node.radius, node.color)
    );
  }

  /**
   * Visits an axis aligned box node
   * @param  {AABoxNode} node - The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    this.objects.set(
      node,
      new RasterBox(this.gl, node.minPoint, node.maxPoint, node.color)
    );
  }

  /**
   * Visits a textured box node. Loads the texture
   * and creates a uv coordinate buffer
   * @param  {TextureBoxNode} node - The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) {
    this.objects.set(
      node,
      new RasterTextureBox(
        this.gl,
        node.minPoint,
        node.maxPoint,
        node.texture
      )
    );
  }

  visitPyramidNode(node: PyramidNode) {
    this.objects.set(
      node,
      new RasterPyramid(this.gl, node.minPoint, node.maxPoint, node.color)
    );
  }


  /**
   * Visits a group node in camera traversal
   * @param node The node to visit
   */
  visitGroupNodeCamera(node: GroupNode) {
    console.log("Method visitGroupNodeCamera not implemented.");
  }

  visitCameraNode(node: CameraNode) {
    console.log("Method visitCameraNode not implemented.");
  }

  visitLightNode(node: LightNode) {
    console.log("Method visitLightNode not implemented.");
  }

}
