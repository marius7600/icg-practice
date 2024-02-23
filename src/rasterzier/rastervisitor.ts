import Matrix from "../math/matrix";
import AABoxNode from "../nodes/aabox-node";
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
import Shader from "../shader/shader";
import Vector from "../math/vector";
import Visitor from "../visitor";
import RasterPyramid from "./raster-Pyramid";
import RasterBox from "./raster-box";
import RasterMeshObject from "./raster-mesh-object";
import RasterSphere from "./raster-sphere";
import RasterTextureBox from "./raster-texture-box";
import RasterTextTextureBox from "./raster-texture-box-text";
import RasterVideoTextureBox from "./raster-texture-box-video";
import AnimationNode from "../nodes/animation-nodes";
import { Scenegraph } from "../scenegraph";
import { WindowNode } from "../nodes/window-node";

/**
 * Interface for renderable objects
 */
interface Renderable {
  render(shader: Shader): void;
}

/**
 * Class representing a Visitor that uses Rasterisation to render a Scenegraph
 */
export class RasterVisitor implements Visitor {
  /**
   * The stack of matrices used for transformations
   */
  stack: [{ traverse: Matrix; inverse: Matrix }];

  /**
   * The light nodes in the scene
   */
  lightNodes: Array<LightNode> = [];

  /**
   * The current matrix
   */
  matrix: Matrix = Matrix.identity();

  /**
   * The view matrix to transform vertices from the world coordinate system to the view coordinate system 
   */
  private lookat: Matrix;

  /**
   * The perspective matrix to transform vertices from the view coordinate system to the clip coordinate system
   */
  private perspective: Matrix;


  /**
   * Creates a new RasterVisitor instance.
   * @param gl - The WebGL2 rendering context.
   * @param shader - The phong shader used for rendering.
   * @param textureshader - The shader used for rendering textures.
   * @param renderables - A WeakMap that maps Nodes to their corresponding Renderables.
   * @param phongProperties - The PhongProperties used for shading.
   */
  constructor(
    private gl: WebGL2RenderingContext,
    private shader: Shader,
    private textureshader: Shader,
    private renderables: WeakMap<Node, Renderable>,
    private phongProperties: PhongProperties
  ) {
    this.stack = [{ traverse: Matrix.identity(), inverse: Matrix.identity() }];
    this.phongProperties = phongProperties;
  }


  /**
   * Renders the scene by traversing the scene graph and rendering each node.
   * 
   * @param rootNode - The root node of the scene graph.
   * @param camera - The camera node used for rendering.
   */
  render(rootNode: Node, camera: CameraNode) {
    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.stack = [{ traverse: Matrix.identity(), inverse: Matrix.identity() }];
    this.lightNodes = [];

    // setup camera 
    this.setupCamera(camera);

    // search for light nodes and set them in the lights array
    this.getLightNodes(rootNode);

    // traverse scenegraph and render
    rootNode.accept(this);
  }


  /**
   * Searches for light nodes in the scene graph and adds them to the lightNodes array
   * @param node The node to be searched for light nodes
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
   * Helper function to setup camera matrices
   * @param {CameraNode} - camera The camera used
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
   * Visits a group node and pushes the transformation matrix to the stack and then visits the children of the group node
   * @param {GroupNode} node - The node to visit
   */
  visitGroupNode(node: GroupNode) {
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
   * Visits a sphere node and calls the visitNode method with the correct shader
   * @param {SphereNode} node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    if (node.texture) {
      this.visitNode(node, this.textureshader);
    }
    else {
      this.visitNode(node, this.shader);
    }
  }

  /**
   * Visits an axis aligned box node and calls the visitNode method with the correct shader
   * @param  {AABoxNode} node - The node to visit
  */
  visitAABoxNode(node: AABoxNode) {
    if (node.texture) {
      this.visitNode(node, this.textureshader);
    }
    else {
      this.visitNode(node, this.shader);
    }
  }

