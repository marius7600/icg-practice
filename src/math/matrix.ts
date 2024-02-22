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
    // TODO
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
   * Constructs a new matrix that represents a projection normalisation transformation
   * @param left Camera-space left value of lower near point
   * @param right Camera-space right value of upper right far point
   * @param bottom Camera-space bottom value of lower lower near point
   * @param top Camera-space top value of upper right far point
   * @param near Camera-space near value of lower lower near point
   * @param far Camera-space far value of upper right far point
   * @return The rotation matrix
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
   * Constructs a new matrix that represents a projection normalisation transformation.
   * @param fovy Field of view in y-direction
   * @param aspect Aspect ratio between width and height
   * @param near Camera-space distance to near plane
   * @param far Camera-space distance to far plane
   * @return The resulting matrix
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
   * Matrix multiplication
   * @param other The matrix or vector to multiply with
   * @return The result of the multiplication this*other
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
   * Matrix-vector multiplication
   * @param other The vector to multiply with
   * @return The result of the multiplication this*other
   */
  // mulVec(other: Vector): Vector {
  //   let result = new Vector(0, 0, 0, 0);
  //   for (let row = 0; row < 4; row++) {
  //     let sum = 0;
  //     for (let col = 0; col < 4; col++) {
  //       sum += this.getVal(row, col) * other.data[col];
  //     }
  //     result.data[row] = sum;
  //   }
  //   return result;
  // }

  /**
   * Returns the transpose of this matrix
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
   * Get the inverse of this matrix
   */
  inverse(): Matrix {
    let m = this.data;
    let inv = new Float32Array(16);

    inv[0] = m[5] * m[10] * m[15] -
      m[5] * m[11] * m[14] -
      m[9] * m[6] * m[15] +
      m[9] * m[7] * m[14] +
      m[13] * m[6] * m[11] -
      m[13] * m[7] * m[10];

    inv[4] = -m[4] * m[10] * m[15] +
      m[4] * m[11] * m[14] +
      m[8] * m[6] * m[15] -
      m[8] * m[7] * m[14] -
      m[12] * m[6] * m[11] +
      m[12] * m[7] * m[10];

    inv[8] = m[4] * m[9] * m[15] -
      m[4] * m[11] * m[13] -
      m[8] * m[5] * m[15] +
      m[8] * m[7] * m[13] +
      m[12] * m[5] * m[11] -
      m[12] * m[7] * m[9];

    inv[12] = -m[4] * m[9] * m[14] +
      m[4] * m[10] * m[13] +
      m[8] * m[5] * m[14] -
      m[8] * m[6] * m[13] -
      m[12] * m[5] * m[10] +
      m[12] * m[6] * m[9];

    inv[1] = -m[1] * m[10] * m[15] +
      m[1] * m[11] * m[14] +
      m[9] * m[2] * m[15] -
      m[9] * m[3] * m[14] -
      m[13] * m[2] * m[11] +
      m[13] * m[3] * m[10];

    inv[5] = m[0] * m[10] * m[15] -
      m[0] * m[11] * m[14] -
      m[8] * m[2] * m[15] +
      m[8] * m[3] * m[14] +
      m[12] * m[2] * m[11] -
      m[12] * m[3] * m[10];

    inv[9] = -m[0] * m[9] * m[15] +
      m[0] * m[11] * m[13] +
      m[8] * m[1] * m[15] -
      m[8] * m[3] * m[13] -
      m[12] * m[1] * m[11] +
      m[12] * m[3] * m[9];

    inv[13] = m[0] * m[9] * m[14] -
      m[0] * m[10] * m[13] -
      m[8] * m[1] * m[14] +
      m[8] * m[2] * m[13] +
      m[12] * m[1] * m[10] -
      m[12] * m[2] * m[9];

    inv[2] = m[1] * m[6] * m[15] -
      m[1] * m[7] * m[14] -
      m[5] * m[2] * m[15] +
      m[5] * m[3] * m[14] +
      m[13] * m[2] * m[7] -
      m[13] * m[3] * m[6];

    inv[6] = -m[0] * m[6] * m[15] +
      m[0] * m[7] * m[14] +
      m[4] * m[2] * m[15] -
      m[4] * m[3] * m[14] -
      m[12] * m[2] * m[7] +
      m[12] * m[3] * m[6];

    inv[10] = m[0] * m[5] * m[15] -
      m[0] * m[7] * m[13] -
      m[4] * m[1] * m[15] +
      m[4] * m[3] * m[13] +
      m[12] * m[1] * m[7] -
      m[12] * m[3] * m[5];

    inv[14] = -m[0] * m[5] * m[14] +
      m[0] * m[6] * m[13] +
      m[4] * m[1] * m[14] -
      m[4] * m[2] * m[13] -
      m[12] * m[1] * m[6] +
      m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] +
      m[1] * m[7] * m[10] +
      m[5] * m[2] * m[11] -
      m[5] * m[3] * m[10] -
      m[9] * m[2] * m[7] +
      m[9] * m[3] * m[6];

    inv[7] = m[0] * m[6] * m[11] -
      m[0] * m[7] * m[10] -
      m[4] * m[2] * m[11] +
      m[4] * m[3] * m[10] +
      m[8] * m[2] * m[7] -
      m[8] * m[3] * m[6];

    inv[11] = -m[0] * m[5] * m[11] +
      m[0] * m[7] * m[9] +
      m[4] * m[1] * m[11] -
      m[4] * m[3] * m[9] -
      m[8] * m[1] * m[7] +
      m[8] * m[3] * m[5];

    inv[15] = m[0] * m[5] * m[10] -
      m[0] * m[6] * m[9] -
      m[4] * m[1] * m[10] +
      m[4] * m[2] * m[9] +
      m[8] * m[1] * m[6] -
      m[8] * m[2] * m[5];

    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    if (det == 0) {
      return this;
    }

    det = 1.0 / det;

    for (let i = 0; i < 16; i++) {
      inv[i] = inv[i] * det;
    }

    return new Matrix([
      inv[0], inv[1], inv[2], inv[3],
      inv[4], inv[5], inv[6], inv[7],
      inv[8], inv[9], inv[10], inv[11],
      inv[12], inv[13], inv[14], inv[15]
    ]);
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