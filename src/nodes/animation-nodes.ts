import Vector from '../vector';
import GroupNode from './group-node';
import { Rotation } from '../transformation';
import { Translation, Scaling } from '../transformation';

/**
 * Class representing an Animation
 */
class AnimationNode {
  /**
   * Describes if the animation is running
   */
  active: boolean;

  /**
   * Creates a new AnimationNode
   * @param groupNode The GroupNode to attach to
   */
  constructor(public groupNode: GroupNode) {
    this.active = true;
  }

  /**
   * Toggles the active state of the animation node
   */
  toggleActive() {
    this.active = !this.active;
  }

}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class RotationNode extends AnimationNode {
  /**
   * The absolute angle of the rotation
   */
  angle: number;
  /**
   * The vector to rotate around
   */
  axis: Vector;

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   */
  constructor(groupNode: GroupNode, axis: Vector) {
    super(groupNode);
    this.angle = 0;
    this.axis = axis;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    // change the matrix of the attached
    // group node to reflect a rotation
    // TODO
    if (this.active) {
      this.angle = Math.PI * 4;
      const matrix = this.groupNode.transform.getMatrix();
      const inverse = this.groupNode.transform.getInverseMatrix();
      let rotation = new Rotation(this.axis, this.angle * deltaT / 10000);
      rotation.matrix = matrix.mul(rotation.getMatrix());
      rotation.inverse = rotation.getInverseMatrix().mul(inverse);
      this.groupNode.transform = rotation;

    }
  }

}

/**
 * Class representing a Jumper Animation
 * @extends AnimationNode
 */
export class JumperNode extends AnimationNode {

  /**
   * the TranslationVector to be applied
   */
  translation: Vector;

  /**
   * number that increases == x Axis of a sine wave  (makes group node go up and down)
   */
  number: number;

  /**
   *
   * @param groupNode the GroupNode that has to jump
   * @param translation the applied translation
   */
  constructor(groupNode: GroupNode, translation: Vector) {
    super(groupNode);
    this.translation = translation;
    this.number = 1;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {

    if (this.active) {
      this.number += 0.003 * deltaT;
      this.groupNode.transform = new Translation(new Vector(
        this.translation.x * Math.sin(this.number) / 3,
        this.translation.y * Math.sin(this.number) / 3,
        this.translation.z * Math.sin(this.number) / 3,
        1));
    }
  }
}

/**
 * Class representing a Scaler Animation
 * @extends AnimationNode
 */
export class ScalerNode extends AnimationNode {

  scalingVector: Vector;
  scalingfactor: number;
  newTransformation: Scaling;
  constructor(scalingGN: GroupNode, scalingVector: Vector) {
    super(scalingGN);
    this.scalingVector = scalingVector;
  }

  simulate(deltaT: number) {
    //Scale groupnode up one time if key '+' is pressed
    if (this.active) {

      window.addEventListener('keydown', (event) => {
        const position = this.groupNode.transform.getMatrix();
        if (event.key === '+') {
          this.scalingfactor = 1.00001;
          // Create new transformation with position and groupnode.transform
          this.newTransformation = new Scaling(this.scalingVector.mul((this.scalingfactor)));
        } else if (event.key === '-') {
          // Scale down
          this.scalingfactor = 0.99999;
          this.newTransformation = new Scaling(this.scalingVector.mul((this.scalingfactor)));
        }
        this.newTransformation.matrix = position.mul(this.newTransformation.getMatrix());
        this.groupNode.transform = this.newTransformation;

      });
    }


    // deltaT = 1;
    //     if (this.active) {
    //       window.addEventListener('keydown', (event) => {
    //         if (event.key === '+') {
    //         // Scale up
    //         this.scalingfactor += 1;
    //         console.log(this.scalingfactor);

    //         this.groupNode.transform = new Scaling(this.scalingVector.mul((Math.sin(this.scalingfactor))));
    //     }
    //     });
    // }
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class SlerpNode extends AnimationNode {
  /**
   * The time
   */
  t: number;

  // /**
  //  * The rotations to interpolate between
  //  */
  // rotations: [Quaternion, Quaternion];

  // /**
  //  * Creates a new RotationNode
  //  * @param groupNode The group node to attach to
  //  * @param axis The axis to rotate around
  //  */
  // constructor(groupNode: GroupNode, rotation1: Quaternion, rotation2: Quaternion) {
  //   super(groupNode);
  //   this.rotations = [rotation1, rotation2];
  //   this.t = 0;
  // }

  // /**
  //  * Advances the animation by deltaT
  //  * @param deltaT The time difference, the animation is advanced by
  //  */
  // simulate(deltaT: number) {
  //   if (this.active) {
  //     this.t += 0.001 * deltaT;
  //     const rot = this.rotations[0].slerp(this.rotations[1], (Math.sin(this.t) + 1) / 2);
  //     (this.groupNode.transform as SQT).rotation = rot;
  //   }
  // }

}