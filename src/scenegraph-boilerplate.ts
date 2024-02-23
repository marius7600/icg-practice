import "bootstrap";
import "bootstrap/scss/bootstrap.scss";
import MouseVisitor from "./mousevisitor";
import { JumperNode } from "./nodes/animation-nodes";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import PhongProperties from "./phong-properties";
import { RasterSetupVisitor, RasterVisitor } from "./rasterzier/rastervisitor";
import RayVisitor from "./raytracer/rayvisitor";
import phongFragmentShader from "./shader/phong-fragment-shader.glsl";
import phongVertexShader from "./shader/phong-vertex-perspective-shader.glsl";
import Shader from "./shader/shader";
import Vector from "./math/vector";
import textureVertexShader from "./shader/texture-vertex-perspective-shader.glsl";
import textureFragmentShader from "./shader/texture-fragment-shader.glsl";
import Matrix from "./math/matrix";
import { Scenegraph } from "./scenegraph";
import JsonVisitor from "./jsonVisitor";
import Node from "./nodes/node";
import { TicTacToe } from "./ticTacToe";
import AnimationNode from "./nodes/animation-nodes";

let rasterizing: boolean = true;

let phongProperties: PhongProperties;
let light1: LightNode;

let cameraNode: CameraNode;
let rasterVisitor: RasterVisitor;
let rayVisitor: RayVisitor;

let lastTimestamp: number;

let animationActivated: boolean = true;

let phongShader: Shader;
let textureShader: Shader;

let myJumperNode: JumperNode = null;

let canvas_raster: HTMLCanvasElement;
let ctx_raster: WebGL2RenderingContext;

let rasterSetupVisitor: RasterSetupVisitor;
let mouseVisitor: MouseVisitor;
let canvas_ray: HTMLCanvasElement
let ctx_ray: CanvasRenderingContext2D;


export default interface PhongValues {
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
}

let selectedNode: Node = null;

// Load the scene graph and start the main function
window.addEventListener("load", main);

/**
 * Handles the mouse click event on a selected node.
 * @param selectedNode - The selected node.
 * @param mouseX - The x-coordinate of the mouse click.
 * @param mouseY - The y-coordinate of the mouse click.
 */
function handleMouseclickEvent(selectedNode: Node, mouseX: number, mouseY: number) {
  if (selectedNode == null || selectedNode.name == null) return;

  // if the seleded node starts with "minimizeSphere" slice the name and minimize the window
  if (selectedNode.name.startsWith("minimizeSphere")) {
    const windowName = selectedNode.name.slice(14);
    Scenegraph.getWindowNode(windowName).toggleMinMax();
  }
  if (selectedNode.name.startsWith("maximizeSphere")) {
    const windowName = selectedNode.name.slice(14);
    Scenegraph.getWindowNode(windowName).fullScreen(Scenegraph.getGroupNodeCamera(), Scenegraph.getWindowNode(windowName));
  }
  // if the seleded node starts with "taskbarButton" slice the name, minimize the window and jump the taskbar button
  if (selectedNode.name.startsWith("taskbarButton")) {
    const windowName = selectedNode.name.slice(13);
    Scenegraph.getWindowNode(windowName).toggleMinMax();

    const taskbarButtonGroup = Scenegraph.getGroupNode("taskbarButtonGroup" + windowName);
    const startingPosition = taskbarButtonGroup.getTransformation().getMatrix();

    jumpAnimation(taskbarButtonGroup, startingPosition);
  }
}

/**
 * Performs a jump animation on the taskbarButtonGroup.
 * If a jumper node already exists, it updates the jumper node with the new taskbarButtonGroup and starting position.
 * If a jumper node does not exist, it creates a new jumper node and adds it to the taskbarButtonGroup.
 * @param taskbarButtonGroup - The group node to perform the jump animation on.
 * @param startingPosition - The starting position of the jump animation.
 */
