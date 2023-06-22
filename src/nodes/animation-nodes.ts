import Vector from '../vector';
import GroupNode from './group-node';
import { Rotation } from '../transformation';
import { Translation, Scaling } from '../transformation';
import Matrix from '../matrix';

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
    if (this.active) {
      this.angle = Math.PI * 4;
      const position = this.groupNode.transform.getMatrix();
      const inverse = this.groupNode.transform.getInverseMatrix();
      let rotation = new Rotation(this.axis, this.angle * deltaT / 10000);
      rotation.matrix = position.mul(rotation.getMatrix());
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
      //pause anmiation if key 'p' is pressed, continue on 'c'
      window.addEventListener('keydown', (event) => {
        if (event.key === 'p' && this.active) {
          this.active = false;
        } else if (event.key === 'c' && !this.active) {
          this.active = true;
        }
      });

      this.number += 0.003 * deltaT;

      const position = this.groupNode.transform.getMatrix();

      let trans = new Translation(new Vector(
        this.translation.x * Math.sin(this.number) / 100,
        this.translation.y * Math.sin(this.number) / 100,
        this.translation.z * Math.sin(this.number) / 100,
        1));

      trans.matrix = position.mul(trans.getMatrix());
      this.groupNode.transform = trans;


      // this.groupNode.transform = new Translation(new Vector(
      //   this.translation.x * Math.sin(this.number) / 3,
      //   this.translation.y * Math.sin(this.number) / 3,
      //   this.translation.z * Math.sin(this.number) / 3,
      //   1));
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
  scale: number = 0.00001;

  constructor(scalingGN: GroupNode, scalingVector: Vector) {
    super(scalingGN);
    this.scalingVector = scalingVector;
  }

  simulate(deltaT: number) {
    if (this.active) {
      window.addEventListener('keydown', (event) => {
        const position: Matrix = this.groupNode.transform.getMatrix();
        if (event.key === '+') {
          position.data[0] += this.scale;
          position.data[5] += this.scale;
          position.data[10] += this.scale;
        } else if (event.key === '-') {
          position.data[0] -= this.scale;
          position.data[5] -= this.scale;
          position.data[10] -= this.scale;
        }
      });
    }
  }
}

export class DriverNode extends AnimationNode {

  newTranslation: Translation;
  constructor(groupNode: GroupNode) {
    super(groupNode);
  }

  // This function is used to simulate the movement of the groupnode
  // get the current position of the groupnode and translate it in the direction of the pressed key

  simulate(deltaT: number) {
    if (this.active) {
      window.addEventListener('keydown', (event) => {
        const position = this.groupNode.transform.getMatrix();
        // Translate groupnode at the position of the groupnode
        if (event.key === 'w') {
          // move up
          position.data[13] += 0.0001;
        } else if (event.key === 'a') {
          // move left
          position.data[12] -= 0.0001;
        } else if (event.key === 's') {
          // move down
          position.data[13] -= 0.0001;
        } else if (event.key === 'd') {
          // move right
          position.data[12] += 0.0001;
        }
      });
    }
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