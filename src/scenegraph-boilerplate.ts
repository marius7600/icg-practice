import "bootstrap";
import "bootstrap/scss/bootstrap.scss";
import MouseVisitor from "./mousevisitor";
import AABoxNode from "./nodes/aabox-node";
import { DriverNode, DriverNodeMouse, JumperNode, RotationNode, ScaleNode } from "./nodes/animation-nodes";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/shere-node";
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

let rasterizing: boolean = true;

let phongProperties: PhongProperties;
let light1: LightNode;
let light2: LightNode;
let light3: LightNode;

let cameraNode: CameraNode;
let rootNode: GroupNode;

let rasterVisitor: RasterVisitor;
let rayVisitor: RayVisitor;

let lastTimestamp: number;

let animationActivated: boolean = true;

let phongShader: Shader;
let textureShader: Shader;

let minMaxAnimation: ScaleNode;
let boxBounce: JumperNode;


export default interface PhongValues {
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
}

let selectedNode: Node;
let object: MeshNode | null = null;

let currentPlayer = true; // true = X, false = O

window.addEventListener("load", () => {
  const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
  const ctx_ray = canvas_ray.getContext("2d");

  const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
  const ctx_raster = canvas_raster.getContext("webgl2");

  const rasterSetupVisitor = new RasterSetupVisitor(ctx_raster);

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

  // // Function to clear the game
  // document.getElementById('clearGame')?.addEventListener('click', function () {
  //   ticTacToeRoot.children = [];
  //   const newTicTacToe = new GroupNode(new Translation(new Vector(-1.3, -1.4, 0, 0)));
  //   newTicTacToe.add(createTicTacToe());
  //   //Remove the old game and add a new one
  //   rightWindowGroup.children.pop();
  //   rightWindowGroup.add(newTicTacToe);
  //   rasterSetupVisitor.setup(rootNode);
  //   currentPlayer = true;
  // });

  // canvas_raster.addEventListener("mousemove", function (info) {
  //   const rect = canvas_raster.getBoundingClientRect();

  //   // Adjust the mouse coordinates to the center of the canvas
  //   const x = (info.x - rect.left) / rect.width * 5 - 2.5;
  //   const y = (info.y - rect.top) / rect.height * -5 + 2.5;

  //   //Set the magnifyingGroup position to the mouse position
  //   magnifyingGroup.transform = new Translation(new Vector(x, y, -4, 0));

  //   ctx_raster.bindFramebuffer(ctx_raster.FRAMEBUFFER, null);
  // });

  // canvas_ray.addEventListener("click", function (info) {
  //   setupWindow(info,
  //     ctx_raster,
  //     window1minimizeSphere,
  //     windowGroup1,
  //     taskbarButtonGroup1,
  //     window2MinimizeSphere,
  //     windowGroup2,
  //     taskbarButtonGroup2,
  //     taskbarButton1,
  //     taskbarButton2);
  // });

  // // Add a click event listener to the canvas
  // canvas_raster.addEventListener("click", function (info) {
  //   // Get the x and y coordinates of the click
  //   setupWindow(info,
  //     ctx_raster,
  //     window1minimizeSphere,
  //     windowGroup1,
  //     taskbarButtonGroup1,
  //     window2MinimizeSphere,
  //     windowGroup2,
  //     taskbarButtonGroup2,
  //     taskbarButton1,
  //     taskbarButton2);
  // });



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
  // startAnimation();

  // initialize the phong properties
  phongProperties = new PhongProperties();



  // let myBox = new AABoxNode(new Vector(50, 0.8, 0.8, 1));
  // sceneGraph.add(myBox);


  // setup for raytracing rendering
  rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);

  // setup for raster rendering

  rasterSetupVisitor.setup(Scenegraph.getGraph());

  phongShader = new Shader(ctx_raster, phongVertexShader, phongFragmentShader);

  textureShader = new Shader(
    ctx_raster,
    //TODO add texture shader
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
        // rasterVisitor.render(sceneGraph, cameraNode, lightPositions);
        rasterVisitor.render(Scenegraph.getGraph(), Scenegraph.getCamera())
      } else {
        // rayVisitor.render(sceneGraph, cameraNode, lightPositions, phongProperties);
        // rayVisitor.render(sceneGraph, cameraNode, phongProperties);
        rayVisitor.render(Scenegraph.getGraph(), phongProperties, 50000);
      }
      //requestAnimationFrame(animate);
      // console.log("animation loop ended");
      // console.log("animation loop ended");
      // console.log("animation loop ended");

      const animationNodeList = Scenegraph.getAnimationNodes();
      for (let animationNode of animationNodeList) {
        animationNode.simulate(delta);
      }
      window.requestAnimationFrame(animate);
    }

    // Verlangsamen Sie die Animation, indem Sie den Wert für deltaT teilen
    const animationSpeedFactor = 0.1; // Probieren Sie verschiedene Werte aus, bis die Animation das gewünschte Verhalten hat
    const deltaT = animationSpeedFactor * delta; // Verwenden Sie Ihre ursprünglichen deltaT-Werte

    // Jetzt führen Sie die Animation mit dem neuen deltaT aus
    // minimizeAnimation.simulate(deltaT);

    if (minMaxAnimation != null) {
      // console.log("minimizeAnimation is not null");
      minMaxAnimation.simulate(delta);
    }
    if (boxBounce != null) {
      // console.log("minimizeAnimation is null");
      boxBounce.simulate(delta);
    }
    //animationNode3.simulate(delta);
    // minimizeAnimation.simulate(delta);

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





  // requestAnimationFrame(animate);

  // let animationHandle: number;

  // let lastTimestamp = 0;
  // let animationTime = 0;
  // let animationHasStarted = true;
  // function animate(timestamp: number) {
  //     let deltaT = timestamp - lastTimestamp;
  //     if (animationHasStarted) {
  //         deltaT = 0;
  //         animationHasStarted = false;
  //     }
  //     animationTime += deltaT;
  //     lastTimestamp = timestamp;
  //     gnRotation.angle = animationTime / 2000;

  //
  //     // animationHandle = window.requestAnimationFrame(animate);
  // }

  // function startAnimation() {
  //     if (animationHandle) {
  //         window.cancelAnimationFrame(animationHandle);
  //     }
  //     animationHasStarted = true;
  //     function animation(t: number) {
  //         animate(t);
  //         animationHandle = window.requestAnimationFrame(animation);
  //     }
  //     animationHandle = window.requestAnimationFrame(animation);
  // }
  // animate(0);

  // document.getElementById("startAnimationBtn").addEventListener(
  //     "click", startAnimation);
  // document.getElementById("stopAnimationBtn").addEventListener(
  //     "click", () => cancelAnimationFrame(animationHandle));
});


