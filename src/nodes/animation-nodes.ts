import Vector from '../vector';
import GroupNode from './group-node';
import {Rotation} from '../transformation';
import { Translation } from '../transformation';

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

export class DriverNode extends AnimationNode {
  /**
   *  sets Movement active, default == false
   */
  private forward: boolean;
  private backward: boolean;
  private left: boolean;
  private right: boolean;

  private xposition :number;
  private yposition : number;

  /**
   *
   *  the applied translation Vector
   */
  translation: Vector;

  /**
   *
   * @param groupNode the GroupNode that drives
   */
  constructor(groupNode: GroupNode) {
      super(groupNode);
      this.translation = new Vector(0, 0, 0, 1);
      this.yposition = 0;
      this.xposition = 0;

  }

  /**
   * passing a true/false to bools on which movements are executed
   * @param active, listens to key events
   */
  moveForward(active: boolean) {
      this.forward = active;
  }

  moveBack(active: boolean) {
      this.backward = active;
  }

  moveRight(active: boolean) {
      this.right = active;
  }

  moveLeft(active: boolean) {
      this.left = active;
  }


  simulate(deltaT: number) {

      if (this.forward) {
          if (this.yposition < 4.5){

              this.groupNode.transform = new Translation(new Vector(
                      this.translation.x,
                      this.translation.y += 0.1,
                      this.translation.z,
                      this.translation.w
                  )
              );
              this.yposition +=0.1;
          }

      }
      if (this.backward) {
          if(this.yposition > -1.7 ){

              this.groupNode.transform = new Translation(new Vector(
                  this.translation.x,
                  this.translation.y -= 0.1,
                  this.translation.z,
                  this.translation.w
              ));
              this.yposition-=0.1;
          }


      }
      if (this.left) {
          if(this.xposition < 0.3){
              this.groupNode.transform = new Translation(new Vector(
                  this.translation.x -= 0.1,
                  this.translation.y,
                  this.translation.z,
                  this.translation.w
              ));
              this.xposition+=0.1
          }

      }
      if (this.right) {
          if(this.xposition > -3.10000000000000000001){
              this.groupNode.transform = new Translation(new Vector(
                  this.translation.x += 0.1,
                  this.translation.y,
                  this.translation.z,
                  this.translation.w
              ));
              this.xposition-=0.1;
          }

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