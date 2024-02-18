import "bootstrap";
import "bootstrap/scss/bootstrap.scss";
import MouseVisitor from "./mousevisitor";
import AABoxNode from "./nodes/aabox-node";
import { DriverNode, DriverNodeMouse, JumperNode, RotationNode, ScaleNode } from "./nodes/animation-nodes";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/sphere-node";
import PhongProperties from "./phong-properties";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import { RasterSetupVisitor, RasterVisitor } from "./rasterzier/rastervisitor";
import RayVisitor from "./raytracer/rayvisitor";
import phongFragmentShader from "./shader/phong-fragment-shader.glsl";
import phongVertexShader from "./shader/phong-vertex-perspective-shader.glsl";
import Shader from "./shader/shader";
import { EmptyTransformation, RotateWithPosition, Rotation, Scaling, Transform4x4, Translation } from "./transformation";
import Vector from "./vector";
import TextureBoxNode from "./nodes/texture-box-node";
import textureVertexShader from "./shader/texture-vertex-perspective-shader.glsl";
import textureFragmentShader from "./shader/texture-fragment-shader.glsl";
import Matrix from "./matrix";
import { Scenegraph } from "./scenegraph";
import JsonVisitor from "./jsonVisitor";
import TextureTextBoxNode from "./nodes/texture-text-box-node";
import Node from "./nodes/node";
import MeshNode from "./nodes/mesh-node";
import { Game } from "./game";
import { WindowNode } from "./nodes/window-node";
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


export default interface PhongValues {
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
}

let selectedNode: Node = null;



window.addEventListener("load", () => {
  const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
  const ctx_ray = canvas_ray.getContext("2d");

  const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
  const ctx_raster = canvas_raster.getContext("webgl2");

  const rasterSetupVisitor = new RasterSetupVisitor(ctx_raster);

  const mouseVisitor = new MouseVisitor();


  //!!!create scene graph!!!
  Scenegraph.createProjectGraph(canvas_raster.width, canvas_raster.height, rasterSetupVisitor);


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

  // Function to clear the game
  document.getElementById('clearGame')?.addEventListener('click', function () {
    Game.clearGame();
    rasterSetupVisitor.setup(Scenegraph.getGraph());
  });

  // FIXME: Implement Magnifying glass effect
  //// ========== MAGNIYING GLASS ==========
  // canvas_raster.addEventListener("mousemove", function (info) {
  //   const rect = canvas_raster.getBoundingClientRect();

  //   // Adjust the mouse coordinates to the center of the canvas
  //   const x = (info.x - rect.left) / rect.width * 5 - 2.5;
  //   const y = (info.y - rect.top) / rect.height * -5 + 2.5;

  //   //Set the magnifyingGroup position to the mouse position
  //   magnifyingGroup.transform = new Translation(new Vector(x, y, -4, 0));

  //   ctx_raster.bindFramebuffer(ctx_raster.FRAMEBUFFER, null);
  // });

  canvas_ray.addEventListener("click", function (info) {
    //Playing tik tak toe
    selectedNode = mouseVisitor.getSelectedNode(Scenegraph.getGraph(), info.offsetX, info.offsetY, ctx_raster);
    Game.CheckTikTakToeField(selectedNode, rasterSetupVisitor);
    // CheckTikTakToeField(currentPlayer, selectedNode);
  });

  // Add a click event listener to the canvas
  canvas_raster.addEventListener("click", function (info) {
    //Playing tik tak toe
    selectedNode = mouseVisitor.getSelectedNode(Scenegraph.getGraph(), info.offsetX, info.offsetY, ctx_raster);
    console.log("Object clicked: ", selectedNode);
    Game.CheckTikTakToeField(selectedNode, rasterSetupVisitor);
    // Handle events when clicking on objects with the mouse
    handleMouseclickEvent(selectedNode);
  });

  // Event listeners for the slider changes
  window.addEventListener("input", function (event) {
    sliderChanged(event);
  });
  /* Call figure toggle if key 2 is pressed */
  document.addEventListener("keydown", (event) => {
    if (event.key === "2") {
      toggleFigure();
    }
  });
  document.getElementById("animationToggle").addEventListener("click", () => {
    toggleAnimation();
  });

  // initialize the phong properties
  phongProperties = new PhongProperties();

  // setup for raytracing rendering
  rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);

  // setup for raster rendering

  rasterSetupVisitor.setup(Scenegraph.getGraph());

  phongShader = new Shader(ctx_raster, phongVertexShader, phongFragmentShader);

  textureShader = new Shader(
    ctx_raster,
    textureVertexShader,
    textureFragmentShader
  );

  rasterVisitor = new RasterVisitor(
    ctx_raster,
    phongShader,
    textureShader,
    rasterSetupVisitor.objects,
    phongProperties
  );

  phongShader.load();
  textureShader.load();
  rasterVisitor.setupCamera(Scenegraph.getCamera());


  lastTimestamp = performance.now();
  startAnimation();

  function startAnimation() {
    // start animation
    lastTimestamp = 0;
    Promise.all([phongShader.load(), textureShader.load()]).then(() => {
      window.requestAnimationFrame(animate);
    });
  }

  /* animate the scene */
  function animate(timestamp: number) {
    let delta = 0.01;
    if (animationActivated) {
      // console.log("animation loop started");
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }
      delta = (timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      if (rasterizing) {
        rasterVisitor.render(Scenegraph.getGraph(), Scenegraph.getCamera())
      } else {
        rayVisitor.render(Scenegraph.getGraph(), phongProperties, 50000);
      }


      const animationNodeList = Scenegraph.getAllNodesOfType(AnimationNode);
      for (let animationNode of animationNodeList) {
        animationNode.simulate(delta);
      }
      window.requestAnimationFrame(animate);
    }


  }

  function toggleAnimation() {
    console.log("toggle animation");
    console.log("Animation Activated old Satus: " + animationActivated);
    animationActivated = !animationActivated;
    console.log("Animation Activated new Satus: " + animationActivated);
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
        Scenegraph.fromJSON(files, rasterVisitor)
        console.log("JSON file uploaded");

      };
      reader.readAsText(files);
    };
    fileSelector.click();
  };
});

function handleMouseclickEvent(selectedNode: Node) {
  if (selectedNode == null || selectedNode.name == null) return;

  // if the seleded node starts with "minimizeSphere" slice the name and minimize the window
  if (selectedNode.name.startsWith("minimizeSphere")) {
    const windowName = selectedNode.name.slice(14);
    Scenegraph.getWindowNode(windowName).toggleMinMax();
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
      console.log("Ambient: " + value);
      break;
    case "diffuse_value":
      phongProperties.diffuse = value;
      console.log("Diffuse: " + value);
      break;
    case "specular_value":
      phongProperties.specular = value;
      console.log("Specular: " + value);
      break;
    case "shininess_value":
      phongProperties.shininess = value;
      console.log("Shininess: " + value);
      break;
    case "fov_value":
      cameraNode.fovy = value;
      console.log("FOV: " + value);
      break;
    case "light1_x_value":
      light1.position.x = value;
      console.log("Light1 x: " + value);
      break;
    case "light1_y_value":
      light1.position.y = value;
      console.log("Light1 y: " + value);
      break;
    case "light1_z_value":
      light1.position.z = value;
      console.log("Light1 z: " + value);
      break;
    default:
      console.log("Unknown slider: " + id);
      break;
  }
}

