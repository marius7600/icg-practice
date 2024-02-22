import Vector from '../math/vector';
import Node from './node';
import GroupNode from './group-node';
import { Rotation } from '../math/transformation';
import { Translation, Scaling } from '../math/transformation';
import Matrix from '../math/matrix';
import Visitor from '../visitor';

/**
 * Class representing an Animation
 */
export default class AnimationNode extends Node {
  /**
   * Describes if the animation is running
   */
  active: boolean;

  /**
   * Creates a new AnimationNode
   * @param groupNode The GroupNode to attach to
   */
  constructor(public groupNode: GroupNode) {
    super()
    this.active = false;
  }

  /**
   * Toggles the active state of the animation node
   */
  toggleActive() {
    this.active = !this.active;
  }

  accept(visitor: Visitor) {
    visitor.visitAnimationNode(this);
  }

  simulate(deltaT: number) {
  }

  toJSON(): any {
    const json = super.toJSON()
    json["active"] = this.active
    json["childCodes"] = []
    return json

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
    this.name = "RotationNode"
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
      let rotation = new Rotation(this.axis, this.angle * deltaT / 700);
      rotation.matrix = position.mul(rotation.getMatrix());
      rotation.inverse = rotation.getInverseMatrix().mul(inverse);
      this.groupNode.transform = rotation;

    }
  }

  toJSON(): any {
    const json = super.toJSON();
    json["angle"] = this.angle
    json["axis"] = this.axis
    return json
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

  startingPos: Matrix;

  /**
   *
   * @param groupNode the GroupNode that has to jump
   * @param translation the applied translation
   */
  constructor(groupNode: GroupNode, translation: Vector, startingPos: Matrix) {
    super(groupNode);
    this.name = "JumperNode"
    this.translation = translation;
    this.startingPos = startingPos;
    // FIXME: This is blocking rerunning the animation
    this.number = 1;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    // console.log("JumperNode state: " + this.active);
    if (this.active) {
      //pause anmiation if key 'p' is pressed, continue on 'c'
      // window.addEventListener('keydown', (event) => {
      //   if (event.key === 'p' && this.active) {
      //     this.active = false;
      //   } else if (event.key === 'c' && !this.active) {
      //     this.active = true;
      //   }
      // });

      // FIXME: This is is blocking rerunning the animation
      this.number += 0.007 * deltaT;
      // Get the starting position of the groupnode only at the start of the animation 

      const position = this.groupNode.transform.getMatrix();

      let trans = new Translation(new Vector(
        this.translation.x * Math.sin(this.number) / 100,
        this.translation.y * Math.sin(this.number) / 100,
        this.translation.z * Math.sin(this.number) / 100,
        1));

      trans.matrix = position.mul(trans.getMatrix());
      this.groupNode.transform = trans;

      // Stop the animation if the group node has reached its original position
      if (this.groupNode.transform.getMatrix().data[13] <= this.startingPos.data[13]) {
        this.active = false;
        this.groupNode.transform = new Translation(new Vector(
          this.startingPos.data[12],
          this.startingPos.data[13],
          this.startingPos.data[14],
          1));
        this.number = 1;
      }
    }
  }

  toJSON(): any {
    const json = super.toJSON();
    json["translation"] = this.translation
    json["number"] = this.number
    return json
  }
}



// /**
//  * Class representing a Scaler Animation
//  * @extends AnimationNode
//  */
// export class ScalerNode extends AnimationNode {
//   scalingfactor: number;
//   newTransformation: Scaling;

//   constructor(scalingGN: GroupNode, private scalingVector: Vector) {
//     super(scalingGN);
//     this.scalingfactor = 1;
//   }

//   simulate(deltaT: number) {
//     if (this.active) {
//       const position: Matrix = this.groupNode.transform.getMatrix();
//       this.scalingfactor += 0.00001 * deltaT;

//       if (this.scalingfactor >= this.scalingVector.length) {
//         this.active = false;
//       }

//       // let scale = new Scaling(this.scalingVector.mul(this.scalingfactor)); // upscaling
//       let scale = new Scaling(this.scalingVector.div(this.scalingfactor));  // downscaling
//       scale.matrix = position.mul(scale.getMatrix());
//       this.groupNode.transform = scale;

//       let downScale = new Scaling(this.scalingVector.div(this.scalingfactor));



//     }
//   }
// }

// /**
//  * Class representing a Scaling Animation
//  * @extends AnimationNode
//  */
// export class ScaleNode extends AnimationNode {
//   /**
//    * The scaling factor along each axis
//    */
//   scale: Vector;
//   scalingSpeed: number;

//   /**
//    * Creates a new ScaleNode
//    * @param groupNode The group node to attach to
//    * @param scale The scaling factor along each axis
//    */
//   constructor(groupNode: GroupNode, scale: Vector) {
//     super(groupNode);
//     this.scale = scale;
//     this.scalingSpeed = 0.01;
//   }

