import Vector from '../vector';
import Node from './node';
import GroupNode from './group-node';
import { Rotation } from '../transformation';
import { Translation, Scaling } from '../transformation';
import Matrix from '../matrix';
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

  toJSON(): any {
    const json = super.toJSON()
    json["active"] = this.active
    json["childNodes"] = []
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
    this.translation = translation;
    this.startingPos = startingPos;
    this.number = 1;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    if (this.active) {
      //pause anmiation if key 'p' is pressed, continue on 'c'
      // window.addEventListener('keydown', (event) => {
      //   if (event.key === 'p' && this.active) {
      //     this.active = false;
      //   } else if (event.key === 'c' && !this.active) {
      //     this.active = true;
      //   }
      // });



      this.number += 0.007 * deltaT;
      // Get the starting position of the groupnode only at the start of the animation 



      console.log(this.startingPos.print());


      const position = this.groupNode.transform.getMatrix();

      let trans = new Translation(new Vector(
        this.translation.x * Math.sin(this.number) / 100,
        this.translation.y * Math.sin(this.number) / 100,
        this.translation.z * Math.sin(this.number) / 100,
        1));

      trans.matrix = position.mul(trans.getMatrix());
      this.groupNode.transform = trans;
      console.log(trans.matrix.print());

      // Stop the animation if the group node has reached its original position
      if (this.groupNode.transform.getMatrix().data[13] <= this.startingPos.data[13]) {
        this.active = false;
        this.groupNode.transform = new Translation(new Vector(
          this.startingPos.data[12],
          this.startingPos.data[13],
          this.startingPos.data[14],
          1));
      }






      // this.groupNode.transform = new Translation(new Vector(
      //   this.translation.x * Math.sin(this.number) / 3,
      //   this.translation.y * Math.sin(this.number) / 3,
      //   this.translation.z * Math.sin(this.number) / 3,
      //   1));
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
    this.scale = new Vector(1, 1, 1, 1);
    this.targetScale = targetScale;
    this.duration = duration;
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
          console.log("finished");
          this.active = false;
          scaling.matrix.data[0] = this.targetScale.x;
          scaling.matrix.data[5] = this.targetScale.y;
          scaling.matrix.data[10] = this.targetScale.z;

          this.groupNode.transform = scaling;
        }
      }
      else if (this.targetScale.x > 1) {
        if (scaling.getMatrix().data[0] >= this.targetScale.x) {
          console.log("finished");
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

  toJSON(): any {
    const json = super.toJSON();
    json["newTranslation"] = this.newTranslation
    return json
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