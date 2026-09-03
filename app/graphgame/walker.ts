// import * as THREE from 'three';
// import { GraphStore, useGraphStore} from "./graphStore";
// import GraphNode from "./node";
// import GraphEdge from "./edge";
// import { randomChoice } from "./helpers";
// import { start } from "tone";



// const walkerGeometry = new THREE.DodecahedronGeometry(1.3);
// const walkerMaterial = new THREE.MeshStandardMaterial({ 
//     color: 0xffffff,
    
// 	transparent: true,
// 	opacity: 0.5,

// 	metalness: 0.0,
// 	roughness: 0.4,
// });



// export class Walker {
//     graph!: Graph;
//     mesh!: THREE.Mesh;

//     currentNode!: GraphNode | undefined;
//     targetNode!: GraphNode | undefined;
    
//     walkSpeed: number = 24;
    
//     constructor(graph: Graph, initialNode?: GraphNode) {
//         this.graph = graph;
//         this.mesh = new THREE.Mesh(walkerGeometry, walkerMaterial);

//         if (initialNode) {
//             this.currentNode = initialNode;
//             this.mesh.position.copy(this.currentNode.mesh.position);
//         }
//         else {
//             const randomNode = this.graph.getRandomNode();
//             if (randomNode) {
//                 this.currentNode = randomNode;
//                 this.mesh.position.copy(this.currentNode.mesh.position);
//             }
//         }

//         this.updateTarget();
//         setInterval(this.updateTarget.bind(this), 50);
//     }

//     updateTarget() {
//         // If no current node, attempt to find new current node
//         if (!this.currentNode) {
//             const randomNode = this.graph.getRandomNode();
//             if (randomNode) {
//                 this.currentNode = randomNode;
//             }
//         }

//         // Second check
//         if (!this.currentNode) {
//             this.targetNode = undefined;
//             return;
//         }

//         if (this.currentNode.deleted) {
//             this.currentNode = undefined;
//             this.targetNode = undefined;
//         }
//         else {
//             if (this.targetNode && this.targetNode.deleted) {
//                 this.targetNode = undefined;
//             }

//             if (!this.targetNode) {
//                 this.targetNode = this.currentNode.getRandomNeighbor();
//             }
//         }
//     }

//     visitNode(node: GraphNode) {
//         this.currentNode = node;
//         this.targetNode = undefined;
//         this.mesh.position.copy(node.mesh.position);

//         node.synth.play();

//         node.mesh.userData.walkerEffectStrength += 2;
//         node.mesh.userData.walkerEffectStrength = THREE.MathUtils.clamp(node.mesh.userData.walkerEffectStrength, 0, 4);

//         this.updateTarget();
//     }

//     handleUndefinedPath() {
//         this.mesh.visible = false;
//         this.mesh.scale.set(1, 1, 1);      
//     }

//     animate(dt: number) {
//         if (this.currentNode) {
//             console.log('cur');
//             this.mesh.visible = true;
            
//             if (this.targetNode && this.targetNode !== this.currentNode) {
//                 this.mesh.visible = true;

//                 const currentPos = this.currentNode.mesh.position;
//                 const targetPos = this.targetNode.mesh.position;

//                 const sourceToTarget = targetPos.clone().sub(currentPos);
//                 const sourceToTargetDistance = sourceToTarget.length();
//                 sourceToTarget.normalize();

//                 const sourceToWalker = this.mesh.position.clone().sub(currentPos);
//                 const proj = sourceToWalker.dot(sourceToTarget);
//                 const progress = proj / sourceToTargetDistance;

//                 const moveAmount = this.walkSpeed * dt;
//                 const next = proj + moveAmount;

//                 const centerCloseness = 2 * (0.5 - Math.abs(progress - 0.5));

//                 let scale = 1 - 0.4 * Math.sqrt(centerCloseness);
//                 scale *= (this.currentNode.mesh.scale.x + this.targetNode.mesh.scale.x) * 0.5;
//                 scale += 0.1;
//                 this.mesh.scale.set(scale, scale, scale);

//                 if (next >= sourceToTargetDistance) {
//                     this.mesh.position.copy(targetPos);
//                     this.visitNode(this.targetNode);
//                 }
//                 else {
//                     const pos = currentPos.clone().add(sourceToTarget.clone().multiplyScalar(next));
//                     this.mesh.position.copy(pos);
//                 }
//             }
//             else {
//                 this.mesh.position.copy(this.currentNode.mesh.position);
//             }
//         }
//         else {
//             this.mesh.scale.set(1, 1, 1);
//             this.mesh.visible = false;
//         }

//         this.mesh.position.setZ(0);
//         this.mesh.rotateX(-0.2 * dt);
//         this.mesh.rotateY(-1.6 * dt);
//     }

// }