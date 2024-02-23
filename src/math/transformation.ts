import Matrix from "./matrix";
import AABoxNode from "../nodes/aabox-node";
import GroupNode from "../nodes/group-node";
import TextureBoxNode from "../nodes/texture-box-node";
import TextureVideoBoxNode from "../nodes/texture-video-box-node";
import Vector from "./vector";

/**
 * Represents a transformation in 2D or 3D space.
 */
export interface Transformation {
    /**
     * Gets the matrix representation of the transformation.
     * @returns The matrix representing the transformation.
     */
    getMatrix(): Matrix;

    /**
     * Gets the inverse matrix of the transformation.
     * @returns The inverse matrix of the transformation.
     */
    getInverseMatrix(): Matrix;

    /**
     * Converts the transformation to a JSON object.
     * @returns The JSON representation of the transformation.
     */
    toJSON(): any;
}

export class MatrixTransformation implements Transformation {
    public matrix: Matrix;
    public inverse: Matrix;

    /**
     * Represents a transformation with a matrix and its inverse.
     * @param matrix - The transformation matrix.
     * @param inverse - The inverse of the transformation matrix.
     */
    constructor(matrix: Matrix, inverse: Matrix) {
        this.matrix = matrix;
        this.inverse = inverse;
    }

    /**
     * Retrieves the matrix associated with this transformation.
     * 
     * @returns The matrix representing the transformation.
     */
    getMatrix(): Matrix {
        return this.matrix;
    }

    /**
     * Returns the inverse matrix of the transformation.
     * @returns The inverse matrix.
     */
    getInverseMatrix(): Matrix {
        return this.inverse;
    }

    /**
     * Converts the transformation object to a JSON representation.
     * @returns The JSON representation of the transformation object.
     */
    toJSON() {
        let transform;
        if (this instanceof Transform4x4) {
            transform = {
                type: "Transform4x4",
                matrix: this.matrix.toJSON(),
                inverse: this.inverse.toJSON()
            }
        } else if (this instanceof Translation) {
            transform = {
                type: "Translation",
                matrix: this.matrix.toJSON(),
                inverse: this.inverse.toJSON()
            }
        } else if (this instanceof EmptyTransformation) {
            transform = {
                type: "EmptyTransformation",
                matrix: this.matrix.toJSON(),
                inverse: this.inverse.toJSON()
            }
        } else if (this instanceof Rotation) {
            transform = {
                type: "Rotation",
                matrix: this.matrix.toJSON(),
                inverse: this.inverse.toJSON()
            }
        } else if (this instanceof RotateWithPosition) {
            transform = {
                type: "RotateWithPosition",
                matrix: this.matrix.toJSON(),
                inverse: this.inverse.toJSON()
            }
        } else if (this instanceof Scaling) {
            transform = {
                type: "Scaling",
                matrix: this.matrix.toJSON(),
                inverse: this.inverse.toJSON()
            }
        }
        else {
            console.log("Unknown transformation type", this);
        }
        return transform;
    }
}

/**
 * Represents a 4x4 transformation matrix.
 */
export class Transform4x4 extends MatrixTransformation {
    /**
     * Creates a new Transform4x4 instance.
     * @param translation - The translation vector.
     * @param rotation - The rotation object.
     */
    constructor(translation: Vector, rotation: Rotation) {
        super(Matrix.translation(translation).mul(rotation.getMatrix()), rotation.getMatrix().transpose().mul(Matrix.translation(translation.mul(-1))));
    }
}

/**
 * Represents a translation transformation in 3D space.
 */
export class Translation extends MatrixTransformation {
    /**
     * Creates a new Translation instance.
     * @param translation - The translation vector.
     */
    constructor(translation: Vector) {
        super(Matrix.translation(translation), Matrix.translation(translation.mul(-1)));
    }
}

/**
 * Represents an empty transformation.
 */
export class EmptyTransformation extends MatrixTransformation {
    /**
     * Creates a new instance of the Transformation class.
     * The transformation is the identity matrix.
     */
    constructor() {
        super(Matrix.identity(), Matrix.identity());
    }
}

/**
 * Represents a rotation transformation in 3D space.
 */
export class Rotation extends MatrixTransformation {
    private _axis: Vector;
    private _angle: number;

    /**
     * Creates a new Rotation object.
     * @param axis The axis of rotation.
     * @param angle The angle of rotation in degrees.
     */
    constructor(axis: Vector, angle: number) {
        super(Matrix.rotation(axis, angle), Matrix.rotation(axis, -angle));
        this._axis = axis;
        this.angle = angle * (Math.PI / 180); //Convert to radiant, because Math.sin and Math.cos expect radiant
    }

    /**
     * Sets the axis of the transformation.
     * @param {Vector} axis - The axis to set.
     */
    set axis(axis: Vector) {
        this._axis = axis;
        this.recalculate();
    }

    /**
     * Sets the angle of the transformation.
     * @param angle - The new angle value.
     */
    set angle(angle: number) {
        this._angle = angle;
        this.recalculate();
    }

    /**
     * Recalculates the transformation matrix and its inverse based on the current axis and angle.
     */
    private recalculate() {
        this.matrix = Matrix.rotation(this._axis, this._angle);
        this.inverse = Matrix.rotation(this._axis, -this._angle);
    }
}

/**
 * Represents a transformation that rotates an object around a specific position.
 */
export class RotateWithPosition extends MatrixTransformation {
    /**
     * Creates a new instance of the RotateWithPosition class.
     * @param node - The group node to apply the transformation to.
     * @param rotation - The rotation to apply.
     */
    constructor(node: GroupNode, rotation: Rotation) {
        rotation.angle = rotation.angle * (Math.PI / 180);
        super(node.transform.getMatrix().mul(rotation.getMatrix()), rotation.getInverseMatrix().mul(node.transform.getInverseMatrix()));
    }
}


/**
 * Represents a scaling transformation in 3D space.
 */
export class Scaling extends MatrixTransformation {
    /**
     * Creates a new instance of the Scaling class.
     * @param scale - The scale vector.
     */
    constructor(scale: Vector) {
        super(Matrix.scaling(scale), Matrix.scaling(new Vector(1 / scale.x, 1 / scale.y, 1 / scale.z, 0)));
    }
}