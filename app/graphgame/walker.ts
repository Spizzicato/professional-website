import * as THREE from 'three';
import { GraphStore, useGraphStore } from "./graphStore";
import GraphNode from "./node";
import GraphEdge from "./edge";
import { randomChoice } from "./helpers";
import { start } from "tone";
import WalkerView from './walkerView';



export default class GraphWalker {
    id!: string;
    mesh!: THREE.Mesh;
    sourceNode!: GraphNode | undefined;
    targetNode!: GraphNode | undefined;
    progress: number = 0;
    walkSpeed: number = 16;
    
    constructor(id: string, initialNode: GraphNode) {
        this.id = id;
        const graph = useGraphStore.getState();

        if (initialNode !== undefined) {
            this.sourceNode = initialNode;
        }
        else {
            const randomNode = graph.getRandomNode();
            if (randomNode) {
                this.sourceNode = randomNode;
                this.mesh.position.copy(this.sourceNode.mesh.position);
            }
        }

        this.updateTarget();
    }

    updateTarget() {
        const graph = useGraphStore.getState();

        // if no current node, attempt to find new current node
        if (!this.sourceNode) {
            const randomNode = graph.getRandomNode();
            if (randomNode) {
                this.sourceNode = randomNode;
            }
        }

        // second check
        if (!this.sourceNode) {
            this.targetNode = undefined;
            return;
        }

        if (!graph.nodes.has(this.sourceNode)) {
            this.sourceNode = undefined;
            this.targetNode = undefined;
        }
        else if (!this.targetNode) {
            this.targetNode = this.sourceNode.getRandomNeighbor();
        }
        else if (!graph.nodes.has(this.sourceNode)) {
            this.targetNode = undefined;
        }

        this.progress = 0;
        if (this.sourceNode?.mesh !== undefined) this.mesh.position.copy(this.sourceNode.mesh.position);
    }

    visitNode(node: GraphNode) {
        this.sourceNode = node;
        this.targetNode = undefined;
        this.mesh.position.copy(node.mesh.position);

        node.angularVelocity = Math.min(node.angularVelocity + 4, 40);
        node.synth.play();
        
        node.mesh.userData.walkerEffectStrength += 2;
        node.mesh.userData.walkerEffectStrength = THREE.MathUtils.clamp(node.mesh.userData.walkerEffectStrength, 0, 4);

        this.updateTarget();
    }
}