import Vector from '../math/vector';
import Ray from './ray';
import Intersection from './intersection';
import { Polygon } from './polygon';

export default class MeshObject {

    /**
     * The vertices of the mesh object
     */
    vertexVecs: Vector[]

    /**
    * Creates a new MeshObject instance.
    * @param vertices - The vertices of the mesh object.
    * @param normals - The normals of the mesh object.
    * @param color - The color of the mesh object.
    * @param maxPoint - The maximum point of the mesh object.
    * @param minPoint - The minimum point of the mesh object.
    */
    constructor(
        public vertices: Float32Array,
        public normals: number[],
        public color: Vector,
        public maxPoint?: Vector,
        public minPoint?: Vector,
    ) {
        const vecs = []
        // Convert vertices to Vector objects
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i]
            const y = vertices[i + 1]
            const z = vertices[i + 2]
            vecs.push(new Vector(x, y, z, 1))
        }
        this.vertexVecs = vecs
    }

    /**
     * Calculates the intersection between the given ray and the mesh object.
     * 
     * @param ray - The ray to intersect with the mesh object.
     * @returns The closest intersection point between the ray and the mesh object, or null if there is no intersection.
     */
    intersect(ray: Ray): Intersection | null {
        let closestIntersection: Intersection = null;
        let shortestT = Number.MAX_VALUE
        for (let i = 0; i < this.vertexVecs.length; i += 3) {
            const point1 = this.vertexVecs[i]
            const point2 = this.vertexVecs[i + 1]
            const point3 = this.vertexVecs[i + 2]

            // Check if the ray intersects the triangle formed by the three points of the mesh object and update the closest intersection if necessary 
            const intersection = Polygon.intersect2(ray, point1, point2, point3, shortestT);
            if (intersection) {
                if (!closestIntersection || intersection.closerThan(closestIntersection)) {
                    closestIntersection = intersection
                    shortestT = intersection.t
                }
            }
        }
        return closestIntersection
    }
}