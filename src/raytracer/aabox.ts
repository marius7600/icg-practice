import Vector from '../vector';
import Ray from './ray';
import Intersection from './intersection';
import { Polygon } from './polygon';
// import Plane from './Plane';

/**
 * Class representing an axis aligned box
 */
export default class AABox {
  /**
   * The box's vertices
   */
  vertices: Array<Vector>;
  /**
   * The indices of the vertices that
   * together form the faces of the box
   */
  indices: Array<number>;
  minPoint: Vector;
  maxPoint: Vector;

  /**
   * Creates an axis aligned box
   * @param minPoint The minimum Point
   * @param maxPoint The maximum Point
   * @param color The colour of the cube
   */
  constructor(minPoint: Vector, maxPoint: Vector, public color: Vector) {
    /*
      7----6
     /|   /|   2 = maxPoint
    3----2 |   4 = minPoint
    | 4--|-5   Looking into negative z direction
    |/   |/
    0----1
     */
    this.vertices = [
      new Vector(minPoint.x, minPoint.y, maxPoint.z, 1),
      new Vector(maxPoint.x, minPoint.y, maxPoint.z, 1),
      new Vector(maxPoint.x, maxPoint.y, maxPoint.z, 1),
      new Vector(minPoint.x, maxPoint.y, maxPoint.z, 1),
      new Vector(minPoint.x, minPoint.y, minPoint.z, 1),
      new Vector(maxPoint.x, minPoint.y, minPoint.z, 1),
      new Vector(maxPoint.x, maxPoint.y, minPoint.z, 1),
      new Vector(minPoint.x, maxPoint.y, minPoint.z, 1)
    ];
    // this.indices = [
    //   0, 1, 2, 3,
    //   1, 5, 6, 2,
    //   4, 0, 3, 7,
    //   3, 2, 6, 7,
    //   5, 4, 7, 6,
    //   0, 4, 5, 1
    // ];

    this.indices = [
      0, 1, 2, 0, 2, 3, //front
      0, 5, 4, 0, 1, 5, //floor
      1, 2, 6, 1, 6, 5, //right
      0, 3, 7, 0, 7, 4, //left
      2, 6, 7, 2, 7, 3, //top
      4, 6, 5, 4, 7, 6  //back

    ]


  }

  /**
     * Calculates the intersection of the AAbox with the given ray
     * @param ray The ray to intersect with
     * @return The intersection if there is one, null if there is none
     */
  intersect(ray: Ray): Intersection | null {

    let closestIntersection: Intersection = null;
    let shortestT = Number.MAX_VALUE
    for (let i = 0; i < this.indices.length; i += 3) {
      const point1 = this.vertices[this.indices[i]]
      const point2 = this.vertices[this.indices[i + 1]]
      const point3 = this.vertices[this.indices[i + 2]]
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

  toString(): string {
    return `AABox(${this.vertices[0]}, ${this.vertices[6]})`;
  }

}