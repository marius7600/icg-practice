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

  /**
   * Accepts a visitor and calls the visitAnimationNode method on it.
   * @param visitor The visitor object.
   */
  accept(visitor: Visitor) {
    visitor.visitAnimationNode(this);
  }

  /**
   * Simulates the animation nodes.
   * 
   * @param deltaT - The time difference between the current frame and the previous frame.
   */
  simulate(deltaT: number) {
  }

  /**
   * Converts the AnimationNode instance to a JSON object.
   * @returns The JSON representation of the AnimationNode.
   */
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
   * The speed of the rotation
   */
  speed: number;
  /**
   * The vector to rotate around
   */
  axis: Vector;

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   * @param speed The speed of the rotation
   */
  constructor(groupNode: GroupNode, axis: Vector, speed: number) {
    super(groupNode);
    this.name = "RotationNode"
    this.speed = speed;
    this.axis = axis;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    if (this.active) {
      // Get the current position of the group node
      const position = this.groupNode.transform.getMatrix();
      const inverse = this.groupNode.transform.getInverseMatrix();

      // Rotate the group node around the given axis by the given angle
      let rotation = new Rotation(this.axis, this.speed * deltaT);

      // Multiply the current position with the rotation matrix
      rotation.matrix = position.mul(rotation.getMatrix());
      rotation.inverse = rotation.getInverseMatrix().mul(inverse);

      // Set the new transformation matrix
      this.groupNode.transform = rotation;
    }
  }

  /**
   * Converts the RotationNode to a JSON object.
   * @returns The JSON representation of the RotationNode.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["speed"] = this.speed
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

  /**
   * The starting position of the group node
   */
  startingPos: Matrix;


  /**
   * Creates a new instance of the JumperNode class.
   * @param groupNode The group node associated with the JumperNode.
   * @param translation The translation vector for the JumperNode.
   * @param startingPos The starting position matrix for the JumperNode.
   */
  constructor(groupNode: GroupNode, translation: Vector, startingPos: Matrix) {
    super(groupNode);
    this.name = "JumperNode"
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

      // Increase the number to make the group node go up and down each frame
      this.number += 0.007 * deltaT;

      // Get the starting position of the groupnode only at the start of the animation 
      const position = this.groupNode.transform.getMatrix();

      // Translate the group node in the desired direction
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
        // Reset the number to 1 to start the animation again
        this.number = 1;
      }
    }
  }

  /**
   * Converts the JumperNode object to a JSON representation.
   * @returns The JSON representation of the JumperNode object.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["startingPos"] = this.startingPos.toJSON()
    json["translation"] = this.translation.toJSON()
    return json
  }
}


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

      // Check if the x value of the scale has reached the target scale value
      if ((this.targetScale.x < 1 && scaling.getMatrix().data[0] <= this.targetScale.x) ||
        (this.targetScale.x > 1 && scaling.getMatrix().data[0] >= this.targetScale.x)) {
        // Stop the animation
        this.active = false;

        // Set the scale to the target scale to avoid floating point errors
        scaling.matrix.data[0] = this.targetScale.x;
        scaling.matrix.data[5] = this.targetScale.y;
        scaling.matrix.data[10] = this.targetScale.z;

        // Update the group node's transform
        this.groupNode.transform = scaling;
      }
    }
  }



  /**
   * Interpolates between two vectors based on a progress value.
   * @param startVec - The starting vector.
   * @param endVec - The ending vector.
   * @param progress - The progress value between 0 and 1.
   * @returns The interpolated vector.
   */
  interpolateVector(startVec: Vector, endVec: Vector, progress: number): Vector {
    const x = this.interpolateValue(startVec.x, endVec.x, progress);
    const y = this.interpolateValue(startVec.y, endVec.y, progress);
    const z = this.interpolateValue(startVec.z, endVec.z, progress);
    const w = this.interpolateValue(startVec.w, endVec.w, progress);
    return new Vector(x, y, z, w);
  }

  /**
   * Interpolates between two values based on a progress value.
   * @param startValue - The starting value.
   * @param endValue - The ending value.
   * @param progress - The progress value between 0 and 1.
   * @returns The interpolated value.
   * Source: https://en.wikipedia.org/wiki/Linear_interpolation
   */

  interpolateValue(startValue: number, endValue: number, progress: number): number {
    return startValue + (endValue - startValue) * progress;
  }

  /**
   * Converts the ScalingNode instance to a JSON object.
   * @returns The JSON representation of the ScalingNode.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["scale"] = this.scale
    json["targetScale"] = this.targetScale
    json["duration"] = this.duration
    return json
  }
}


/**
 * Represents a InputScalerNode class that extends AnimationNode.
 * This class handles scaling of a group node based on keyboard input.
 * @extends AnimationNode
 */
