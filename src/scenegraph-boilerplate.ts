import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode
} from './nodes';
import RayVisitor from './rayvisitor';
import { Rotation, Scaling, Translation } from './transformation';

window.addEventListener('load', () => {
    const canvas_ray = document.getElementById("raytracer") as HTMLCanvasElement;
    const ctx_ray = canvas_ray.getContext("2d");
    
    const canvas_raster = document.getElementById("rasterizer") as HTMLCanvasElement;
    const ctx2 = canvas_raster.getContext("2d");

    /* Call figure toggle if key 2 is pressed */
    document.addEventListener('keydown', (event) => {
        if (event.key === '2') {
            toggleFigure();
            console.log("Toggled canvas");
            
        }
    });


    const sg = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
    const gnRotation = new Rotation(new Vector(1, 0, 0, 0), 0)
    const gn = new GroupNode(gnRotation);
    sg.add(gn);
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
    const camera = {
        origin: new Vector(0, 0, 0, 1),
        width: canvas_ray.width,
        height: canvas_ray.height,
        alpha: Math.PI / 3
    }

    const visitor = new RayVisitor(ctx_ray, canvas_ray.width, canvas_ray.height);

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

        visitor.render(sg, camera, lightPositions);
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
