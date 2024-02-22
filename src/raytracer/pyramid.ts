import Vector from '../math/vector';
import Ray from './ray';
import Intersection from './intersection';
import { Polygon } from "./polygon";

/**
 * Class representing a pyramid
 */
export default class Pyramid {
    /**
     * The pyramids's vertices
     */
    vertices: Array<Vector>;
    /**
     * The indices of the vertices that
     * together form the faces of the pyramid
     */
    indices: Array<number>;

    /**
     * Creates an axis aligned pyramid, like aabox but with a top
     * @param minPoint The minimum Point
     * @param maxPoint The maximum Point
     * @param color The colour of the pyramid
     */
    constructor(public minPoint: Vector, public maxPoint: Vector, public color: Vector) {

        let topx = (minPoint.x) + (maxPoint.x - minPoint.x) / 2;
        let topz = (minPoint.z) + (maxPoint.z - minPoint.z) / 2;


        this.vertices = [
            new Vector(minPoint.x, minPoint.y, maxPoint.z, 1), //0
            new Vector(maxPoint.x, minPoint.y, maxPoint.z, 1), //1
            new Vector(maxPoint.x, minPoint.y, minPoint.z, 1), //2
            new Vector(minPoint.x, minPoint.y, minPoint.z, 1), //3
            new Vector(topx, maxPoint.y, topz, 1)

        ];
        this.indices = [
            0, 1, 2,
            0, 2, 3,
            0, 1, 4,
            2, 4, 1,
            2, 4, 3,
            0, 3, 4
        ];
    }

    /**
     * Calculates the intersection of the pyramid with the given ray
     * @param ray The ray to intersect with
     * @return The intersection if there is one, null if there is none
     */
    intersect(ray: Ray): Intersection | null {
        let closestIntersection: Intersection = null;
        let minIntersection = new Intersection(Infinity, null, null);
        for (let i = 0; i < this.indices.length; i += 3) {
            const point1 = this.vertices[this.indices[i]]
            const point2 = this.vertices[this.indices[i + 1]]
            const point3 = this.vertices[this.indices[i + 2]]

            // create polygon
            const intersection = Polygon.intersect2(ray, point1, point2, point3);

            // check if intersection exists and if it's closer than the current closest intersection
            if (intersection && intersection.closerThan(minIntersection)) {
                closestIntersection = intersection;
                minIntersection = intersection;
            }
        }
        return closestIntersection;
    }
}