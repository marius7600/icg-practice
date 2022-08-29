import Vector from './vector';
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
    const c = Math.pow(x_0.dot(ray.direction.normalize()), 2) - Math.pow(x_0.length, 2) + Math.pow(this.radius, 2);
    let t;
    if (c < 0) {
      return null;
    } else if (c === 0) {
      const t = - x_0.dot(ray.direction.normalize());
    } else {
      const t_1 = - x_0.dot(ray.direction.normalize()) + Math.sqrt(c);
      const t_2 = - x_0.dot(ray.direction.normalize()) - Math.sqrt(c);
      t = Math.min(t_1,t_2);
    }
    const intersection_point = ray.origin.add(ray.direction.normalize().mul(t));
    return new Intersection(t, intersection_point, intersection_point.sub(this.center).normalize());
  }
}