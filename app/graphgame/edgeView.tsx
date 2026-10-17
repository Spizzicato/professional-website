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

export const edgeGeometry = new THREE.CylinderGeometry(edgeRadius, edgeRadius, 1, 16, 1);
export const edgeMaterial = new THREE.MeshStandardMaterial({
	color: 0xaaaaaa,
	roughness: 0.2,
	metalness: 1.0,
});

function layoutEdge(edge: GraphEdge, mesh: THREE.Mesh) {
	const { a, b } = edge;
	if (!a?.mesh || !b?.mesh) return false;

	edgeVec.copy(b.mesh.position).sub(a.mesh.position);
	t.lerpVectors(a.mesh.position, b.mesh.position, 0.5);
	cross.copy(up).cross(edgeVec);

	if (cross.lengthSq() < 1e-8) {
		if (edgeVec.dot(up) < 0)
			q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
		else
			q.identity();
	}
	else {
		q.setFromAxisAngle(cross.normalize(), up.angleTo(edgeVec));
	}

	s.set(1, edgeVec.length(), 1);
	mesh.matrix.copy(mat.compose(t, q, s));
	return true;
}

interface EdgeViewProps {
	edge: GraphEdge;
}

export default function EdgeView({ edge }: EdgeViewProps) {
	useFrame(() => {
		const { mesh, deleted } = edge;
		if (deleted || !mesh) return;
		mesh.visible = layoutEdge(edge, mesh);
	});

	return (
		<mesh
			key={edge.id}
			geometry={edgeGeometry}
			material={edgeMaterial}
			matrixAutoUpdate={false}
			dispose={null}
			visible={false}
			ref={(mesh) => {
				if (!mesh) return;
				edge.mesh = mesh;
				mesh.userData.edge = edge;
				mesh.visible = layoutEdge(edge, mesh);
			}}
		/>
	);
}
