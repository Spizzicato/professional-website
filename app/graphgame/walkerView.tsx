import * as THREE from 'three';
import { useThree, useFrame } from "@react-three/fiber";
import GraphWalker from './walker';
import { useState, useRef, useEffect } from 'react';
import { getColorFromPosition } from './helpers';

const walkerGeometry = new THREE.SphereGeometry(1, 32, 32);
const defaultScale = 1.33;

interface WalkerViewProps {
    walker: GraphWalker;
}

export default function WalkerView({ walker }: WalkerViewProps) {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "ArrowUp") {
                walker.walkSpeed += 4;
            }
            else if (e.code === "ArrowDown") {
                walker.walkSpeed = Math.max(0, walker.walkSpeed - 4);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [walker]);

    useFrame((state, dt) => {
        if (!walker.mesh) return;

        walker.mesh.rotation.z += 1 * dt;
        walker.mesh.rotation.y += 5 * dt;

	    materialRef.current!.color.set(getColorFromPosition(walker.mesh.position));

        if (!walker.currentPathIsValid()) {
            walker.updateTarget();
        }

        if (!walker.sourceNode?.mesh) return;
        if (!walker.targetNode?.mesh) {
            walker.snapToSource();
            return;
        }
        const pathLen = 0.75 * (Math.abs(walker.targetNode.mesh.position.x - walker.sourceNode.mesh.position.x) + Math.abs(walker.targetNode.mesh.position.y - walker.sourceNode.mesh.position.y));
        let v = (4 * walker.progress * (1 - walker.progress) + 0.1);
        const s = defaultScale * (1 - 0.5 * Math.pow(v, 0.25));
        walker.mesh.scale.set(s, s, s);
        v *= walker.walkSpeed * dt / pathLen;
        walker.progress += v;
        if (walker.progress >= 1) {
            walker.visitNode(walker.targetNode);
            return;
        }
        walker.mesh.position.copy(walker.sourceNode.mesh.position.clone().lerp(walker.targetNode.mesh.position, walker.progress));
        walker.mesh.position.z = 4;
    });

    return (
        <mesh
            key={walker.id}
            ref={(mesh) => {
                if (!mesh || mesh === walker.mesh) return;
                walker.mesh = mesh;
                mesh.userData.walker = walker;
            }}
            raycast={() => null}
        >
            <sphereGeometry
                args={[defaultScale, 32, 32]}
            />
            <meshStandardMaterial
                ref={materialRef}
                color={0xffffff}
                transparent
                opacity={0.25}
                metalness={0}
                roughness={0.4}
            />
        </mesh>
    );
}