function jumpAnimation(taskbarButtonGroup: GroupNode, startingPosition: Matrix) {
  if (myJumperNode == null) {
    // Create a new jumper node and add it to the taskbarButtonGroup
    myJumperNode = new JumperNode(taskbarButtonGroup, new Vector(0, 1, 0, 0), taskbarButtonGroup.getTransformation().getMatrix());
    taskbarButtonGroup.add(myJumperNode);

    // Start the jump animation
    myJumperNode.toggleActive();
  } else {
    if (!myJumperNode.active) {
      // update the jumper node with the new taskbarButtonGroup and starting position
      myJumperNode.groupNode = taskbarButtonGroup;
      myJumperNode.startingPos = startingPosition;

      // Start the jump animation
      myJumperNode.toggleActive();
    }
  }
}



/* Toggle visability between the raytracer and rasterizer canvas */
function toggleFigure() {
  const ray_canvas = document.getElementById("raytracer_fig");
  const raster_canvas = document.getElementById("rasterizer_fig");
  if (ray_canvas.style.display === "none") {
    ray_canvas.style.display = "block";
    raster_canvas.style.display = "none";
    rasterizing = !rasterizing;
  } else {
    ray_canvas.style.display = "none";
    raster_canvas.style.display = "block";
    rasterizing = !rasterizing;
  }
}

/* update the phong properties if a slider is changed */
function sliderChanged(event: any) {
  const slider = event.target;
  const value = slider.value;
  const id = slider.id;
  switch (id) {
    case "ambient_value":
      phongProperties.ambient = value;
      break;
    case "diffuse_value":
      phongProperties.diffuse = value;
      break;
    case "specular_value":
      phongProperties.specular = value;
      break;
    case "shininess_value":
      phongProperties.shininess = value;
      break;
    case "fov_value":
      cameraNode.fovy = value;
      break;
    case "light1_x_value":
      light1.position.x = value;
      break;
    case "light1_y_value":
      light1.position.y = value;
      break;
    case "light1_z_value":
      light1.position.z = value;
      break;
    default:
      console.log("Unknown slider: " + id);
      break;
  }
}

/**
 * Creates a drawing canvas and sets up event listeners for drawing functionality.
 */