  /**
   * Visits a PyramidNode and calls visitNode with the appropriate shader based on whether it has a texture or not.
   * @param node - The PyramidNode to visit.
   */
  visitPyramidNode(node: PyramidNode) {
    if (node.texture) {
      this.visitNode(node, this.textureshader);
    }
    else {
      this.visitNode(node, this.shader);
    }
  }

  /**
   * Visits a textured box node and calls the visitNode method with the correct shader
   * @param  {TextureBoxNode} node - The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) {
    this.visitNode(node, this.textureshader);
  }

  /**
   * Visits a TextureVideoBoxNode and calls the visitNode method with the correct shader
   * @param {TextureVideoBoxNode} node - The TextureVideoBoxNode to visit.
   */
  visitTextureVideoBoxNode(node: TextureVideoBoxNode) {
    this.visitNode(node, this.textureshader);
  }

  /**
   * Visits a TextureTextBoxNode and calls the visitNode method with the correct shader
   * @param {TextureTextBoxNode} node - The TextureTextBoxNode to visit.
   */
  visitTextureTextBoxNode(node: TextureTextBoxNode): void {
    this.visitNode(node, this.textureshader);
  }

  /**
   * Visits a MeshNode and calls the visitNode method with the correct shader
   * @param {MeshNode} node - The MeshNode to visit.
   */
  visitMeshNode(node: MeshNode): void {
    this.visitNode(node, this.shader);
  }

  /**
   * Visits a group node in the camera traversal used in GroupNode Base Class
   * searches for Camera, if found visitCameraNode() is called
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
        // Recursive call of the method in group node class
        child.acceptOnlyCamera(this);
      }
    }
    this.stack.pop();
  }

  /**
   * Visits a CameraNode and update the lookat and perspective matrices.
   * @param node - The CameraNode to visit.
   */
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

  /**
   * Visits a LightNode.
   * Updates the position of the visited node based on the current transformation matrix.
   * Then visits the node with the specified shader.
   * 
   * @param node - The LightNode to visit.
   * @returns void
   */
  visitLightNode(node: LightNode): void {
    // Get the current transformation matrix
    let m = this.stack.at(this.stack.length - 1).traverse;

    // Iterate over the lightNodes
    for (let i = 0; i < this.lightNodes.length; i++) {
      // Check if the current node is the same as the visited node
      if (this.lightNodes[i] === node) {
        // Update the position of the node
        this.lightNodes[i].position = m.mul(new Vector(0, 0, 0, 1));
      }
    }

    // Visit the node with the shader
    this.visitNode(node, this.shader);
  }

  /**
   * Visits an AnimationNode and sets it as the current animation node in the Scenegraph.
   * 
   * @param node The AnimationNode to visit.
   */
  visitAnimationNode(node: AnimationNode): void {
    Scenegraph.setAnimationNode(node);
  }

  /**
   * Visits a node and applies the specified shader.
   * Sets the matrices, phong properties and light positions to the shader and renders the node.
   * @param node - The node to visit.
   * @param shader - The shader to apply.
   */
  private visitNode(node: Node, shader: Shader) {
    shader.use();

    let toWorld = Matrix.identity();
    let fromWorld = Matrix.identity();

    // Calculate the model matrix
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

    // set the material properties
    shader.getUniformFloat("u_ka").set(this.phongProperties.ambient);
    shader.getUniformFloat("u_kd").set(this.phongProperties.diffuse);
    shader.getUniformFloat("u_ks").set(this.phongProperties.specular);
    shader.getUniformFloat("u_shininess").set(this.phongProperties.shininess);
    shader.getUniformInt("u_number_of_lights").set(this.lightNodes.length);

    // iterate over the light nodes and set the light properties in the shader (shader can handle up to 8 lights)
    for (let i = 0; i < this.lightNodes.length && i < 8; i++) {
      shader.getUniformVec3("u_light_positions[" + i + "]").set(this.lightNodes[i].position);
      shader.getUniformVec3("u_light_colors[" + i + "]").set(this.lightNodes[i].color);
    }

    // Call the render method of the node to render it
    this.renderables.get(node)?.render(shader);
  }
}

