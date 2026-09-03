import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGraphStore } from "./graphStore";
import NodeView from "./nodeView";
import EdgeView from "./edgeView";
import * as THREE from "three";
import { useInputStore } from "./inputStore";
import { clickPlane } from "./helpers";



export function GraphView() {
    const { camera, pointer, raycaster, scene } = useThree();
	const nodes = useGraphStore(state => state.nodes);
	const edges = useGraphStore(state => state.edges);

    useEffect(() => {
        // initial graph setup
        const graph = useGraphStore.getState();
        if (graph.nodes.size > 0) return;
        const a = graph.addNode(new THREE.Vector3(-5, 0, 0));
        const b = graph.addNode(new THREE.Vector3(5, 0, 0));
        graph.addEdge(a, b);

        // probably fixes a bug where grabbed nodes occasionally do not get released
        const handlePointerUp = () => {
            const graph = useGraphStore.getState();
            graph.releaseGrabbedNode();
        }
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    const edgeVec = new THREE.Vector3();
    const t = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const cross = new THREE.Vector3();
    const s = new THREE.Vector3();
    const mat = new THREE.Matrix4();

    useFrame((state, dt) => {
        const graph = useGraphStore.getState();

        const target = new THREE.Vector3();
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.ray.intersectPlane(clickPlane, target) ?? undefined;

        const { keysDown, justPressed } = useInputStore.getState();

        if (justPressed.has(' ')) {
            const hits = raycaster.intersectObjects(scene.children, true);

            if (hits[0]?.object.userData.node) {
                if (graph.edgeStarted()) {
                    graph.endEdge(hits[0].object.userData.node);
                }
                else {
                    graph.startEdge(hits[0].object.userData.node);
                }
            }
            else {
                const newNode = graph.addNode(hit);
                if (graph.edgeStarted()) {
                    graph.endEdge(newNode);
                }
            }
        }
        
        for (const node of graph.nodes) {
            if (node === graph.grabbedNode && graph.grabOffset && hit) {
                node.mesh.position.lerp(hit.clone().sub(graph.grabOffset), 25 * dt);
            }
        }

        for (const edge of graph.edges.values()) {
            const { a, b, mesh: edgeMesh } = edge;
            if (!a || !b || !edgeMesh) continue;

            edgeVec.copy(b.mesh.position).sub(a.mesh.position);

            // translate
            t.lerpVectors(a.mesh.position, b.mesh.position, 0.5);
    
            // rotate
            cross.copy(up.clone().cross(edgeVec));
            if (cross.lengthSq() < 1e-8) {
                // edge case handling
                if (edgeVec.dot(up) < 0)
                    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
            } 
            else {
                q.setFromAxisAngle(cross.normalize(), up.angleTo(edgeVec));
            }
    
            // scale
            s.set(1, edgeVec.length(), 1);
    
            edgeMesh.matrix.copy(mat.compose(t, q, s));
        }

        justPressed.clear();
    });
    
    return (
        <group>
            <group>
                {[...nodes].map((node) => (
                    <NodeView key={node.id} node={node} />
                ))}
            </group>
            <group>
                {[...edges.values()].map((edge) => (
                    <EdgeView key={edge.id} edge={edge} />
                ))}
            </group>
        </group>
    );
}