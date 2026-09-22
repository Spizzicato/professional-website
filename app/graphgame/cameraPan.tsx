import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGraphStore } from "./graphStore";
import { useInputStore } from "./inputStore";
import { clampOrthographicView } from "./helpers";

const zoomFactor = 1.1;

export default function CameraPan() {
	const { camera, size } = useThree();

	const dragging = useRef(false);
	const lastPointer = useRef({ x: 0, y: 0 });

	const targetPosition = useRef(camera.position.clone());
	const targetZoom = useRef(camera.zoom);

	const clampTargets = () => {
		targetZoom.current = clampOrthographicView(
			targetPosition.current,
			targetZoom.current,
			size.width,
			size.height,
			10,
			200
		);
		targetPosition.current.z = 10;
	};

	useEffect(() => {
		targetPosition.current.copy(camera.position);
		targetPosition.current.z = 10;
		targetZoom.current = camera.zoom;
		clampTargets();
		camera.position.copy(targetPosition.current);
		camera.position.z = 10;
		camera.zoom = targetZoom.current;
		camera.updateProjectionMatrix();
	}, [camera, size.width, size.height]);

	useFrame((state, dt) => {
		clampTargets();

		const snappiness = 28;
		const alpha = 1 - Math.exp(-snappiness * dt);

		// smooth movement
		camera.position.lerp(targetPosition.current, alpha);
		camera.position.z = 10;
		camera.up.set(0, 1, 0);
		camera.lookAt(camera.position.x, camera.position.y, 0);

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
        if (useInputStore.getState().isDown('Control')) return;

		if (e.deltaY < 0) {
			targetZoom.current *= zoomFactor;
		}
        else {
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
			<meshBasicMaterial transparent opacity={0} depthWrite={false} />
		</mesh>
	);
}