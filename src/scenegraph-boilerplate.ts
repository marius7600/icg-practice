import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode,
    AABoxNode,
    CameraNode
} from './nodes';
import RayVisitor from './raytracer/rayvisitor';
import { Rotation, Scaling, Translation } from './transformation';
import { RasterSetupVisitor, RasterVisitor } from './rasterzier/rastervisitor';
import Shader from './shader/shader';
import phongVertexShader from './shader/phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './shader/phong-fragment-shader.glsl';
import PhongProperties from './phong-properties'

const phongProperties = new PhongProperties();

window.addEventListener('load', () => {
    const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
    const ctx_ray = canvas_ray.getContext("2d");
    
    const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
    const ctx_raster = canvas_raster.getContext("webgl2");

    /* Call figure toggle if key 2 is pressed */
    document.addEventListener('keydown', (event) => {
        if (event.key === '2') {
            toggleFigure();
        }
    });


    /* Create the scenegraph */
    const sceneGraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    const cameraNode = new CameraNode(
        new Vector(0, 0, -2, 1), // eye
        new Vector(0, 0, 0, 1), // look at
        new Vector(0, 1, 0, 0), // up
        60,
        canvas_raster.width / canvas_raster.height,
        0.1,
        100);
    sceneGraph.add(cameraNode);
    const gn = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    sceneGraph.add(gn);
    gn.add(new SphereNode(new Vector(.4, 0, 0, 1)));
    const lightPositions = [
        new Vector(1, 1, 1, 1)
    ];

    // const camera = {
    //     eye: new Vector(0, 0, -5, 1),
    //     center: new Vector(0, 0, 0, 1),
    //     up: new Vector(0, 1, 0, 0),
    //     fovy: 60,
    //     aspect: canvas_raster.width / canvas_raster.height,
    //     near: 0.1,
    //     far: 100
    // }

    // setup for raytracing
    const rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);


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
    // render rasterizer
    const rasterVisitor = new RasterVisitor(ctx_raster, phongShader, textureShader, rasterSetupVisitor.objects);
    phongShader.load();
    rasterVisitor.setupCamera(cameraNode);
    rasterVisitor.render(sceneGraph, cameraNode, lightPositions);

    rayVisitor.render(sceneGraph, cameraNode, lightPositions);

    let animationHandle: number;

    let lastTimestamp = 0;
    let animationTime = 0;
    let animationHasStarted = true;
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
    const ray = document.getElementById("raytracer_fig");
    const raster = document.getElementById("rasterizer_fig");
    if (ray.style.display === "none") {
        ray.style.display = "block";
        raster.style.display = "none";
    } else {
        ray.style.display = "none";
        raster.style.display = "block";
    }
}
