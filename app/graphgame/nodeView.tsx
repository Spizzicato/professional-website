import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useGraphStore } from "./graphStore";
import GraphNode from "./node";
import { clickPlane } from "./helpers";
import { useState, useRef } from "react";
import { getColorFromPosition, nearestGridPoint } from "./helpers";
import { select } from "three/tsl";
import { Html } from "@react-three/drei";
import NodeMenu from "./nodeMenu";

// const offColor = 0xff00ff;
const onColor = 0xffffff;

interface NodeViewProps {
	node: GraphNode;
}

const hit = new THREE.Vector3();

export default function NodeView({ node }: NodeViewProps) {
	const { camera, pointer, raycaster } = useThree();
    const edgeStart = useGraphStore(state => state.edgeStart);
    const selectedNode = useGraphStore(state => state.selectedNode);
    const nodeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    const selectAuraMeshRef = useRef<THREE.Mesh>(null);
    const selectAuraMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    useFrame((state, dt) => {
        const graph = useGraphStore.getState();

        node.angularVelocity = Math.max(node.angularVelocity - 0.5 * dt, 1)
        node.mesh.rotation.y += 0.3 * node.angularVelocity * dt;

        raycaster.setFromCamera(pointer, camera);
        raycaster.ray.intersectPlane(clickPlane, hit);
        if (node === graph.grabbedNode && graph.grabOffset) {
            node.mesh.position.lerp(hit.clone().sub(graph.grabOffset), 25 * dt);
        }
        else {
            node.mesh.position.lerp(nearestGridPoint(node.mesh.position), 1 - Math.exp(-12 * dt));
        }

        for (const materialRef of [nodeMaterialRef, selectAuraMaterialRef]) {
            materialRef.current!.color.set((() => {
                return node === edgeStart ? onColor : getColorFromPosition(node.mesh.position);
            })());
        }

        if (node === selectedNode) {
            node.mesh.scale.set(1.2, 1.2, 1.2);
        }
        else {
            node.mesh.scale.set(1, 1, 1);
        }

        selectAuraMeshRef.current?.position.set(node.mesh.position.x, node.mesh.position.y, -20);
        selectAuraMeshRef.current?.scale.copy(node.mesh.scale);
        selectAuraMeshRef.current?.rotation.copy(node.mesh.rotation);
    });

	return (
        <>
            <mesh
                key={node.id}

                ref={(mesh) => {
                    if (!mesh || mesh === node.mesh) return;
                    node.mesh = mesh;
                    mesh.position.copy(node.initialPosition);
                    mesh.rotation.copy(node.initialRotation);
                    mesh.scale.copy(node.initialScale);
                    mesh.userData.node = node;
                }}
            >
                <icosahedronGeometry 
                    args={[0.6, 0]}
                />
                <meshStandardMaterial
                    ref={nodeMaterialRef}
                    color={onColor}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            <mesh
                key={`${node.id}-select`}

                ref={selectAuraMeshRef}

                visible={node === selectedNode}
            >
                <icosahedronGeometry 
                    args={[0.9, 0]}
                />
                <meshStandardMaterial
                    ref={selectAuraMaterialRef}
                    color={onColor}
                    transparent
                    opacity={0.2}
                    metalness={0}
                    roughness={0.4}
                />
            </mesh>
        </>
	);
}