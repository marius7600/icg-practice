import "bootstrap";
import "bootstrap/scss/bootstrap.scss";
import MouseVisitor from "./mousevisitor";
import AABoxNode from "./nodes/aabox-node";
import { DriverNode, JumperNode, RotationNode, ScaleNode } from "./nodes/animation-nodes";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/shere-node";
import PhongProperties from "./phong-properties";
import { RasterSetupVisitor, RasterVisitor } from "./rasterzier/rastervisitor";
import RayVisitor from "./raytracer/rayvisitor";
import phongFragmentShader from "./shader/phong-fragment-shader.glsl";
import phongVertexShader from "./shader/phong-vertex-perspective-shader.glsl";
import Shader from "./shader/shader";
import { EmptyTransformation, Rotation, Scaling, Translation } from "./transformation";
import Vector from "./vector";

let rasterizing: boolean = true;

let phongProperties: PhongProperties;
let light1: LightNode;

let cameraNode: CameraNode;
let rootNode: GroupNode;

let rasterVisitor: RasterVisitor;
let rayVisitor: RayVisitor;

let lastTimestamp: number;

let animationActivated: boolean = true;

let phongShader: Shader;
let textureShader: Shader;

let minimizeAnimation: ScaleNode;

window.addEventListener("load", () => {
  const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
  const ctx_ray = canvas_ray.getContext("2d");

  const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
  const ctx_raster = canvas_raster.getContext("webgl2");

  // canvas_raster.addEventListener("mousemove", function (info) {
  //   const x = info.x
  //   const y = info.y
  // });

  canvas_ray.addEventListener("click", function (info) {
    const x = info.offsetX
    const y = info.offsetY
    const mouseVisitor = new MouseVisitor();
    let selectedNode = mouseVisitor.getSelectedNode(rootNode, x, y, ctx_ray);
    if (selectedNode != null) {
      console.log(selectedNode);
    }
  });

  canvas_raster.addEventListener("click", function (info) {
    const x = info.offsetX
    const y = info.offsetY
    const mouseVisitor = new MouseVisitor();
    let selectedNode = mouseVisitor.getSelectedNode(rootNode, x, y, ctx_raster);
    if (selectedNode != null) {
      console.log(selectedNode);
      if (selectedNode instanceof SphereNode) {
        console.log(selectedNode.color);
        if (selectedNode.color == window1minimizeSphere.color) {
          console.log("Window 1 minimize");
          // windowGroup1.transform = new Translation(new Vector(222, 0, -1, 0));#
          //   const animationNode3 = new ScalerNode(windowGroup1, new Vector(1, 1, 1, 0));
          // Animiere das Fenster so, dass es auf 90% der Originalgröße skaliert wird
          const originalScale = new Vector(1, 1, 1, 1);
          const scaleAmout = 0.000000001;
          const targetScale = originalScale.mul(scaleAmout);
          const duration = 5000; // in milliseconds

          minimizeAnimation = new ScaleNode(windowGroup1, targetScale, duration);
          minimizeAnimation.toggleActive();

        }
        if (selectedNode.color == window2MinimizeSphere.color) {
          console.log("Window 2 minimize");
          // windowGroup2.transform = new Translation(new Vector(-222, 0, -1, 0));
          // Animiere das Fenster so, dass es auf 90% der Originalgröße skaliert wird
          const targetScale = new Vector(0.000000001, 0.000000001, 0.000000001, 1);
          const duration = 5000; // 2 Sekunden Dauer der Animation
          minimizeAnimation = new ScaleNode(windowGroup2, targetScale, duration);
          minimizeAnimation.toggleActive();

        }
      }
      if (selectedNode instanceof AABoxNode) {
        console.log(selectedNode.color);
        if (selectedNode.color == taskbarButton1.color) {
          console.log("Taskbar Button 1");
          // windowGroup2.transform = new Translation(new Vector(-222, 0, -1, 0));
          // minimizeAnimation = new ScaleNode(windowGroup1, new Vector(-1, -1, -1, 0));
          //minimizeAnimation.toggleActive();
        }
        if (selectedNode.color == taskbarButton2.color) {
          const targetScale = new Vector(1.01, 1.01, 1.01, 1);
          const duration = 1; // 2 Sekunden Dauer der Animation
          minimizeAnimation = new ScaleNode(windowGroup2, targetScale, duration);
          minimizeAnimation.toggleActive();
        }
      }
    }
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
  // startAnimation();

  // initialize the phong properties
  phongProperties = new PhongProperties();

  /* Create the scenegraph */
  rootNode = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
  cameraNode = new CameraNode(
    new Vector(0, 0, 0, 1), // eye
    new Vector(0, 0, -1, 1), // center
    new Vector(0, 1, 0, 0), // up
    60, // fov
    canvas_raster.width / canvas_raster.height, // aspect
    0.1, // near
    100
  ); // far
  rootNode.add(cameraNode);

  // add group node
  const groupNode1 = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
  rootNode.add(groupNode1);

  // add light node
  light1 = new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(0, 4, -2, 0));
  groupNode1.add(light1);


  const taskbarButtonDimension = new Vector(.7, .7, .3, 0);
  const taskbarButtonColor = new Vector(0, 2, 0, 1);

  // add Taskbar to SceneGraph
  const taskbarGroup = new GroupNode(new Translation(new Vector(0, -3.3, -1, 0)));
  groupNode1.add(taskbarGroup);

  const taskBarBackground = new AABoxNode(new Vector(10, .2, .3, 0), new Vector(2, 2, 0, 1));
  taskbarGroup.add(taskBarBackground)

  // add Taskbar Buttons
  const taskbarButtonGroup1 = new GroupNode(new Translation(new Vector(-2, .45, 0, 0)));
  const taskbarButton1 = new AABoxNode(taskbarButtonDimension, taskbarButtonColor);
  taskbarButtonGroup1.add(taskbarButton1)
  taskbarGroup.add(taskbarButtonGroup1)

  //add Taskbar Button 2
  const taskbarButtonGroup2 = new GroupNode(new Translation(new Vector(2, .45, 0, 0)));
  const taskbarButton2 = new AABoxNode(taskbarButtonDimension, taskbarButtonColor);
  taskbarButtonGroup2.add(taskbarButton2)
  taskbarGroup.add(taskbarButtonGroup2)


  // variables for the windows
  const windowDimension = new Vector(3, 3, 0, 1);
  const windowBackgroundColor = new Vector(0.8, 0.8, 0.8, 1);

  const windowMenuDimension = new Vector(3, 0.5, 0.01, 1);
  const windowMenuBackgroundColor = new Vector(0, 0, 1, 1);

  const minimizeSphereDimension = new Vector(1.3, 0, 0, 1);
  const minimizeSphereRadius = 0.13;
  const minimizeSphereColor = new Vector(0.9, 0.7, 0.3, 1);

  // groupNode for the first application window
  const windowGroup1 = new GroupNode(new Translation(new Vector(1.8, 0, -1, 0)));
  groupNode1.add(windowGroup1);

  // add background for windowGroup1
  const window1Background = new AABoxNode(windowDimension, windowBackgroundColor);
  windowGroup1.add(window1Background);

  const window1Menu = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
  const window1MenuBackground = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
  window1Menu.add(window1MenuBackground);

  const window1minimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
  window1Menu.add(window1minimizeSphere);

  windowGroup1.add(window1Menu);

  // groupNode for the secound application window
  const windowGroup2 = new GroupNode(new Translation(new Vector(-1.8, 0, -1, 0)));
  groupNode1.add(windowGroup2);

  // add background for windowGroup2
  const window2Background = new AABoxNode(windowDimension, windowBackgroundColor);
  windowGroup2.add(window2Background);

  const window2Menu = new GroupNode(new Translation(new Vector(0, 1.5, 0, 0)));
  windowGroup2.add(window2Menu);

  // Add menue bar on window 2 
  const window2MenuBackground = new AABoxNode(windowMenuDimension, windowMenuBackgroundColor);
  window2Menu.add(window2MenuBackground);

  // Add minimize sphere on window 2
  // const window2MinimizeSphere = new SphereNode(minimizeSphereColor, minimizeSphereDimension, minimizeSphereRadius);
  const window2MinimizeSphere = new SphereNode(new Vector(0.9001, 0.7, 0.3, 1), minimizeSphereDimension, minimizeSphereRadius);
  window2Menu.add(window2MinimizeSphere);


  //Add animation node
  // const animationNode = new RotationNode(gn1, new Vector(0, 1, 0, 0));
  // const animationNode3 = new JumperNode(taskbarButtonGroup2, new Vector(0, 1, 0, 0));

  // const animationNode4 = new DriverNode(gn1);
  // const animationNode3 = new ScaleNode(taskbarButtonGroup2, new Vector(-1, -1, -1, 0));
  // animationNode3.toggleActive();

  /***************************************************************/
  /*********************  END OF SCENE GRAPH *********************/
  /***************************************************************/

  // let myBox = new AABoxNode(new Vector(50, 0.8, 0.8, 1));
  // sceneGraph.add(myBox);

  // setup for raytracing rendering
  rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);

  // setup for raster rendering
  const rasterSetupVisitor = new RasterSetupVisitor(ctx_raster);
  rasterSetupVisitor.setup(rootNode);

  phongShader = new Shader(ctx_raster, phongVertexShader, phongFragmentShader);

  textureShader = new Shader(
    ctx_raster,
    //TODO add texture shader
    phongVertexShader,
    phongFragmentShader
  );

  rasterVisitor = new RasterVisitor(
    ctx_raster,
    phongShader,
    textureShader,
    rasterSetupVisitor.objects,
    phongProperties
  );
  phongShader.load();
  rasterVisitor.setupCamera(cameraNode);


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
        rasterVisitor.render(rootNode, cameraNode);
      } else {
        // rayVisitor.render(sceneGraph, cameraNode, lightPositions, phongProperties);
        // rayVisitor.render(sceneGraph, cameraNode, phongProperties);
        rayVisitor.render(rootNode, phongProperties);
      }
      //requestAnimationFrame(animate);
      // console.log("animation loop ended");
      // console.log("animation loop ended");
      // console.log("animation loop ended");
      //animationNode2.simulate(delta);
      window.requestAnimationFrame(animate);
    }

    // Verlangsamen Sie die Animation, indem Sie den Wert für deltaT teilen
    const animationSpeedFactor = 0.1; // Probieren Sie verschiedene Werte aus, bis die Animation das gewünschte Verhalten hat
    const deltaT = animationSpeedFactor * delta; // Verwenden Sie Ihre ursprünglichen deltaT-Werte

    // Jetzt führen Sie die Animation mit dem neuen deltaT aus
    // minimizeAnimation.simulate(deltaT);

    if (minimizeAnimation != null) {
      // console.log("minimizeAnimation is not null");
      minimizeAnimation.simulate(delta);
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

