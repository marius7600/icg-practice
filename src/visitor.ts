import { GroupNode, SphereNode, AABoxNode, TextureBoxNode, CameraNode, LightNode, PyramidNode } from './nodes';

export default interface Visitor {
    visitLightNode(node: LightNode): void;
    visitGroupNode(node: GroupNode): void;
    visitSphereNode(node: SphereNode): void;
    visitAABoxNode(node: AABoxNode): void;
    visitTextureBoxNode(node: TextureBoxNode): void;
    visitCameraNode(node: CameraNode): void;
    visitGroupNodeCamera(node: GroupNode): void;
    visitPyramidNode(node: PyramidNode): void;
}