//   /**
//    * Advances the animation by deltaT
//    * @param deltaT The time difference, the animation is advanced by
//    */
//   simulate(deltaT: number) {
//     if (this.active) {
//       const scalingFactor = 1 + this.scale.x * deltaT * this.scalingSpeed;
//       const position = this.groupNode.transform.getMatrix();
//       const inverse = this.groupNode.transform.getInverseMatrix();
//       let scaling = new Scaling(new Vector(scalingFactor, scalingFactor, scalingFactor, 1));
//       scaling.matrix = position.mul(scaling.getMatrix());
//       scaling.inverse = scaling.getInverseMatrix().mul(inverse);
//       this.groupNode.transform = scaling;
//     }
//   }
// }


/**
 * Class representing a Scaling Animation
 * @extends AnimationNode
 */
export class ScaleNode extends AnimationNode {
  /**
   * The scaling factor along each axis
   */
  scale: Vector;
  /**
   * The target scaling factor along each axis
   */
  targetScale: Vector;
  /**
   * The duration of the animation in milliseconds
   */
  duration: number;
  /**
   * The time elapsed since the animation started in milliseconds
   */
  elapsedTime: number;

  /**
   * Creates a new ScaleNode
   * @param groupNode The group node to attach to
   * @param targetScale The target scaling factor along each axis
   * @param duration The duration of the animation in milliseconds
   */
  constructor(groupNode: GroupNode, targetScale: Vector, duration: number) {
    super(groupNode);
    this.name = "ScaleNode"
    this.scale = new Vector(1, 1, 1, 1);
    this.targetScale = targetScale;
    this.duration = duration;
    // FIXME: This is blocking rerunning the animation
    this.elapsedTime = 0;
  }


  // /**
  //  * Advances the animation by deltaT
  //  * @param deltaT The time difference, the animation is advanced by
  //  */
  // simulate(deltaT: number) {
  //   // console.log("scale")
  //   if (this.active) {
  //     // Update the elapsed time
  //     this.elapsedTime += deltaT;

  //     // Calculate the progress of the animation (a value between 0 and 1)
  //     const progress = Math.min(this.elapsedTime / this.duration, 1);

  //     // Interpolate the current scale towards the target scale based on the progress
  //     this.scale = this.interpolateVector(new Vector(1, 1, 1, 1), this.targetScale, progress);

  //     // Apply the interpolated scale to the group node's transform
  //     const position = this.groupNode.transform.getMatrix();
  //     const inverse = this.groupNode.transform.getInverseMatrix();
  //     const scaling = new Scaling(this.scale);
  //     scaling.matrix = position.mul(scaling.getMatrix());
  //     scaling.inverse = scaling.getInverseMatrix().mul(inverse);
  //     this.groupNode.transform = scaling;

  //     console.log(progress);

  //     // Check if the animation is completed and deactivate it
  //     if (progress >= 1) {
  //       this.active = false;
  //     }
  //   }
  // }


  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    if (this.active) {
      // Interpolate the current scale towards the target scale
      const progress = this.elapsedTime / this.duration;
      this.scale = this.interpolateVector(new Vector(1, 1, 1, 1), this.targetScale, progress);

      // Apply the interpolated scale to the group node's transform
      const position = this.groupNode.transform.getMatrix();
      const inverse = this.groupNode.transform.getInverseMatrix();
      const scaling = new Scaling(this.scale);
      scaling.matrix = position.mul(scaling.getMatrix());
      scaling.inverse = scaling.getInverseMatrix().mul(inverse);
      this.groupNode.transform = scaling;

      // Update the elapsed time
      this.elapsedTime += deltaT;

      // Check if the x value of the scale are equal to the target scale values
      if (this.targetScale.x < 1) {
        if (scaling.getMatrix().data[0] <= this.targetScale.x) {
          this.active = false;
          scaling.matrix.data[0] = this.targetScale.x;
          scaling.matrix.data[5] = this.targetScale.y;
          scaling.matrix.data[10] = this.targetScale.z;

          this.groupNode.transform = scaling;
        }
      }
      else if (this.targetScale.x > 1) {
        if (scaling.getMatrix().data[0] >= this.targetScale.x) {
          this.active = false;
          scaling.matrix.data[0] = this.targetScale.x;
          scaling.matrix.data[5] = this.targetScale.y;
          scaling.matrix.data[10] = this.targetScale.z;

          this.groupNode.transform = scaling;
        }
      }
    }
  }




  /**
   * Interpolates between two values based on the given progress
   * @param startValue The starting value
   * @param endValue The ending value
   * @param progress The progress of the interpolation (a value between 0 and 1)
   * @returns The interpolated value
   */
  interpolateVector(startVec: Vector, endVec: Vector, progress: number): Vector {
    const x = this.interpolateValue(startVec.x, endVec.x, progress);
    const y = this.interpolateValue(startVec.y, endVec.y, progress);
    const z = this.interpolateValue(startVec.z, endVec.z, progress);
    const w = this.interpolateValue(startVec.w, endVec.w, progress);
    return new Vector(x, y, z, w);
  }

  interpolateValue(startValue: number, endValue: number, progress: number): number {
    return startValue + (endValue - startValue) * progress;
    //return startValue + progress * (endValue - startValue);
  }

  toJSON(): any {
    const json = super.toJSON();
    json["scale"] = this.scale
    json["targetScale"] = this.targetScale
    return json
  }
}


