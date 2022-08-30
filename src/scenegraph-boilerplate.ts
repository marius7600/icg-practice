import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode,
    AABoxNode
} from './nodes';
import RayVisitor from './rayvisitor';
import { Rotation, Scaling, Translation } from './transformation';
import { RasterSetupVisitor, RasterVisitor } from './rastervisitor';
import Shader from './shader';
import vertexShader from './basic-vertex-shader.glsl';2
import fragmentShader from './basic-fragment-shader.glsl';

window.addEventListener('load', () => {
    const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
    const ctx_ray = canvas_ray.getContext("2d");
    
    const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
    const ctx_raster = canvas_raster.getContext("webgl2");

    /* Call figure toggle if key 2 is pressed */
    document.addEventListener('keydown', (event) => {
        if (event.key === '2') {
            toggleFigure();
            // console.log("Toggled canvas");
        }
    });


    const sceneGraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    const gnRotation = new Rotation(new Vector(1, 0, 0, 0), 0)
    const gn = new GroupNode(gnRotation);
    sceneGraph.add(gn);
    const gn1 = new GroupNode(new Translation(new Vector(1.2, .5, 0, 0)));
    gn.add(gn1);
    gn1.add(new SphereNode(new Vector(.4, 0, 0, 1)));
    const gn2 = new GroupNode(new Translation(new Vector(-0.8, 1, 1, 0)));
    gn.add(gn2);
    const gn3 = new GroupNode(new Scaling(new Vector(0.4, 0.4, 0.4, 0)));
    gn2.add(gn3);
    gn3.add(new SphereNode(new Vector(0, 0, .3, 1)));
    const lightPositions = [
        new Vector(1, 1, 1, 1)
    ];

    const camera_ray = {
        origin: new Vector(2, 2, 2, 1),
        width: canvas_ray.width,
        height: canvas_ray.height,
        alpha: Math.PI / 3
    }

    const camera_raster = {
        eye: new Vector(2, 2, 2, 1),
        center: new Vector(0, 0, -1, 1),
        up: new Vector(0, 1, 0, 0),
        fovy: 60,
        aspect: canvas_raster.width / canvas_raster.height,
        near: 0.1,
        far: 100
    }

    const rayVisitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);

    // setup for raster rendering
    const setupVisitor = new RasterSetupVisitor(ctx_raster);
    setupVisitor.setup(sceneGraph);

    const phongShader = new Shader(ctx_raster,
        vertexShader,
        fragmentShader
    );
    const textureShader = new Shader(ctx_raster,
        //TODO add texture shader
        vertexShader,
        fragmentShader
    );
    // render
    const rasterVisitor = new RasterVisitor(ctx_raster, phongShader, textureShader, setupVisitor.objects);
    phongShader.load();
    rasterVisitor.render(sceneGraph, camera_raster, lightPositions);
    // rasterVisitor.render(sceneGraph, null, lightPositions);

    let animationHandle: number;

    let lastTimestamp = 0;
    let animationTime = 0;
    let animationHasStarted = true;
    function animate(timestamp: number) {
        let deltaT = timestamp - lastTimestamp;
        if (animationHasStarted) {
            deltaT = 0;
            animationHasStarted = false;
        }
        animationTime += deltaT;
        lastTimestamp = timestamp;
        gnRotation.angle = animationTime / 2000;

        rayVisitor.render(sceneGraph, camera_raster, lightPositions);
        // animationHandle = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (animationHandle) {
            window.cancelAnimationFrame(animationHandle);
        }
        animationHasStarted = true;
        function animation(t: number) {
            animate(t);
            animationHandle = window.requestAnimationFrame(animation);
        }
        animationHandle = window.requestAnimationFrame(animation);
    }
    animate(0);

    document.getElementById("startAnimationBtn").addEventListener(
        "click", startAnimation);
    document.getElementById("stopAnimationBtn").addEventListener(
        "click", () => cancelAnimationFrame(animationHandle));
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
