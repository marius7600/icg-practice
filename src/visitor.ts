import AABoxNode from "./nodes/aabox-node";
import CameraNode from "./nodes/camera-node";
import GroupNode from "./nodes/group-node";
import LightNode from "./nodes/light-node";
import PyramidNode from "./nodes/pyramid-node";
import SphereNode from "./nodes/shere-node";
import TextureBoxNode from "./nodes/texture-box-node";
import TextureVideoBoxNode from "./nodes/texture-video-box-node";
import AnimationNode from "./nodes/animation-nodes";
// import TaskbarNode from "./nodes/taskbar-node";

export default interface Visitor {
  visitLightNode(node: LightNode): void;
  visitGroupNode(node: GroupNode): void;
  visitSphereNode(node: SphereNode): void;
  visitAABoxNode(node: AABoxNode): void;
  visitTextureBoxNode(node: TextureBoxNode): void;
  visitCameraNode(node: CameraNode): void;
  visitGroupNodeCamera(node: GroupNode): void;
  visitPyramidNode(node: PyramidNode): void;
  visitTextureVideoBoxNode(node: TextureVideoBoxNode): void;
  visitAnimationNode(node: AnimationNode): void;
  // visitTaskbarNode(node: TaskbarNode): void;
}