/**
 * Class representing a Visitor that sets up buffers and objects
 * for use by the RasterVisitor
 * */
export class RasterSetupVisitor implements Visitor {
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
   * Visits a group node and its children
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    for (let child of node.children) {
      child.accept(this);
    }
  }

  /**
   * Visits a sphere node.
   * Creates a RasterSphere object based on the node's properties which is then added to the objects map.
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    this.objects.set(
      node,
      new RasterSphere(this.gl, node.center, node.radius, node.color, node.texture)
    );
  }

  /**
   * Visits an axis aligned box node.
   * Creates a RasterBox object based on the node's properties which is then added to the objects map.
   * @param  {AABoxNode} node - The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    this.objects.set(
      node,
      new RasterBox(
        this.gl,
        node.minPoint,
        node.maxPoint,
        node.color,
        node.texture
      )
    );
  }

  /**
   * Visits a textured box node. Loads the texture and creates a uv coordinate buffer.220px
   * Creates a RasterTextureBox object based on the node's properties and adds it to the objects map.
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

  /**
   * Visits a TextureTextBoxNode and creates a RasterTextTextureBox object based on the node's properties and adds it to the objects map.
   * If the node has a normal map, it will be used; otherwise no normal map will be used.
   * @param node The TextureTextBoxNode to visit.
   */
  visitTextureTextBoxNode(node: TextureTextBoxNode) {
    let normalMap = "normalneutral.png";
    if (node.normal) {
      normalMap = node.normal;
    }
    this.objects.set(
      node,
      new RasterTextTextureBox(this.gl, node.minPoint, node.maxPoint, node.texture)
    );
  }

  /**
   * Visits a TextureVideoBoxNode and creates a RasterVideoTextureBox object based on its properties and adds it to the objects map.
   * If the node has a normal map, it will be used; otherwise no normal map will be used.
   * @param node The TextureVideoBoxNode to visit.
   */
  visitTextureVideoBoxNode(node: TextureVideoBoxNode) {
    let normalMap = "normalneutral.png";
    if (node.normal) {
      normalMap = node.normal;
    }
    this.objects.set(
      node,
      new RasterVideoTextureBox(this.gl, node.minPoint, node.maxPoint, node.texture)
    );
  }

  /**
   * Visits a PyramidNode and creates a RasterPyramid object based on the node's properties and adds it to the objects map.
   * If the node has a texture, the RasterPyramid object will be created with the texture.
   * If the node does not have a texture, the RasterPyramid object will be created without the texture.
   * @param node - The PyramidNode to visit.
   */
  visitPyramidNode(node: PyramidNode) {
    if (node.texture) {
      this.objects.set(
        node,
        new RasterPyramid(this.gl, node.minPoint, node.maxPoint, node.color, node.texture)
      );
    } else {
      this.objects.set(
        node,
        new RasterPyramid(this.gl, node.minPoint, node.maxPoint, node.color)
      );
    }
  }

  /**
   * Visits a MeshNode and creates a RasterMeshObject and adds it to the objects map.
   * @param node The MeshNode to visit.
   */
  visitMeshNode(node: MeshNode) {
    this.objects.set(node, new RasterMeshObject(this.gl, node.vertices, node.normals, node.color));
  }

  /**
   * Visits a AnimationNode, nothing to do here
   */
  visitAnimationNode(node: AnimationNode): void { }



  /**
   * Visits a GroupCameraNode, nothing to do here
   */
  visitGroupNodeCamera(node: GroupNode) { }

  /**
 * Visits a CameraNode, nothing to do here
 */
  visitCameraNode(node: CameraNode) { }


  /**
 * Visits a LightNode, nothing to do here
 */
  visitLightNode(node: LightNode) { }

}