/**
 * Represents a ScalerNodeMouse class that extends AnimationNode.
 * This class handles scaling of a group node based on keyboard input.
 */
export class ScalerNodeMouse extends AnimationNode {
  private scaleChange: number;

  /**
   * Constructs a new instance of the ScalerNodeMouse class.
   * @param groupNode The group node to be scaled.
   */
  constructor(groupNode: GroupNode) {
    super(groupNode);
    this.name = "ScalerNodeMouse"
    this.scaleChange = 0;

    window.addEventListener('keydown', (event) => {
      if (event.key === '+') {
        this.scaleChange = 0.05;
      } else if (event.key === '-') {
        this.scaleChange = -0.05;
      }
    });
  }

  /**
   * Simulates the scaling of the group node based on the scale change.
   * @param deltaT The time difference between the current and previous frame.
   */
  simulate(deltaT: number): void {
    if (this.active) {
      const position = this.groupNode.transform.getMatrix();
      position.data[0] += this.scaleChange;
      position.data[5] += this.scaleChange;
      position.data[10] += this.scaleChange;
      this.scaleChange = 0; // Reset the scale change
    }
  }

  toJSON() {
    const json = super.toJSON();
    json["scaleChange"] = this.scaleChange;
    return json;

  }
}

export class DriverNodeMouse extends AnimationNode {

  translation: Translation;
  constructor(groupNode: GroupNode) {
    super(groupNode);
    this.name = "DriverNodeMouse"
    // Create a copy of the transformation matrix
    const originalMatrix = groupNode.getTransformation().getMatrix();
    this.translation = new Translation(new Vector(originalMatrix.data[12], originalMatrix.data[13], originalMatrix.data[14], 1));
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
        } else if (event.key === 'r') {
          // move forward
          position.data[14] -= 0.0001;
        } else if (event.key === 'f') {
          // move backward
          position.data[14] += 0.0001;
        } else if (event.key === 'y') {
          console.log(this.translation.getMatrix().print());

          // reset position to the start postion of the group node (translation)
          position.data[12] = this.translation.getMatrix().data[12];
          position.data[13] = this.translation.getMatrix().data[13];
          position.data[14] = this.translation.getMatrix().data[14];

        }
      });
    }
  }
  toJSON(): any {
    const json = super.toJSON();
    json["translation"] = this.translation
    return json
  }
}


export class DriverNode extends AnimationNode {
  distanceToGoal: number;
  speed: number;
  direction: Vector;
  dirChange: boolean = true;
  distanceCovered: number = 0;
  loop: boolean = true;

  constructor(groupNode: GroupNode, direction: Vector, speed?: number, loop?: boolean) {
    super(groupNode);
    this.name = "DriverNode"
    this.direction = direction;
    this.distanceToGoal = direction.length;
    this.speed = speed || 0.0001;
    this.loop = loop;
  }

  simulate(deltaT: number) {
    if (this.active) {
      const position = this.groupNode.transform.getMatrix();
      const movement = this.direction.mul(this.speed * deltaT);
      if (this.dirChange) {
        position.data[12] += movement.x;
        position.data[13] += movement.y;
        position.data[14] += movement.z;
        this.distanceCovered += movement.length;
        // Check if the group node has reached the goal
        if (this.distanceCovered >= this.distanceToGoal) {
          if (this.loop) {
            this.dirChange = false;
          } else {
            this.active = false;
          }
        }
      } else {
        position.data[12] -= movement.x;
        position.data[13] -= movement.y;
        position.data[14] -= movement.z;
        this.distanceCovered -= movement.length;
        if (this.distanceCovered <= 0) {
          this.dirChange = true;
        }
      }
    }
  }

  toJSON() {
    const json = super.toJSON();
    json["distanceToGoal"] = this.distanceToGoal;
    json["speed"] = this.speed;
    json["direction"] = this.direction;
    json["dirChange"] = this.dirChange;
    json["distanceCovered"] = this.distanceCovered;
    json["loop"] = this.loop;
    return json;
  }
}