function rotateWithPosition(textureVideoBoxGroup: GroupNode, angle: number) {
  const position = textureVideoBoxGroup.transform.getMatrix();
  const inverse = textureVideoBoxGroup.transform.getInverseMatrix();
  // let rotation = new Rotation(new Vector(1, 0, 0, 0), 9.25); //Weird rotation ich raffs garnicht????
  let rotation = new Rotation(new Vector(1, 0, 0, 0), angle); //Weird rotation ich raffs garnicht????
  rotation.matrix = position.mul(rotation.getMatrix());
  rotation.inverse = rotation.getInverseMatrix().mul(inverse);
  return rotation;
}

function setupWindow(info: MouseEvent,
  ctx_raster: WebGL2RenderingContext,
  rightWindowMinimizeSphere: SphereNode,
  rightWindowGroup: GroupNode,
  taskbarButtonGroup1: GroupNode,
  leftWindowMinimizeSphere: SphereNode,
  leftWindowGroup: GroupNode,
  taskbarButtonGroup2: GroupNode,
  taskbarButton1: AABoxNode,
  taskbarButton2: AABoxNode) {
  const x = info.offsetX;
  const y = info.offsetY;
  // Create a new mouse visitor
  const mouseVisitor = new MouseVisitor();
  // Use the mouse visitor to get the selected node
  let selectedNode = mouseVisitor.getSelectedNode(rootNode, x, y, ctx_raster);
  // If a node was selected
  if (selectedNode != null) {
    // If the selected node is a sphere
    if (selectedNode instanceof SphereNode) {
      // If x is smaller than half the canvas width, minimize rightWindowGroup, otherwise minimize leftWindowGroup
      if (x > ctx_raster.canvas.width / 2) {
        // Minimize window 1
        minimize(rightWindowGroup);
        // Jump the taskbar button
        jumpAnimation(taskbarButtonGroup1);
      } else {
        // Minimize window 2
        minimize(leftWindowGroup);
        // Jump the taskbar button
        jumpAnimation(taskbarButtonGroup2);
      }
    }
    // If the selected node is an AA box
    if (selectedNode instanceof AABoxNode) {
      // Determine which taskbar button was clicked, depending on the color of the box
      if (x > ctx_raster.canvas.width / 2) {
        // If the window is minimized, maximize it
        if (Math.floor(rightWindowGroup.getTransformation().getMatrix().data[0]) == 0) {
          maximize(rightWindowGroup);
        }

        // If the window is maximized, minimize it
        else {
          minimize(rightWindowGroup);
        }

        // Jump the taskbar button
        jumpAnimation(taskbarButtonGroup1);
      } else {
        // If the window is minimized, maximize it
        if (Math.floor(leftWindowGroup.getTransformation().getMatrix().data[0]) == 0) {
          maximize(leftWindowGroup);
        }

        // If the window is maximized, minimize it
        else {
          minimize(leftWindowGroup);
        }
        // Jump the taskbar button
        jumpAnimation(taskbarButtonGroup2);
      }
    }
  }
}

function jumpAnimation(taskbarButtonGroup1: GroupNode) {
  boxBounce = new JumperNode(taskbarButtonGroup1, new Vector(0, 1, 0, 0), taskbarButtonGroup1.getTransformation().getMatrix());
  boxBounce.toggleActive();
}

function minimize(rightWindowGroup: GroupNode) {
  const originalScale = new Vector(1, 1, 1, 1);
  const scaleAmout = 0.001;
  const targetScale = originalScale.mul(scaleAmout);
  const duration = 5000; // in milliseconds

  minMaxAnimation = new ScaleNode(rightWindowGroup, targetScale, duration);
  minMaxAnimation.toggleActive();
}

function maximize(rightWindowGroup: GroupNode) {
  const targetScale = new Vector(1.001, 1.001, 1.001, 1);
  const duration = 2; // 2 Sekunden Dauer der Animation
  minMaxAnimation = new ScaleNode(rightWindowGroup, targetScale, duration);
  minMaxAnimation.toggleActive();
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

