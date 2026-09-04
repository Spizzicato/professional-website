import * as THREE from "three";
import GraphNode from "./node";



export default class GraphEdge {
    id!: string;
    a!: GraphNode;
    b!: GraphNode;
    deleted: boolean = false;
    mesh!: THREE.Mesh;

    constructor(id: string, a: GraphNode, b: GraphNode) {
        this.id = id;
        this.a = a;
        this.b = b;
    }
}