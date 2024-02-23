/**
 * Class representing a vector in 4D space
 */
export default class Vector {
  /**
   * The variable to hold the vector data
   */
  data: [number, number, number, number];

  /**
   * Create a vector
   * @param x The x component
   * @param y The y component
   * @param z The z component
   * @param w The w component. If 1 the vector is a point, if 0 the vector is a direction.
   */
  constructor(x: number, y: number, z: number, w: number) {
    this.data = [x, y, z, w];
  }

  /**
   * Returns the x component of the vector
   * @return The x component of the vector
   */
  get x(): number {
    return this.data[0];
  }

  /**
   * Sets the x component of the vector to val
   * @param val - The new value
   */
  set x(val: number) {
    this.data[0] = val;
  }

  /**
   * Returns the first component of the vector for color
   * @return The first component of the vector for color
   */
  get r(): number {
    return this.data[0];
  }

  /**
   * Sets the first component of the vector to val for color
   * @param val The new value for color
   */
  set r(val: number) {
    this.data[0] = val;
  }

  /**
   * Returns the y component of the vector
   * @return The y component of the vector
   */
  get y(): number {
    return this.data[1];
  }

  /**
   * Sets the y component of the vector to val
   * @param val The new value
   */
  set y(val: number) {
    this.data[1] = val;
  }

  /**
   * Returns the second component of the vector for color
   * @return The second component of the vector for color
   */
  get g(): number {
    return this.data[1];
  }

  /**
   * Sets the second component of the vector to val for color
   * @param val The new value for color
   */
  set g(val: number) {
    this.data[1] = val;
  }

  /**
   * Returns the z component of the vector
   * @return The z component of the vector
   */
  get z(): number {
    return this.data[2];
  }

  /**
   * Sets the z component of the vector to val
   * @param val The new value
   */
  set z(val: number) {
    this.data[2] = val;
  }

  /**
   * Returns the third component of the vector for color
   * @return The third component of the vector for color
   */
  get b(): number {
    return this.data[2];
  }

  /**
   * Sets the third component of the vector to val for color
   * @param val The new value for color
   */
  set b(val: number) {
    this.data[2] = val;
  }

  /**
   * Returns the w component of the vector
   * @return The w component of the vector
   */
  get w(): number {
    return this.data[3];
  }

  /**
   * Sets the w component of the vector to val
   * @param val The new value
   */
  set w(val: number) {
    this.data[3] = val;
  }

  /**
   * Returns the fourth component of the vector for opacity
   * @return The fourth component of the vector for opacity
   */
  get a(): number {
    return this.data[3];
  }

  /**
   * Sets the fourth component of the vector to val for opacity
   * @param val The new value for opacity
   */
  set a(val: number) {
    this.data[3] = val;
  }

  /**
   * Creates a new vector with the vector added
   * @param other The vector to add
   * @return The new vector;
   */
  add(other: Vector): Vector {
    return new Vector(this.data[0] + other.x, this.data[1] + other.y, this.data[2] + other.z, this.data[3] + other.w);
  }

  /**
   * Creates a new vector with the vector subtracted
   * @param other The vector to subtract
   * @return The new vector
   */
  sub(other: Vector): Vector {
    return new Vector(this.data[0] - other.x, this.data[1] - other.y, this.data[2] - other.z, this.data[3] - other.w);
  }

  /**
   * Creates a new vector with the scalar multiplied
   * @param other The scalar to multiply
   * @return The new vector
   */
  mul(other: number): Vector {
    return new Vector(this.data[0] * other, this.data[1] * other, this.data[2] * other, this.data[3] * other);
  }

  /**
   * Creates a new vector with the scalar divided
   * @param other The scalar to divide
   * @return The new vector
   */
  div(other: number): Vector {
    return new Vector(this.data[0] / other, this.data[1] / other, this.data[2] / other, this.data[3] / other);
  }

  /**
   * Dot product
   * @param other The vector to calculate the dot product with
   * @return The result of the dot product
   */
  dot(other: Vector): number {
    return this.data[0] * other.x + this.data[1] * other.y + this.data[2] * other.z + this.data[3] * other.w;
  }

  /**
   * Cross product
   * Calculates the cross product using the first three components
   * @param other The vector to calculate the cross product with
   * @return The result of the cross product as new Vector
   */
  cross(other: Vector): Vector {
    return new Vector(this.data[1] * other.z - this.data[2] * other.y, this.data[2] * other.x - this.data[0] * other.z, this.data[0] * other.y - this.data[1] * other.x, 0);
  }

  /**
   * Returns an array representation of the vector
   * @return The array representation of the vector
   */
  valueOf(): [number, number, number, number] {
    return this.data;
  }


  /**
   * Normalizes the vector, returning a new vector with the same direction but a length of 1.
   * @returns A new Vector object representing the normalized vector.
   */
  normalize(): Vector {
    const length = this.length;
    return new Vector(this.data[0] / length, this.data[1] / length, this.data[2] / length, this.data[3] / length);
  }

  /**
   * Compares the vector to another
   * @param other The vector to compare to.
   * @return True if the vectors carry equal numbers. The fourth element may be both equivalent to undefined to still return true.
   */
  equals(other: Vector): boolean {
    // return this.data[0] - other.x <= Number.EPSILON && this.data[1] - other.y <= Number.EPSILON && this.data[2] - other.z <= Number.EPSILON;
    return this.data[0] === other.x && this.data[1] === other.y && this.data[2] === other.z;
  }

  /**
   * Calculates the length of the vector
   * @return The length of the vector
   */
  get length(): number {
    return Math.sqrt(this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2] + this.data[3] * this.data[3]);
  }

  /**
   * Converts the vector to a JSON object.
   * @returns The JSON representation of the vector.
   */
  toJSON() {
    return {
      data: this.data
    }
  }


}

