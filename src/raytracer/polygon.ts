import Vector from "../vector";
import Intersection from "./intersection";
import Ray from "./ray";

/**
 * class representing a polygon in 3D space
 */
export class Polygon {

    /**
     * constructor for a polygon
     * @param p0 first point of the polygon
     * @param p1 second point of the polygon
     * @param p2 third point of the polygon
     **/
    constructor(public p0: Vector, public p1: Vector, public p2: Vector) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }

    //https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution

    //https://lectures.hci.informatik.uni-wuerzburg.de/ss23/icg/exercise/04-02-raytracing-triangles-page.html
    /**
     * method to calculate the intersection of a ray and a polygon
     * @param ray the ray to intersect with
     * @returns the intersection of the ray and the polygon
     */
    intersect(ray: Ray): Intersection | null {
        const e1 = this.p1.sub(this.p0);
        const e2 = this.p2.sub(this.p0);
        const s1 = ray.direction.cross(e2);
        const divisor = s1.dot(e1);
        if (divisor == 0) {
            return null;
        }
        const invDivisor = 1 / divisor;
        const d = ray.origin.sub(this.p0);
        const b1 = d.dot(s1) * invDivisor;
        if (b1 < 0 || b1 > 1) {
            return null;
        }
        const s2 = d.cross(e1);
        const b2 = ray.direction.dot(s2) * invDivisor;
        if (b2 < 0 || b1 + b2 > 1) {
            return null;
        }
        const t = e2.dot(s2) * invDivisor;
        if (t < 0) {
            return null;
        }
        const position = ray.origin.add(ray.direction.mul(t));
        const normal = e1.cross(e2).normalize();
        return new Intersection(t, position, normal)
    }
}