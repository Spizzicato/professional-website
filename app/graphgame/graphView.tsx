import { useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGraphStore } from "./graphStore";
import NodeView from "./nodeView";
import EdgeView from "./edgeView";
import * as THREE from "three";
import { useInputStore } from "./inputStore";
import { clickPlane, gridCellContainingPointContainsAnyNodes, gridSize, nearestGridPoint } from "./helpers";
import WalkerView from "./walkerView";



export function GraphView() {
    const { camera, pointer, raycaster, scene } = useThree();
	const nodes = useGraphStore(state => state.nodes);
    const edgesRaw = useGraphStore(state => state.edges);
	const edges = useMemo(() => {
		return Array.from(
			new Set(
                Array.from(
                    edgesRaw.values()).flatMap((e) => Array.from(e.values())
                )
			)
		);
	}, [edgesRaw]);
    const walkers = useGraphStore(state => state.walkers);

    useEffect(() => {
        // initial graph setup
        const graph = useGraphStore.getState();
        if (graph.nodes.size > 0) return;
        const a = graph.addNode(new THREE.Vector3(-6, 0, 0));
        const b = graph.addNode(new THREE.Vector3(6, 0, 0));
        graph.addEdge(a, b);
        graph.addWalker(a);

        const handlePointerDown = () => {
            const graph = useGraphStore.getState();

            const nodeObjects = [...graph.nodes]
                .map(node => node.mesh)
                .filter((mesh) => mesh !== undefined);

            const hits = raycaster.intersectObjects(nodeObjects, true);

            if (hits.length > 0) {
                graph.grabNode(hits[0].object.userData.node, hits[0].point.clone().sub(hits[0].object.position));
                graph.selectNode(hits[0].object.userData.node);
            }
        };

        // probably fixes a bug where grabbed nodes occasionally do not get released
        const handlePointerUp = (event: PointerEvent) => {
            const graph = useGraphStore.getState();
            graph.releaseGrabbedNode();
        }

        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    


    useFrame((state, dt) => {
        const graph = useGraphStore.getState();

        const target = new THREE.Vector3();
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.ray.intersectPlane(clickPlane, target) ?? undefined;

        const { keysDown, justPressed } = useInputStore.getState();

        if (justPressed.has(' ') && hit) {
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
                if (!gridCellContainingPointContainsAnyNodes(hit, [...graph.nodes])) {
                    const newNode = graph.addNode(hit);
                    if (graph.edgeStarted()) {
                        graph.endEdge(newNode);
                    }
                }
            }
        }
        else if (justPressed.has('Delete')) {
            const hits = raycaster.intersectObjects(scene.children, true);
            if (hits[0]?.object.userData.node) {
                graph.removeNode(hits[0]?.object.userData.node);
            }
        }
        else if (justPressed.has('Escape')) {
            graph.deselectNode();
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
            <group>
                {[...walkers.values()].map((walker) => (
                    <WalkerView key={walker.id} walker={walker} />
                ))}
            </group>
        </group>
    );
}