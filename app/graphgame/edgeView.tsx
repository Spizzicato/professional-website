import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type GraphEdge from "./edge";

const edgeRadius = 0.1;

const edgeVec = new THREE.Vector3();
const t = new THREE.Vector3();
const q = new THREE.Quaternion();
const up = new THREE.Vector3(0, 1, 0);
const cross = new THREE.Vector3();
const s = new THREE.Vector3();
const mat = new THREE.Matrix4();

interface EdgeViewProps {
	edge: GraphEdge;
}

export default function EdgeView({ edge }: EdgeViewProps) {

	useFrame(() => {
        const { a, b, mesh } = edge;

        edgeVec.copy(b.mesh.position).sub(a.mesh.position);

        // translate
        t.lerpVectors(a.mesh.position, b.mesh.position, 0.5);

        // rotate
        cross.copy(up).cross(edgeVec);

        if (cross.lengthSq() < 1e-8) {
            // edge is parallel or anti-parallel to up
            if (edgeVec.dot(up) < 0) {
                q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);  // pointing down so rotate 180
            } 
            else {
                q.identity();  // already pointing up
            }
        } 
        else {
            q.setFromAxisAngle(cross.normalize(), up.angleTo(edgeVec));
        }

        // scale
        s.set(1, edgeVec.length(), 1);

        mesh.matrix.copy(mat.compose(t, q, s));
	});

	return (
		<mesh
            key={edge.id}

            matrixAutoUpdate={false}

            ref={(mesh) => {
                if (!mesh || mesh === edge.mesh) return;
                edge.mesh = mesh;
                mesh.userData.edge = edge;
            }}
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