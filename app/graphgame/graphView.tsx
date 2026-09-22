import { useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGraphStore } from "./graphStore";
import NodeView from "./nodeView";
import EdgeView from "./edgeView";
import * as THREE from "three";
import { useInputStore } from "./inputStore";
import { clickPlane, gridCellContainingPointContainsAnyNodes, gridSize, nearestGridPoint } from "./helpers";
import WalkerView from "./walkerView";
import GraphNode from "./node";



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

        const handleWheel = (e: WheelEvent) => {
            if (!useInputStore.getState().isDown('Control')) return;

            const graph = useGraphStore.getState();

            const nodeObjects = [...graph.nodes]
                .map(node => node.mesh)
                .filter((mesh) => mesh !== undefined);

            const hits = raycaster.intersectObjects(nodeObjects, true);

            if (hits.length > 0) {
                const node: GraphNode = hits[0].object.userData.node;
                const value = node.synth.getParameterOptionIndex(0);
                const options = node.synth.getParameterOptions(0);
                const nextValue = Math.max(0, Math.min(value + (e.deltaY < 0 ? 1 : -1), options.length - 1));
                graph.setNodeSynthParameter(node, 0, nextValue);
            }
        };

        // probably fixes a bug where grabbed nodes occasionally do not get released
        const handlePointerUp = (event: PointerEvent) => {
            const graph = useGraphStore.getState();
            graph.releaseGrabbedNode();
        }

        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('wheel', handleWheel);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);

    useFrame((state, dt) => {
        const graph = useGraphStore.getState();

        const target = new THREE.Vector3();
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.ray.intersectPlane(clickPlane, target) ?? undefined;

        const { isDown, isJustPressed, clearJustPressed } = useInputStore.getState();

        const nodeObjects = [...graph.nodes]
            .map(node => node.mesh)
            .filter((mesh) => mesh !== undefined);

        const hits = raycaster.intersectObjects(nodeObjects, true);

        const node = hits[0]?.object.userData.node ?? undefined;
        if (node)
            graph.hoverNode(node);
        else
            graph.unhoverNode();

        if (isJustPressed(' ') && hit) {
            if (node) {
                if (graph.edgeStarted())
                    graph.endEdge(node);
                else
                    graph.startEdge(node);
            }
            else {
                if (!gridCellContainingPointContainsAnyNodes(hit, [...graph.nodes])) {
                    const newNode = graph.addNode(hit);
                    if (graph.edgeStarted()) 
                        graph.endEdge(newNode);
                }
            }
        }
        else if (isJustPressed('Delete')) {
            if (node) 
                graph.removeNode(node);
        }
        else if (isJustPressed('Escape')) {
            graph.deselectNode();
        }

        clearJustPressed();
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