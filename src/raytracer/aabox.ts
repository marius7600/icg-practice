import Vector from '../math/vector';
import Ray from './ray';
import Intersection from './intersection';
import { Polygon } from './polygon';

/**
 * Class representing an axis aligned box for ray tracing
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

  /**
   * The normals of the box
   */
  normals = [
    new Vector(-1, 0, 0, 0),
    new Vector(1, 0, 0, 0),
    new Vector(0, -1, 0, 0),
    new Vector(0, 1, 0, 0),
    new Vector(0, 0, -1, 0),
    new Vector(0, 0, 1, 0)
  ];

  /**
   * Creates an axis aligned box
   * @param minPoint The minimum Point
   * @param maxPoint The maximum Point
   * @param color The colour of the cube
   */
  constructor(public minPoint: Vector, public maxPoint: Vector, public color: Vector) {
    /*
      7----6
     /|   /|   2 = maxPoint
    3----2 |   4 = minPoint
    | 4--|-5   Looking into negative z direction
    |/   |/
    0----1
     */

    // The vertices of the box that form the corners
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

    // The indices of the vertices defining how to connect vertices in order to produce a surface
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
    // Initialize minimum and maximum t values and their corresponding normals
    let tmin, tymin, tzmin;
    let normalMin, normalYMin, normalZMin;

    // Calculate tmin and normalMin based on the ray's x direction
    if (ray.direction.x >= 0) {
      tmin = (this.minPoint.x - ray.origin.x) / ray.direction.x;
      normalMin = this.normals[0];
    } else {
      tmin = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
      normalMin = this.normals[1];
    }

    // Calculate tymin and normalYMin based on the ray's y direction
    if (ray.direction.y >= 0) {
      tymin = (this.minPoint.y - ray.origin.y) / ray.direction.y;
      normalYMin = this.normals[2];
    } else {
      tymin = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
      normalYMin = this.normals[3];
    }

    // Update tmin and normalMin if tymin is greater
    if (tymin > tmin) {
      tmin = tymin;
      normalMin = normalYMin;
    }

    // Calculate tzmin and normalZMin based on the ray's z direction
    if (ray.direction.z >= 0) {
      tzmin = (this.minPoint.z - ray.origin.z) / ray.direction.z;
      normalZMin = this.normals[4];
    } else {
      tzmin = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
      normalZMin = this.normals[5];
    }

    // Update tmin and normalMin if tzmin is greater
    if (tzmin > tmin) {
      tmin = tzmin;
      normalMin = normalZMin;
    }

    // Initialize maximum t values and their corresponding normals
    let tmax, tymax, tzmax;
    let normalMax, normalYMax, normalZMax;

    // Calculate tmax and normalMax based on the ray's x direction
    if (ray.direction.x >= 0) {
      tmax = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
      normalMax = this.normals[1];
    } else {
      tmax = (this.minPoint.x - ray.origin.x) / ray.direction.x;
      normalMax = this.normals[0];
    }

    // Calculate tymax and normalYMax based on the ray's y direction
    if (ray.direction.y >= 0) {
      tymax = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
      normalYMax = this.normals[3];
    } else {
      tymax = (this.minPoint.y - ray.origin.y) / ray.direction.y;
      normalYMax = this.normals[2];
    }

    // Update tmax and normalMax if tymax is smaller
    if (tymax < tmax) {
      tmax = tymax;
      normalMax = normalYMax;
    }

    // Calculate tzmax and normalZMax based on the ray's z direction
    if (ray.direction.z >= 0) {
      tzmax = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
      normalZMax = this.normals[5];
    } else {
      tzmax = (this.minPoint.z - ray.origin.z) / ray.direction.z;
      normalZMax = this.normals[4];
    }

    // Update tmax and normalMax if tzmax is smaller
    if (tzmax < tmax) {
      tmax = tzmax;
      normalMax = normalZMax;
    }

    // If tmin is greater than tmax, there is no intersection
    if (tmin > tmax) return null;

    // Calculate the intersection point
    let intersectionPoint = ray.origin.add(ray.direction.mul(tmin));

    // Choose the normal based on the sign of tmin
    let normal = (tmin < 0) ? normalMax : normalMin;

    // Return the intersection
    return new Intersection(tmin, intersectionPoint, normal);

    /**
     * Unperformant code to calculate intersection with each polygon
     */

    // let closestIntersection: Intersection = null;
    // let shortestT = Number.MAX_VALUE
    // for (let i = 0; i < this.indices.length; i += 3) {
    //   const point1 = this.vertices[this.indices[i]]
    //   const point2 = this.vertices[this.indices[i + 1]]
    //   const point3 = this.vertices[this.indices[i + 2]]
    //   //const intersection = Polygon.intersect(ray, point1, point2, point3, shortestT);
    //   // create polygon
    //   let myPolygon = new Polygon(point1, point2, point3);

    //   // find intersection
    //   const intersection = myPolygon.intersect(ray);
    //   if (intersection) {
    //     if (!closestIntersection || intersection.closerThan(closestIntersection)) {
    //       closestIntersection = intersection
    //       shortestT = intersection.t
    //     }
    //   }
    // }
    // return closestIntersection
  }
}