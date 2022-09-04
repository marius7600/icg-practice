import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode,
    AABoxNode,
    CameraNode,
    LightNode
} from './nodes';
import RayVisitor from './raytracer/rayvisitor';
import { Rotation, Scaling, Translation } from './transformation';
import { RasterSetupVisitor, RasterVisitor } from './rasterzier/rastervisitor';
import Shader from './shader/shader';
import phongVertexShader from './shader/phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './shader/phong-fragment-shader.glsl';
import PhongProperties from './phong-properties'

let rasterizing: boolean = true;

let phongProperties: PhongProperties;

let cameraNode: CameraNode;
let sceneGraph: GroupNode;

let rasterVisitor: RasterVisitor;
let rayVisitor: RayVisitor;

let lastTimestamp: number;

window.addEventListener('load', () => {
    const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
    const ctx_ray = canvas_ray.getContext("2d");
    
    const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
    const ctx_raster = canvas_raster.getContext("webgl2");

    // Event listeners for the slider changes
    window.addEventListener('input', function (event) {
        sliderChanged(event)
        });
    /* Call figure toggle if key 2 is pressed */
    document.addEventListener('keydown', (event) => {
        if (event.key === '2') {
            toggleFigure();
        }
    });

    // initialize the phong properties
    phongProperties = new PhongProperties();


    /* Create the scenegraph */
    sceneGraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    cameraNode = new CameraNode(
        new Vector(0, 0, -2, 1), // eye
        new Vector(0, 0, 0, 1), // center
        new Vector(0, 1, 0, 0), // up
        60,
        canvas_raster.width / canvas_raster.height,
        0.1,
        100);
    sceneGraph.add(cameraNode);
    const gn = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    sceneGraph.add(gn);
    gn.add(new SphereNode(new Vector(.4, 0, 0, 1), new Vector(1, 1, 1, 1), 1));
    // gn.add(new SphereNode(new Vector(.4, .7, 0, 1), new Vector(0, 0, 0, 1), 1));
    // gn.add(new SphereNode(new Vector(.4, -.7, .420, 1), new Vector(2, 1, 0, 1), 1));
    // sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(0, 0, 0, 1)));
    // sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(1, -1, 1, 1)));

    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(1, 1, 1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(1, 1, -1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(1, -1, 1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(1, -1, -1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(-1, 1, 1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(-1, 1, -1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(-1, -1, 1, 1)));
    sceneGraph.add(new LightNode(new Vector(0.8, 0.8, 0.8, 1), new Vector(-1, -1, -1, 1)));

    // setup for raytracing
    rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);


    // setup for raster rendering
    const rasterSetupVisitor = new RasterSetupVisitor(ctx_raster);
    rasterSetupVisitor.setup(sceneGraph);

    const phongShader = new Shader(ctx_raster,
        phongVertexShader,
        phongFragmentShader
    );

    const textureShader = new Shader(ctx_raster,
        //TODO add texture shader
        phongVertexShader,
        phongFragmentShader
    );

    rasterVisitor = new RasterVisitor(ctx_raster, phongShader, textureShader, rasterSetupVisitor.objects, phongProperties);
    phongShader.load();
    rasterVisitor.setupCamera(cameraNode);
        
    // start animation
    lastTimestamp = 0;
    Promise.all([phongShader.load(), textureShader.load()]).then(() => {
        window.requestAnimationFrame(animate);
    });
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
function sliderChanged(event:any) {
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
        default:
            console.log("Unknown slider: " + id);
            break;
    }
}

/* animate the scene */
function animate(timestamp: number) {
    // console.log("animation loop started");
    if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
    }
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    if (rasterizing) {
        // rasterVisitor.render(sceneGraph, cameraNode, lightPositions);
        rasterVisitor.render(sceneGraph, cameraNode);
    }
    else {
        // rayVisitor.render(sceneGraph, cameraNode, lightPositions, phongProperties);
        // rayVisitor.render(sceneGraph, cameraNode, phongProperties);
        rayVisitor.render(sceneGraph, phongProperties);
    }
    requestAnimationFrame(animate);
    // console.log("animation loop ended"); 
}