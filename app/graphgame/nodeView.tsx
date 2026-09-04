import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useGraphStore } from "./graphStore";
import type GraphNode from "./node";
import { clickPlane } from "./helpers";
import { useState, useRef } from "react";
import { getColorFromPosition } from "./helpers";

// const offColor = 0xff00ff;
const onColor = 0xffffff;

interface NodeViewProps {
	node: GraphNode;
}

const hit = new THREE.Vector3();

export default function NodeView({ node }: NodeViewProps) {
	const { camera, pointer, raycaster } = useThree();
    const edgeStart = useGraphStore(state => state.edgeStart);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    useFrame((state, dt) => {
        node.mesh.rotation.y += 0.3 * dt;

        materialRef.current!.color.set((() => {
            return node === edgeStart ? onColor : getColorFromPosition(node.mesh.position);
        })());
    });

	return (
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

			onPointerDown={() => {
				raycaster.setFromCamera(pointer, camera);
				if (raycaster.ray.intersectPlane(clickPlane, hit)) {
                    const graph = useGraphStore.getState();
					graph.grabNode(
						node,
						hit.clone().sub(node.mesh!.position)
					);
				}
			}}
            
			onPointerUp={() => {
				useGraphStore.getState().releaseGrabbedNode();
			}}
		>
            <icosahedronGeometry 
                args={[0.6, 0]}
            />
            <meshStandardMaterial
                ref={materialRef}
                color={onColor}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
	);
}