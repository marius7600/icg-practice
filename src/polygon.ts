import Vector from "./vector";
import Ray from "./raytracer/ray";
import Intersection from "./raytracer/intersection";

export class Polygon {

    //https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution
    static intersect(ray: Ray, p0: Vector, p1: Vector, p2: Vector, shortestT?: number): Intersection | null  {

        const vec01 = p1.sub(p0);
        const vec02 = p2.sub(p0);
        const normal = vec01.cross(vec02).normalize();

        const nDotRayDirection = normal.dot(ray.direction)

        // check if ray and plane are parallel.
        if (Math.abs(nDotRayDirection) < Number.EPSILON) return null

        const d = p0.dot(normal.mul(-1))
        const t = -(normal.dot(ray.origin) + d) / nDotRayDirection

        // check if the triangle is in behind the ray
        if (t < 0) return null
        if (shortestT) {
            if (t > shortestT) return null
        }

        const intersectionPoint = ray.direction.mul(t).add(ray.origin);

        let C

        const edge0 = vec01
        const vp0 = intersectionPoint.sub(p0)
        C = edge0.cross(vp0)

        if (normal.dot(C) < 0) return null

        const edge1 = p2.sub(p1)
        const vp1 = intersectionPoint.sub(p1)
        C = edge1.cross(vp1)

        if (normal.dot(C) < 0) return null

        const edge2 = p0.sub(p2);
        const vp2 = intersectionPoint.sub(p2);
        C = edge2.cross(vp2);

        if (normal.dot(C) < 0) return null


        return new Intersection(t, intersectionPoint, normal)

    }
}