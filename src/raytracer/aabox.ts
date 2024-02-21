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
  // minPoint: Vector;
  // maxPoint: Vector;

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


    let tmin, tymin, tzmin;
    let normalMin, normalYMin, normalZMin;

    if (ray.direction.x >= 0) {
      tmin = (this.minPoint.x - ray.origin.x) / ray.direction.x;
      normalMin = this.normals[0];
    } else {
      tmin = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
      normalMin = this.normals[1];
    }

    if (ray.direction.y >= 0) {
      tymin = (this.minPoint.y - ray.origin.y) / ray.direction.y;
      normalYMin = this.normals[2];
    } else {
      tymin = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
      normalYMin = this.normals[3];
    }

    if (tymin > tmin) {
      tmin = tymin;
      normalMin = normalYMin;
    }

    if (ray.direction.z >= 0) {
      tzmin = (this.minPoint.z - ray.origin.z) / ray.direction.z;
      normalZMin = this.normals[4];
    } else {
      tzmin = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
      normalZMin = this.normals[5];
    }

    if (tzmin > tmin) {
      tmin = tzmin;
      normalMin = normalZMin;
    }

    let tmax, tymax, tzmax;
    let normalMax, normalYMax, normalZMax;

    if (ray.direction.x >= 0) {
      tmax = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
      normalMax = this.normals[1];
    } else {
      tmax = (this.minPoint.x - ray.origin.x) / ray.direction.x;
      normalMax = this.normals[0];
    }

    if (ray.direction.y >= 0) {
      tymax = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
      normalYMax = this.normals[3];
    } else {
      tymax = (this.minPoint.y - ray.origin.y) / ray.direction.y;
      normalYMax = this.normals[2];
    }

    if (tymax < tmax) {
      tmax = tymax;
      normalMax = normalYMax;
    }

    if (ray.direction.z >= 0) {
      tzmax = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
      normalZMax = this.normals[5];
    } else {
      tzmax = (this.minPoint.z - ray.origin.z) / ray.direction.z;
      normalZMax = this.normals[4];
    }

    if (tzmax < tmax) {
      tmax = tzmax;
      normalMax = normalZMax;
    }

    if (tmin > tmax) return null;

    let intersectionPoint = ray.origin.add(ray.direction.mul(tmin));
    let normal = (tmin < 0) ? normalMax : normalMin;

    return new Intersection(tmin, intersectionPoint, normal);






    // let tmin, tmax, tymin, tymax, tzmin, tzmax;
    // let normalMin, normalMax, normalYMin, normalYMax, normalZMin, normalZMax;

    // if (ray.direction.x >= 0) {
    //   tmin = (this.minPoint.x - ray.origin.x) / ray.direction.x;
    //   tmax = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
    //   normalMin = this.normals[0];
    //   normalMax = this.normals[1];
    // } else {
    //   tmin = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
    //   tmax = (this.minPoint.x - ray.origin.x) / ray.direction.x;
    //   normalMin = this.normals[1];
    //   normalMax = this.normals[0];
    // }

    // if (ray.direction.y >= 0) {
    //   tymin = (this.minPoint.y - ray.origin.y) / ray.direction.y;
    //   tymax = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
    //   normalYMin = this.normals[2];
    //   normalYMax = this.normals[3];
    // } else {
    //   tymin = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
    //   tymax = (this.minPoint.y - ray.origin.y) / ray.direction.y;
    //   normalYMin = this.normals[3];
    //   normalYMax = this.normals[2];
    // }

    // if ((tmin > tymax) || (tymin > tmax)) return null;

    // if (tymin > tmin) {
    //   tmin = tymin;
    //   normalMin = normalYMin;
    // }
    // if (tymax < tmax) {
    //   tmax = tymax;
    //   normalMax = normalYMax;
    // }

    // if (ray.direction.z >= 0) {
    //   tzmin = (this.minPoint.z - ray.origin.z) / ray.direction.z;
    //   tzmax = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
    //   normalZMin = this.normals[4];
    //   normalZMax = this.normals[5];
    // } else {
    //   tzmin = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
    //   tzmax = (this.minPoint.z - ray.origin.z) / ray.direction.z;
    //   normalZMin = this.normals[5];
    //   normalZMax = this.normals[4];
    // }

    // if ((tmin > tzmax) || (tzmin > tmax)) return null;

    // if (tzmin > tmin) {
    //   tmin = tzmin;
    //   normalMin = normalZMin;
    // }
    // if (tzmax < tmax) {
    //   tmax = tzmax;
    //   normalMax = normalZMax;
    // }

    // let intersectionPoint = ray.origin.add(ray.direction.mul(tmin));
    // let normal = (tmin < 0) ? normalMax : normalMin;

    // return new Intersection(tmin, intersectionPoint, normal);




    // let tmin = (this.minPoint.x - ray.origin.x) / ray.direction.x;
    // let tmax = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
    // let normalMin = new Vector(-1, 0, 0, 0);
    // let normalMax = new Vector(1, 0, 0, 0);

    // if (tmin > tmax) {
    //   [tmin, tmax] = [tmax, tmin];
    //   [normalMin, normalMax] = [normalMax, normalMin];
    // }

    // let tymin = (this.minPoint.y - ray.origin.y) / ray.direction.y;
    // let tymax = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
    // let normalYMin = new Vector(0, -1, 0, 0);
    // let normalYMax = new Vector(0, 1, 0, 0);

    // if (tymin > tymax) {
    //   [tymin, tymax] = [tymax, tymin];
    //   [normalYMin, normalYMax] = [normalYMax, normalYMin];
    // }

    // if ((tmin > tymax) || (tymin > tmax)) return null;

    // if (tymin > tmin) {
    //   tmin = tymin;
    //   normalMin = normalYMin;
    // }
    // if (tymax < tmax) {
    //   tmax = tymax;
    //   normalMax = normalYMax;
    // }

    // let tzmin = (this.minPoint.z - ray.origin.z) / ray.direction.z;
    // let tzmax = (this.maxPoint.z - ray.origin.z) / ray.direction.z;
    // let normalZMin = new Vector(0, 0, -1, 0);
    // let normalZMax = new Vector(0, 0, 1, 0);

    // if (tzmin > tzmax) {
    //   [tzmin, tzmax] = [tzmax, tzmin];
    //   [normalZMin, normalZMax] = [normalZMax, normalZMin];
    // }

    // if ((tmin > tzmax) || (tzmin > tmax)) return null;

    // if (tzmin > tmin) {
    //   tmin = tzmin;
    //   normalMin = normalZMin;
    // }
    // if (tzmax < tmax) {
    //   tmax = tzmax;
    //   normalMax = normalZMax;
    // }

    // let intersectionPoint = ray.origin.add(ray.direction.mul(tmin));
    // let normal = (tmin < 0) ? normalMax : normalMin;

    // return new Intersection(tmin, intersectionPoint, normal);


    // let tmin = (this.minPoint.x - ray.origin.x) / ray.direction.x;
    // let tmax = (this.maxPoint.x - ray.origin.x) / ray.direction.x;
    // let tymin = (this.minPoint.y - ray.origin.y) / ray.direction.y;
    // let tymax = (this.maxPoint.y - ray.origin.y) / ray.direction.y;
    // let tzmin = (this.minPoint.z - ray.origin.z) / ray.direction.z;
    // let tzmax = (this.maxPoint.z - ray.origin.z) / ray.direction.z;

    // // Swap tmin and tmax if necessary
    // if (tmin > tmax) [tmin, tmax] = [tmax, tmin];
    // if (tymin > tymax) [tymin, tymax] = [tymax, tymin];
    // if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    // // Find the largest tmin and smallest tmax
    // let largestTmin = Math.max(tmin, tymin, tzmin);
    // let smallestTmax = Math.min(tmax, tymax, tzmax);

    // // If the ray doesn't intersect the AABB, return null
    // if (largestTmin > smallestTmax) return null;

    // // The intersection t is the largest tmin if it's positive, otherwise it's the smallest tmax
    // let t = largestTmin > 0 ? largestTmin : smallestTmax;

    // // Calculate the intersection point
    // let intersectionPoint = ray.origin.add(ray.direction.mul(t));

    // // Calculate the normal based on which slab the intersection occurred on
    // let normal;
    // if (t === tmin) normal = new Vector(-Math.sign(ray.direction.x), 0, 0, 1);
    // else if (t === tymin) normal = new Vector(0, -Math.sign(ray.direction.y), 0, 1);
    // else normal = new Vector(0, 0, -Math.sign(ray.direction.z), 1);

    // return new Intersection(t, intersectionPoint, normal);



    // // This is the "slab" method of ray-box intersection.
    // let tmin = (this.minPoint.x - ray.origin.x) / ray.direction.x;
    // let tmax = (this.maxPoint.x - ray.origin.x) / ray.direction.x;

    // if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

    // let tymin = (this.minPoint.y - ray.origin.y) / ray.direction.y;
    // let tymax = (this.maxPoint.y - ray.origin.y) / ray.direction.y;

    // if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

    // if ((tmin > tymax) || (tymin > tmax)) return null;

    // if (tymin > tmin) tmin = tymin;
    // if (tymax < tmax) tmax = tymax;

    // let tzmin = (this.minPoint.z - ray.origin.z) / ray.direction.z;
    // let tzmax = (this.maxPoint.z - ray.origin.z) / ray.direction.z;

    // if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    // if ((tmin > tzmax) || (tzmin > tmax)) return null;

    // if (tzmin > tmin) tmin = tzmin;
    // if (tzmax < tmax) tmax = tzmax;

    // // If we've made it this far, the ray intersects the box. 
    // if (tmin < 0) {
    //   tmin = tmax; // If tmin is negative, the ray origin is inside the box.
    // }

    // Calculate the intersection point.
    // let p = ray.origin.add(ray.direction.mul(tmin));

    // TODO: Fix the normal calculation
    // Determine which face of the box the ray hit.
    // let normal: Vector;
    // if (tmin == tmax) {
    //   normal = new Vector(-Math.sign(ray.direction.x), 0, 0, 1);
    // } else if (tmin == tymin) {
    //   normal = new Vector(0, -Math.sign(ray.direction.y), 0, 1);
    // } else {
    //   normal = new Vector(0, 0, -Math.sign(ray.direction.z), 1);
    // }

    // normal = new Vector(0, 0, 0, 1);

    // return new Intersection(tmin, p, normal.normalize());

    // let intersectionPoint = ray.origin.add(ray.direction.mul(tmin));
    // let normal;
    // if (intersectionPoint.x === this.minPoint.x) normal = new Vector(-1, 0, 0, 1);
    // else if (intersectionPoint.x === this.maxPoint.x) normal = new Vector(1, 0, 0, 1);
    // else if (intersectionPoint.y === this.minPoint.y) normal = new Vector(0, -1, 0, 1);
    // else if (intersectionPoint.y === this.maxPoint.y) normal = new Vector(0, 1, 0, 1);
    // else if (intersectionPoint.z === this.minPoint.z) normal = new Vector(0, 0, -1, 1);
    // else if (intersectionPoint.z === this.maxPoint.z) normal = new Vector(0, 0, 1, 1);

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

  toString(): string {
    return `AABox(${this.vertices[0]}, ${this.vertices[6]})`;
  }

}