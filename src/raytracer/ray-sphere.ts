import Vector from '../vector';
import Intersection from './intersection';
import Ray from './ray';

/**
 * A class representing a sphere
 */
export default class Sphere {
  /**
   * Creates a new Sphere with center and radius
   * @param center The center of the Sphere
   * @param radius The radius of the Sphere
   * @param color The colour of the Sphere
   */
  constructor(
    public center: Vector,
    public radius: number,
    public color: Vector
  ) { }

  /**
   * Calculates the intersection of the sphere with the given ray
   * @param ray The ray to intersect with
   * @return The intersection if there is one, null if there is none
   */
  intersect(ray: Ray): Intersection | null {
    const x_0 = ray.origin.sub(this.center);
    const a = x_0.dot(ray.direction);
    const c = a * a - x_0.dot(x_0) + this.radius * this.radius;

    if (c < 0) {
      return null;
    } else {
      const sqrtC = Math.sqrt(c);
      let t;
      if (c === 0) {
        t = -a;
      } else {
        const t_1 = -a + sqrtC;
        const t_2 = -a - sqrtC;
        t = Math.min(t_1, t_2);
      }
      const intersection_point = ray.origin.add(ray.direction.mul(t));
      return new Intersection(t, intersection_point, intersection_point.sub(this.center).normalize());
    }
  }
}