function createDrawingCanvas() {
  // Get a reference to the canvas and its context
  const canvas = document.getElementById('drawing') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  // Set the fill color to black
  ctx.fillStyle = 'white';

  // Flag to keep track of whether the mouse button is down
  let isDrawing = false;

  // Function to start drawing
  canvas.addEventListener('mousedown', function () {
    isDrawing = true;
  });

  // Function to stop drawing
  canvas.addEventListener('mouseup', function () {
    isDrawing = false;
  });

  // Function to draw a pixel at the mouse position
  canvas.addEventListener('mousemove', function (e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.fillRect(x, y, 3, 3);
  });

  // Function to clear the drawable canvas
  document.getElementById('clearCanvas')?.addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

/**
 * Creates event listeners for various interactions in the scene graph.
 */
function createEventListeners() {
  // Function to clear the tic tac toe field
  document.getElementById('clearGame')?.addEventListener('click', function () {
    TicTacToe.clearGame();
    rasterSetupVisitor.setup(Scenegraph.getGraph());
  });

  // Add a click event listener to the ray canvas
  canvas_ray.addEventListener("click", function (info) {
    selectedNode = mouseVisitor.getSelectedNode(Scenegraph.getGraph(), info.offsetX, info.offsetY, ctx_raster);
    // Handle events when clicking on objects with the mouse
    handleMouseclickEvent(selectedNode, info.x, info.y);
  });

  // Add a click event listener to the raster canvas
  canvas_raster.addEventListener("click", function (info) {
    selectedNode = mouseVisitor.getSelectedNode(Scenegraph.getGraph(), info.offsetX, info.offsetY, ctx_raster);
    TicTacToe.CheckTikTakToeField(selectedNode, rasterSetupVisitor);
    // Handle events when clicking on objects with the mouse
    handleMouseclickEvent(selectedNode, info.x, info.y);
  });

  // Event listeners for the slider changes
  window.addEventListener("input", function (event) {
    sliderChanged(event);
  });


  // Event listener for the keydown event to stop the animation
  window.addEventListener("keydown", (event) => {
    if (event.key === "p") {
      Scenegraph.getAllNodesOfType(AnimationNode).forEach((node) => {
        if (node.name == null) return;
        if (node.name.startsWith("animateLight")) {
          node.toggleActive();
        }
      }
      )
    }

  })

  // toggle between raytracer and rasterizer
  document.addEventListener("keydown", (event) => {
    if (event.key === "2") {
      toggleFigure();
    }
  });
}

/**
 * The main entry point of the application.
 */
function main() {
  canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
  ctx_ray = canvas_ray.getContext("2d");

  canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
  ctx_raster = canvas_raster.getContext("webgl2");

  rasterSetupVisitor = new RasterSetupVisitor(ctx_raster);

  mouseVisitor = new MouseVisitor();

  // Create the drawing canvas
  createDrawingCanvas();

  //!!!create scene graph!!!\\
  Scenegraph.createProjectGraph(canvas_raster.width, canvas_raster.height, rasterSetupVisitor);

  // Create event listeners
  createEventListeners();

  document.getElementById("animationToggle").addEventListener("click", () => {
    toggleAnimation();
  });

  // initialize the phong properties
  phongProperties = new PhongProperties();

  // setup for raytracing rendering
  rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);

  // setup for raster rendering
  rasterSetupVisitor.setup(Scenegraph.getGraph());

  // create the phong shader
  phongShader = new Shader(ctx_raster, phongVertexShader, phongFragmentShader);

  // create the texture shader
  textureShader = new Shader(
    ctx_raster,
    textureVertexShader,
    textureFragmentShader
  );

  // create the raster visitor
  rasterVisitor = new RasterVisitor(
    ctx_raster,
    phongShader,
    textureShader,
    rasterSetupVisitor.objects,
    phongProperties
  );

  // load shaders
  phongShader.load();
  textureShader.load();

  // setup the camera
  rasterVisitor.setupCamera(Scenegraph.getCamera());


  lastTimestamp = performance.now();
  startAnimation();

  /**
   * Starts the animation loop.
   */
  function startAnimation() {
    lastTimestamp = 0;
    Promise.all([phongShader.load(), textureShader.load()]).then(() => {
      window.requestAnimationFrame(animate);
    });
  }

  /**
   * Animates the scene graph based on the given timestamp.
   * @param timestamp - The current timestamp.
   */
  function animate(timestamp: number) {
    let delta = 0.01;
    if (animationActivated) {
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      delta = (timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      if (rasterizing) {
        rasterVisitor.render(Scenegraph.getGraph(), Scenegraph.getCamera())
      } else {
        rayVisitor.render(Scenegraph.getGraph(), phongProperties, 500000);
      }
      const animationNodeList = Scenegraph.getAllNodesOfType(AnimationNode);

      for (let animationNode of animationNodeList) {
        animationNode.simulate(delta);
      }
      window.requestAnimationFrame(animate);
    }
  }

  /**
   * Toggles the animation state.
   */
  function toggleAnimation() {
    animationActivated = !animationActivated;
    if (animationActivated) {
      document.getElementById("animationToggle").style.background = "green";
      startAnimation();
    } else {
      document.getElementById("animationToggle").style.background = "red";
      lastTimestamp = 0;
    }
  }

  // dowload scene as JSON file
  document.getElementById('downloadButton').addEventListener("click", () => {
    new JsonVisitor().saveSceneGraph(Scenegraph.getGraph())
  })

  // upload scene from JSON file
  let uploadButton = document.getElementById("uploadButton");
  uploadButton.onclick = () => {
    let fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.onchange = () => {
      let files = fileSelector.files[0];
      let reader = new FileReader();
      reader.onload = (event) => {
        Scenegraph.fromJSON(files, rasterVisitor, rasterSetupVisitor)
        console.log("JSON file uploaded");


      };
      reader.readAsText(files);
    };
    fileSelector.click();
  };
}