import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useGraphStore } from "./graphStore";
import type GraphNode from "./node";
import { clickPlane } from "./helpers";
import { useState } from "react";

// colors
const offColor = 0xff00ff;
const onColor = 0xff00aa;

const nodeGeometry = new THREE.IcosahedronGeometry(0.8);
const nodeMaterial = new THREE.MeshStandardMaterial({ 
    color: offColor,
    roughness: 0.2,
    metalness: 0.8,
});

interface NodeViewProps {
	node: GraphNode;
}

export default function NodeView({ node }: NodeViewProps) {
	const { camera, pointer, raycaster } = useThree();
    const edgeStart = useGraphStore(state => state.edgeStart);
    
    const [material, setMaterial] = useState(() => {
        const mat = new THREE.MeshStandardMaterial({ 
            color: offColor,
            roughness: 0.2,
            metalness: 0.8,
        });
        return mat;
    });
    
    useFrame(() => {
        setMaterial(() => {
            const mat = new THREE.MeshStandardMaterial({ 
                color: node === edgeStart ? onColor : offColor,
                roughness: 0.2,
                metalness: 0.8,
            });
            return mat;
        });
    });

	return (
		<mesh
			key={node.id}
			geometry={nodeGeometry}
			material={material}

            ref={(mesh) => {
                if (!mesh || mesh === node.mesh) return;
                node.mesh = mesh;
                mesh.position.copy(node.initialPosition);
                mesh.rotation.copy(node.initialRotation);
                mesh.scale.copy(node.initialScale);
                mesh.userData.node = node;
            }}

			onPointerDown={() => {
				const graph = useGraphStore.getState();

				const hit = new THREE.Vector3();
				raycaster.setFromCamera(pointer, camera);

				if (raycaster.ray.intersectPlane(clickPlane, hit)) {
					graph.grabNode(
						node,
						hit.clone().sub(node.mesh!.position)
					);
				}
			}}
            
			onPointerUp={() => {
				useGraphStore.getState().releaseGrabbedNode();
			}}
		/>
	);
}