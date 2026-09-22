import * as THREE from 'three';
import { useGraphStore } from "./graphStore";
import GraphNode from "./node";
import { shallow } from 'zustand/shallow';



export default class GraphWalker {
    id!: string;
    mesh!: THREE.Mesh;
    sourceNode!: GraphNode | undefined;
    targetNode!: GraphNode | undefined;
    progress: number = 0;
    walkSpeed: number = 16;

    private unsubscribeFromGraphStructure!: () => void;
    
    constructor(id: string, initialNode: GraphNode) {
        this.id = id;
        const graph = useGraphStore.getState();

        this.unsubscribeFromGraphStructure = useGraphStore.subscribe(
			state => [state.nodes, state.edges] as const,
            ([nodes, edges]) => {
                this.updateTarget();
                this.mesh.visible = nodes.size > 0;
			},
            { equalityFn: shallow }
		);

        if (initialNode !== undefined) {
            this.sourceNode = initialNode;
        }
        else {
            const randomNode = graph.nodes.size > 0 ? graph.getRandomNode() : undefined;
            if (randomNode) {
                this.sourceNode = randomNode;
            }
        }

        this.updateTarget();
    }

    currentPathIsValid() {
        const graph = useGraphStore.getState();
        return (
            !!this.sourceNode &&
            graph.nodes.has(this.sourceNode) &&
            !!this.targetNode &&
            graph.nodes.has(this.targetNode) &&
            graph.edgeExists(this.sourceNode, this.targetNode)
        );
    }

    updateTarget() {
        const graph = useGraphStore.getState();

        if (this.currentPathIsValid()) {
            return;
        }

        const sourceValid = !!this.sourceNode && graph.nodes.has(this.sourceNode);
        const targetValid = !!this.targetNode && graph.nodes.has(this.targetNode);

        if (sourceValid) {
            this.targetNode = this.sourceNode!.getRandomNeighbor();
        } else if (targetValid) {
            this.sourceNode = this.targetNode;
            this.targetNode = this.sourceNode!.getRandomNeighbor();
        } else if (graph.nodes.size > 0) {
            this.sourceNode = graph.getRandomNode();
            this.targetNode = this.sourceNode.getRandomNeighbor();
        } else {
            this.sourceNode = undefined;
            this.targetNode = undefined;
        }

        this.progress = 0;
        this.snapToSource();
    }

    snapToSource() {
        if (this.mesh && this.sourceNode?.mesh) {
            this.mesh.position.copy(this.sourceNode.mesh.position);
            this.mesh.position.z = 4;
        }
    }

    visitNode(node: GraphNode) {
        this.sourceNode = node;
        this.targetNode = undefined;
        this.snapToSource();

        node.angularVelocity = Math.min(node.angularVelocity + 4, 40);
        node.synth.play();
        
        if (node.mesh) {
            node.mesh.userData.walkerEffectStrength += 2;
            node.mesh.userData.walkerEffectStrength = THREE.MathUtils.clamp(node.mesh.userData.walkerEffectStrength, 0, 4);
        }

        this.updateTarget();
    }
}
