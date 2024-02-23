import Vector from "../math/vector";
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

    /**
     * Calculates the intersection between a ray and a triangle defined by three points.
     * @param ray - The ray to intersect with the triangle.
     * @param p0 - The first vertex of the triangle.
     * @param p1 - The second vertex of the triangle.
     * @param p2 - The third vertex of the triangle.
     * @param shortestT - Optional. The maximum intersection distance allowed.
     * @returns The intersection between the ray and the triangle, or null if there is no intersection.
     * @see https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution
     */
    static intersect2(ray: Ray, p0: Vector, p1: Vector, p2: Vector, shortestT?: number): Intersection | null {
        // Calculate the vectors from point p0 to points p1 and p2
        const vec01 = p1.sub(p0);
        const vec02 = p2.sub(p0);

        // Calculate the normal of the plane defined by points p0, p1, and p2
        const normal = vec01.cross(vec02);

        // Calculate the dot product of the normal and the ray direction
        const nDotRayDirection = normal.dot(ray.direction);

        // Check if the ray and the plane are parallel
        // If they are, the dot product will be close to 0 and we return null
        if (Math.abs(nDotRayDirection) < Number.EPSILON) return null;

        // Calculate the signed distance from the origin to the plane
        const d = p0.dot(normal.mul(-1));

        // Calculate the parameter t at which the ray intersects the plane
        const t = -(normal.dot(ray.origin) + d) / nDotRayDirection;

        // Check if the triangle is behind the ray or if the intersection is further than the shortest intersection found so far
        // If it is, we return null
        if (t < 0) return null;
        if (shortestT && t > shortestT) return null;

        // Calculate the point of intersection on the plane
        const intersectionPoint = ray.direction.mul(t).add(ray.origin);

        // Initialize the variable for the cross product of the edge and the vector from a vertex to the intersection point
        let C;

        // Check if the intersection point is inside the triangle
        // We do this by checking if the intersection point is on the same side of each edge as the normal
        // If it's not, we return null
        const edge0 = vec01;
        const vp0 = intersectionPoint.sub(p0);
        C = edge0.cross(vp0);
        if (normal.dot(C) < 0) return null;

        const edge1 = p2.sub(p1);
        const vp1 = intersectionPoint.sub(p1);
        C = edge1.cross(vp1);
        if (normal.dot(C) < 0) return null;

        const edge2 = p0.sub(p2);
        const vp2 = intersectionPoint.sub(p2);
        C = edge2.cross(vp2);
        if (normal.dot(C) < 0) return null;

        // If the intersection point is inside the triangle, we return a new Intersection object
        return new Intersection(t, intersectionPoint, normal.normalize());
    }

    /**
     * Slower method to calculate the intersection of a ray and a polygon
     * @param ray the ray to intersect with
     * @returns the intersection of the ray and the polygon
     * @see https://lectures.hci.informatik.uni-wuerzburg.de/ss23/icg/exercise/04-02-raytracing-triangles-page.html
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