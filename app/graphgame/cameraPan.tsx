import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGraphStore } from "./graphStore";

export default function CameraPan() {
	const { camera } = useThree();

	const dragging = useRef(false);
	const lastPointer = useRef({ x: 0, y: 0 });

	const targetPosition = useRef(new THREE.Vector3());
	const targetZoom = useRef(camera.zoom);

	const grabbedNode = useGraphStore((state) => state.grabbedNode);

	useEffect(() => {
		targetPosition.current.copy(camera.position);
		targetZoom.current = camera.zoom;
	}, [camera]);

	useFrame((state, dt) => {
		const snappiness = 24;
		const alpha = 1 - Math.exp(-snappiness * dt);

		// smooth movement
		camera.position.lerp(targetPosition.current, alpha);

		// smooth zoom
		camera.zoom = THREE.MathUtils.lerp(
			camera.zoom,
			targetZoom.current,
			alpha
		);

		camera.updateProjectionMatrix();
	});

	const handlePointerDown = (e: PointerEvent) => {
		dragging.current = true;
		lastPointer.current = { x: e.clientX, y: e.clientY };
	};

	const handlePointerMove = (e: PointerEvent) => {
		const graph = useGraphStore.getState();

		if (!dragging.current || graph.grabbedNode) return;

		const dx = e.clientX - lastPointer.current.x;
		const dy = e.clientY - lastPointer.current.y;

		const scale = 1 / camera.zoom;

		targetPosition.current.x -= dx * scale;
		targetPosition.current.y += dy * scale;

		lastPointer.current = { x: e.clientX, y: e.clientY };
	};

	const handlePointerUp = () => {
		dragging.current = false;
	};

	const handleWheel = (e: WheelEvent) => {
		const zoomFactor = 1.1;

		if (e.deltaY < 0) {
			targetZoom.current *= zoomFactor;
		} else {
			targetZoom.current /= zoomFactor;
		}

		targetZoom.current = THREE.MathUtils.clamp(
			targetZoom.current,
			10,
			200
		);
	};

	return (
		<mesh
			position={[0, 0, -1]}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onWheel={handleWheel}
		>
			<planeGeometry args={[10000, 10000]} />
			<meshBasicMaterial transparent opacity={0} />
		</mesh>
	);
}