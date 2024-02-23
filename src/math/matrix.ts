import Vector from './vector';

/**
 * Class representing a 4x4 Matrix
 */
export default class Matrix {

  /**
   * Data representing the matrix values
   */
  data: Float32Array;

  /**
   * Constructor of the matrix. Expects an array in row-major layout. Saves the data as column major internally.
   * @param mat Matrix values row major
   */
  constructor(mat: Array<number>) {
    this.data = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.data[row * 4 + col] = mat[col * 4 + row];
      }
    }
  }

  /**
   * Returns the value of the matrix at position row, col
   * @param row The value's row
   * @param col The value's column
   * @return The requested value
   */
  getVal(row: number, col: number): number {
    return this.data[col * 4 + row];
  }

  /**
   * Sets the value of the matrix at position row, col
   * @param row The value's row
   * @param val The value to set to
   * @param col The value's column
   */
  setVal(row: number, col: number, val: number) {
    this.data[col * 4 + row] = val;
  }

  /**
   * Returns a matrix that represents a translation
   * @param translation The translation vector that shall be expressed by the matrix
   * @return The resulting translation matrix
   */
  static translation(translation: Vector): Matrix {
    return new Matrix([
      1, 0, 0, translation.x,
      0, 1, 0, translation.y,
      0, 0, 1, translation.z,
      0, 0, 0, 1
    ]);
  }

  /**
   * Returns a matrix that represents a rotation. The rotation axis is either the x, y or z axis (either x, y, z is 1).
   * @param axis The axis to rotate around
   * @param angle The angle to rotate
   * @return The resulting rotation matrix
   */
  static rotation(axis: Vector, angle: number): Matrix {
    if (axis.x == 1) {
      return new Matrix([
        1, 0, 0, 0,
        0, Math.cos(angle), -Math.sin(angle), 0,
        0, Math.sin(angle), Math.cos(angle), 0,
        0, 0, 0, 1
      ]);
    }
    else if (axis.y == 1) {
      return new Matrix([
        Math.cos(angle), 0, Math.sin(angle), 0,
        0, 1, 0, 0,
        -Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1
      ]);
    }
    else if (axis.z == 1) {
      return new Matrix([
        Math.cos(angle), -Math.sin(angle), 0, 0,
        Math.sin(angle), Math.cos(angle), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    }
    else {
      return Matrix.identity();
    }
  }

  /**
   * Returns a matrix that represents a scaling
   * @param scale The amount to scale in each direction
   * @return The resulting scaling matrix
   */
  static scaling(scale: Vector): Matrix {
    return new Matrix([
      scale.x, 0, 0, 0,
      0, scale.y, 0, 0,
      0, 0, scale.z, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Constructs a lookat matrix
   * @param eye The position of the viewer
   * @param center The position to look at
   * @param up The up direction
   * @return The resulting lookat matrix
   */
  static lookat(eye: Vector, center: Vector, up: Vector): Matrix {
    let f = center.sub(eye).div((center.sub(eye)).length).normalize();
    let s = f.cross(up).normalize();
    let u = s.cross(f).normalize();

    return new Matrix([
      s.x, s.y, s.z, 0,
      u.x, u.y, u.z, 0,
      -f.x, -f.y, -f.z, 0,
      0, 0, 0, 1
    ]).mul(new Matrix([
      1, 0, 0, -eye.x,
      0, 1, 0, -eye.y,
      0, 0, 1, -eye.z,
      0, 0, 0, 1
    ]));
  }

  /**
   * Creates a perspective frustum matrix.
   * Frustum refers to a solid shape that looks like a pyramid with the top cut off parallel to the base.
   * This is the shape of the region that can be seen and rendered by a perspective camera.
   * The output is either drawn to the screen or captured as a texture.
   * @param left - The left clipping plane coordinate.
   * @param right - The right clipping plane coordinate.
   * @param bottom - The bottom clipping plane coordinate.
   * @param top - The top clipping plane coordinate.
   * @param near - The distance to the near clipping plane.
   * @param far - The distance to the far clipping plane.
   * @returns The perspective frustum matrix.
   */
  static frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
    return new Matrix([
      2 * near / (right - left), 0, (right + left) / (right - left), 0,
      0, 2 * near / (top - bottom), (top + bottom) / (top - bottom), 0,
      0, 0, -(far + near) / (far - near), -2 * far * near / (far - near),
      0, 0, -1, 0
    ]);
  }

  /**
   * Creates a perspective projection matrix.
   * @param fovy - The vertical field of view in degrees.
   * @param aspect - The aspect ratio of the viewport.
   * @param near - The distance to the near clipping plane.
   * @param far - The distance to the far clipping plane.
   * @returns The perspective projection matrix.
   */
  static perspective(fovy: number, aspect: number, near: number, far: number): Matrix {
    let top = near * Math.tan((Math.PI / 180) * (fovy / 2));
    let bottom = -top;
    let right = top * aspect;
    let left = -right;
    return Matrix.frustum(left, right, bottom, top, near, far);
  }

  /**
   * Returns the identity matrix
   * @return A new identity matrix
   */
  static identity(): Matrix {
    return new Matrix([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Multiplies this matrix with another matrix or vector.
   * @param other The matrix or vector to multiply with.
   * @returns The result of the multiplication.
   * @throws Error if the argument is invalid.
  */
  mul(other: Vector): Vector;
  mul(other: Matrix): Matrix;
  mul(other: Vector | Matrix): Vector | Matrix {
    // Matrix * Vector
    if (other instanceof Vector) {
      let result = new Vector(0, 0, 0, 0);
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let col = 0; col < 4; col++) {
          sum += this.getVal(row, col) * other.data[col];
        }
        result.data[row] = sum;
      }
      return result;
    }
    // Matrix * Matrix
    else if (other instanceof Matrix) {
      let result = new Matrix([]);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          let sum = 0;
          for (let i = 0; i < 4; i++) {
            sum += this.getVal(row, i) * other.getVal(i, col);
          }
          result.setVal(row, col, sum);
        }
      }
      return result;
    }
    else {
      throw new Error("Invalid argument");
    }
  }

  /**
   * Returns the transpose of this matrix
   * [0,1,2,3]      [0,4,8,12]
   * [4,5,6,7]      [1,5,9,13]
   * [8,9,10,11]    [2,6,10,14]
   * [12,13,14,15]  [3,7,11,15]
   * 
   * @return A new matrix that is the transposed of this
   */
  transpose(): Matrix {
    let result = new Matrix([]);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        result.setVal(col, row, this.getVal(row, col));
      }
    }
    return result;
  }

  /**
   * Debug print to console
   */
  print() {
    for (let row = 0; row < 4; row++) {
      console.log("> " + this.getVal(row, 0) +
        "\t" + this.getVal(row, 1) +
        "\t" + this.getVal(row, 2) +
        "\t" + this.getVal(row, 3)
      );
    }
  }

  /**
   * Converts the matrix to a JSON representation
   * @return The JSON representation of the matrix
   */
  toJSON() {
    let d: { [key: string]: any } = {}; // Add index signature to allow indexing with a string
    for (let i = 0; i < this.data.length; i++) {
      d[i.toString()] = this.data[i];
    }
    return {
      data: d
    };
  }
}