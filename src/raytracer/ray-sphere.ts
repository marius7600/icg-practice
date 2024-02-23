import Vector from '../math/vector';
import Intersection from './intersection';
import Ray from './ray';

/**
 * A class representing a sphere for ray tracing
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
    // Calculate the vector from the sphere center to the ray origin
    const x_0 = ray.origin.sub(this.center);

    // Calculate the dot product of the vector and the ray direction
    const a = x_0.dot(ray.direction);

    // Calculate the discriminant of the quadratic equation for the intersection
    // It's the square of the dot product minus the square of the vector length plus the square of the sphere radius
    const c = a * a - x_0.dot(x_0) + this.radius * this.radius;

    // Check if the discriminant is negative
    // If it is, there is no intersection
    if (c < 0) {
      return null;
    } else {
      // Calculate the square root of the discriminant
      const sqrtC = Math.sqrt(c);
      let t;
      // If the discriminant is 0, the ray is tangent to the sphere and there's only one intersection point
      // In this case, the parameter t at which the ray intersects the sphere is -a
      if (c === 0) {
        t = -a;
      } else {
        // If the discriminant is positive, the ray intersects the sphere at two points
        // We calculate the parameters t at which the ray intersects the sphere and choose the smaller one
        // This is because we're interested in the closest intersection point
        const t_1 = -a + sqrtC;
        const t_2 = -a - sqrtC;
        t = Math.min(t_1, t_2);
      }
      // Calculate the intersection point by adding the product of the ray direction and t to the ray origin
      const intersection_point = ray.origin.add(ray.direction.mul(t));

      // Return a new Intersection object with the parameter t, the intersection point, and the normalized normal at the intersection point
      return new Intersection(t, intersection_point, intersection_point.sub(this.center).normalize());
    }
  }
}