export class InputScalerNode extends AnimationNode {
  private scaleChange: number;

  /**
   * Constructs a new instance of the InputScalerNode class.
   * and adds an event listener to listen for keyboard input. ( + and -)
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

  /**
   * Converts the ScalerMouseNode instance to a JSON object.
   * @returns The JSON representation of the ScalerMouseNode instance.
   */
  toJSON() {
    const json = super.toJSON();
    json["scaleChange"] = this.scaleChange;
    return json;

  }
}

/**
 * Represents a InputDriverNode class that extends AnimationNode.
 * This class handles the movement of a group node based on keyboard input.
 * @extends AnimationNode
 */
export class InputDriverNode extends AnimationNode {
  /**
   * The translation of the group node.
   */
  translation: Translation;

  /**
   * Constructs a new instance of the InputDriverNode class.
   * @param {GroupNode} groupNode - The group node to associate with the driver node.
   */
  constructor(groupNode: GroupNode) {
    super(groupNode);
    this.name = "InputDriverNode"

    // Create a copy of the transformation matrix
    const originalMatrix = groupNode.getTransformation().getMatrix();
    this.translation = new Translation(new Vector(originalMatrix.data[12], originalMatrix.data[13], originalMatrix.data[14], 1));
  }


  /**
   * Simulates the animation of the group node.
   * @param deltaT - The time difference between each simulation step.
   */
  simulate(deltaT: number) {
    if (this.active) {
      window.addEventListener('keydown', (event) => {
        // Get the current position of the group node
        const position = this.groupNode.transform.getMatrix();
        // Add or subtract a small value to the x, y or z axis of the group node based on the keyboard input
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


  /**
   * Converts the DriverNodeMouse object to a JSON representation.
   * @returns The JSON representation of the DriverNodeMouse object.
   */
  toJSON(): any {
    const json = super.toJSON();
    json["translation"] = this.translation
    return json
  }
}

/**
 * Represents a DriverNode class that extends AnimationNode.
 * This class handles the movement of a group node.
 * @extends AnimationNode
 */
export class DriverNode extends AnimationNode {
  distanceToGoal: number;
  speed: number;
  direction: Vector;
  dirChange: boolean = true;
  distanceCovered: number = 0;
  loop: boolean = true;

  /**
   * Represents a DriverNode.
   * @constructor
   * @param {GroupNode} groupNode - The group node.
   * @param {Vector} direction - The direction vector.
   * @param {number} [speed] - The speed of the driver node. Defaults to 0.0001.
   * @param {boolean} [loop] - Indicates whether the driver node should loop. Defaults to false.
   */
  constructor(groupNode: GroupNode, direction: Vector, speed?: number, loop?: boolean) {
    super(groupNode);
    this.name = "DriverNode"
    this.direction = direction;
    this.distanceToGoal = direction.length;
    this.speed = speed || 0.0001;
    this.loop = loop;
  }

  /**
   * Simulates the animation of the group node based on the given delta time.
   * @param deltaT - The time elapsed since the last simulation.
   */
  simulate(deltaT: number) {
    if (this.active) {
      // Get the current position of the group node
      const position = this.groupNode.transform.getMatrix();

      // Calculate the movement of the group node based on the direction and speed
      const movement = this.direction.mul(this.speed * deltaT);

      if (this.dirChange) {
        // Move the group node in the desired direction
        position.data[12] += movement.x;
        position.data[13] += movement.y;
        position.data[14] += movement.z;

        // Update the distance covered by the group node
        this.distanceCovered += movement.length;

        // Check if the group node has reached the goal
        if (this.distanceCovered >= this.distanceToGoal) {
          // Stop the animation if the group node has reached the goal and not looping
          if (this.loop) {
            this.dirChange = false;
          } else {
            // Stop the animation
            this.active = false;
          }
        }
      } else {
        // When looping, move the group node in the opposite direction
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

  /**
   * Converts the DriverNode object to a JSON representation.
   * @returns The JSON representation of the DriverNode object.
   */
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