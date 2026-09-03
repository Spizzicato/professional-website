import * as THREE from "three";
import GraphEdge from "./edge";
import { randomChoice, randomOffset, randomPositiveOffset } from './helpers';

export default class GraphNode {
    id!: string;
    neighbors: Map<GraphNode, GraphEdge> = new Map();
    mesh!: THREE.Mesh;
    initialPosition!: THREE.Vector3;
    initialRotation!: THREE.Euler;
    initialScale!: THREE.Vector3;

    constructor(id: string, position?: THREE.Vector3) {
        this.id = id;
        this.initialPosition = position ?? new THREE.Vector3(0, 0, 0);
        this.initialRotation = new THREE.Euler(
            2 * Math.PI * randomPositiveOffset(),
            2 * Math.PI * randomPositiveOffset(),
            2 * Math.PI * randomPositiveOffset(),
        )
        this.initialScale = new THREE.Vector3(1, 1, 1);
    }

    getRandomNeighbor(): GraphNode | undefined {
        const neighbors = Array.from(this.neighbors.keys());
        if (neighbors.length === 0) return undefined;
        return randomChoice(neighbors);
    }
}