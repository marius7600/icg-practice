import Vector from '../vector';
import Ray from './ray';
import Intersection from './intersection';
import { Polygon } from './polygon';
import BoxSharedProperties from '../boxSharedProperties';
import Matrix from '../matrix';

export default class MeshObject {
    // color: Vector;
    vertexVecs: Vector[]

    constructor(
        public vertices: Float32Array,
        public normals: number[],
        public color: Vector,
        public maxPoint?: Vector,
        public minPoint?: Vector,
    ) {
        // this.color = color
        //this.vertexVecs = BoxSharedProperties.numbersToVecsArray(vertices);
        const vecs = []

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i]
            const y = vertices[i + 1]
            const z = vertices[i + 2]
            vecs.push(new Vector(x, y, z, 1))
        }
        this.vertexVecs = vecs
    }

    intersect(ray: Ray): Intersection | null {
        let closestIntersection: Intersection = null;
        let shortestT = Number.MAX_VALUE
        for (let i = 0; i < this.vertexVecs.length; i += 3) {
            const point1 = this.vertexVecs[i]
            const point2 = this.vertexVecs[i + 1]
            const point3 = this.vertexVecs[i + 2]

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