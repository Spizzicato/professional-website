import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type GraphEdge from "./edge";

const edgeRadius = 0.1;

interface EdgeViewProps {
	edge: GraphEdge;
}

export default function EdgeView({ edge }: EdgeViewProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	const direction = new THREE.Vector3();
	const midpoint = new THREE.Vector3();
	const up = new THREE.Vector3(0, 1, 0);

	useFrame(() => {
		const mesh = meshRef.current;
		const a = edge.a.mesh.position;
		const b = edge.b.mesh.position;

		if (!mesh) return;

		direction.subVectors(b, a);

		const length = direction.length();
		if (length === 0) return;

		direction.normalize();

		midpoint.lerpVectors(a, b, 0.5);

		mesh.position.copy(midpoint);
		mesh.quaternion.setFromUnitVectors(up, direction);
		mesh.scale.set(1, length, 1);
	});

	return (
		<mesh
			ref={meshRef}
		>
            <cylinderGeometry
                args={[edgeRadius, edgeRadius, 1, 16, 1]}
            />
            <meshStandardMaterial
                color={0xaaaaaa}
                roughness={0.2}
                metalness={1.0}
            />
        </mesh>
	);
}