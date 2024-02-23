import Vector from '../math/vector';

/**
 * Represents an intersection between a ray and an object
 */
export default class Intersection {
  /**
   * Create an Intersection
   * @param t - The distance on the ray
   * @param point - The intersection point
   * @param normal - The normal in the intersection
   */
  constructor(public t: number, public point: Vector, public normal: Vector) {
    if (t) {
      this.t = t;
    } else {
      this.t = Infinity;
    }
  }


  /**
   * Checks if this intersection is closer than the given intersection.
   * @param other - The other intersection to compare against.
   * @returns True if this intersection is closer, false otherwise.
   */
  closerThan(other: Intersection): boolean {
    if (this.t < other.t) return true;
    else return false;
  }
}