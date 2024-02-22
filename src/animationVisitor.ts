import Visitor from './visitor'
import Node from './nodes/node'
import AnimationNode from './nodes/animation-nodes'
import AABoxNode from './nodes/aabox-node'
import CameraNode from './nodes/camera-node'
import GroupNode from './nodes/group-node'
import Matrix from './math/matrix'
import PyramidNode from './nodes/pyramid-node'
import SphereNode from './nodes/sphere-node'
import TextureVideoBoxNode from './nodes/texture-video-box-node'
import LightNode from './nodes/light-node'
import MeshNode from './nodes/mesh-node'
import TextureTextBoxNode from './nodes/texture-text-box-node'


export default class AnimationVisitor implements Visitor {
    private animationNodes: AnimationNode[]
    private matrixStack: { traverse: Matrix, inverse: Matrix }[]


    visit(node: Node) {
        this.matrixStack = [{ traverse: Matrix.identity(), inverse: Matrix.identity() }]
        this.animationNodes = []
        node.accept(this)
        return this.animationNodes
    }

    visitAABoxNode(node: AABoxNode): void {
    }

    visitPyramidNode(node: PyramidNode): void {
    }

    visitSphereNode(node: SphereNode): void {
    }


    visitAnimationNode(node: AnimationNode) {
        this.animationNodes.push(node)
        node.groupNode.accept(this)
    }

    visitTextureVideoBoxNode(node: TextureVideoBoxNode): void {
    }

    visitCameraNode(node: CameraNode): void {

    }

    visitGroupNode(node: GroupNode): void {

    }

    visitGroupNodeCamera(node: GroupNode): void {

    }

    visitLightNode(node: LightNode): void {
    }

    visitTextureBoxNode(node: TextureVideoBoxNode): void {
    }

    visitMeshNode(node: MeshNode): void {

    }

    visitTextureTextBoxNode(node: TextureTextBoxNode): void {

    }


};