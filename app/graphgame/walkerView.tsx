import * as THREE from 'three';
import { useThree, useFrame } from "@react-three/fiber";
import GraphWalker from './walker';
import { useState, useRef } from 'react';
import { getColorFromPosition } from './helpers';

const walkerGeometry = new THREE.SphereGeometry(1, 32, 32);

interface WalkerViewProps {
    walker: GraphWalker;
}

export default function WalkerView({ walker }: WalkerViewProps) {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state, dt) => {
        if (!walker.sourceNode || !walker.targetNode) return;
        const pathLen = Math.abs(walker.targetNode.mesh.position.clone().sub(walker.sourceNode.mesh.position).length());
        const v = (4 * walker.progress * (1 - walker.progress) + 0.1) * walker.walkSpeed * dt / pathLen;
        walker.progress += v;
        if (walker.progress >= 1) {
            walker.visitNode(walker.targetNode);
        }
        walker.mesh.position.copy(walker.sourceNode.mesh.position.clone().lerp(walker.targetNode.mesh.position, walker.progress));

        walker.mesh.position.z = 4;

        walker.mesh.rotation.z += 1 * dt;
        walker.mesh.rotation.y += 5 * dt;

	    materialRef.current!.color.set(getColorFromPosition(walker.mesh.position));
    });

    return (
        <mesh
            key={walker.id}
            ref={(mesh) => {
                if (!mesh || mesh === walker.mesh) return;
                walker.mesh = mesh;
                mesh.userData.walker = walker;
            }}
        >
            <sphereGeometry
                args={[0.9, 32, 32]}
            />
            <meshStandardMaterial
                ref={materialRef}
                color={0xffffff}
                transparent
                opacity={0.5}
                metalness={0}
                roughness={0.4}
            />
        </mesh>
    );
}