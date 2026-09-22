import * as THREE from 'three';
import { MathUtils } from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { useGraphStore } from './graphStore';
import GraphNode from './node';

export const clickPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

export function randomOffset() { return MathUtils.randFloat(-1, 1); }

export function randomPositiveOffset() { return MathUtils.randFloat(0, 1); }

export function randomChoice(arr: Array<any>) { return arr[Math.floor(Math.random() * arr.length)]; }

const q = new THREE.Quaternion();
export function rotateAroundAxis(
    object: THREE.Object3D, 
    point: THREE.Vector3, 
    axis: THREE.Vector3, 
    angle: number
) {
    q.setFromAxisAngle(axis, angle);
    object.applyQuaternion(q);
    object.position.sub(point);
    object.position.applyQuaternion(q);
    object.position.add(point);
}

const perlin = new ImprovedNoise();
const perlinScale = 0.1;

export function getColorFromPosition(position: THREE.Vector3): THREE.Color {
    const color = new THREE.Color();
    const timeOffset = performance.now() * 0.0002;
    color.setHSL(perlin.noise(position.x * perlinScale, position.y * perlinScale, timeOffset), 1, 0.5);
    return color;
}

export const gridSize = 2;
export const worldBoundMin = gridSize;
export const worldBoundMax = 200;

export function clampOrthographicView(
	position: THREE.Vector3,
	zoom: number,
	viewWidth: number,
	viewHeight: number,
	minZoom: number,
	maxZoom: number,
) {
	const span = worldBoundMax - worldBoundMin;
	const zoomClamped = MathUtils.clamp(
		zoom,
		Math.max(minZoom, viewWidth / span, viewHeight / span),
		maxZoom,
	);
	const halfW = viewWidth / (2 * zoomClamped);
	const halfH = viewHeight / (2 * zoomClamped);

	position.x = MathUtils.clamp(position.x, worldBoundMin + halfW, worldBoundMax - halfW);
	position.y = MathUtils.clamp(position.y, worldBoundMin + halfH, worldBoundMax - halfH);

	return zoomClamped;
}

export function nearestGridPoint(v: THREE.Vector3, gridWidth: number = gridSize, gridHeight: number = gridSize): THREE.Vector3 {
    return new THREE.Vector3().set(gridWidth * Math.round(v.x / gridWidth), gridHeight * Math.round(v.y / gridHeight), v.z);
}

const epsilon = 0.1;
export function gridCellContainingPointContainsAnyNodes(point: THREE.Vector3, nodes: Array<GraphNode>) {
    const snapped = nearestGridPoint(point);

    const box = new THREE.Box3(
        new THREE.Vector3(
            snapped.x - gridSize / 2 - epsilon,
            snapped.y - gridSize / 2 - epsilon,
            snapped.z - gridSize / 2 - epsilon
        ),
        new THREE.Vector3(
            snapped.x + gridSize / 2 + epsilon,
            snapped.y + gridSize / 2 + epsilon,
            snapped.z + gridSize / 2 + epsilon
        )
    );

    return nodes.find(node => box.containsPoint(node.mesh!.position));
}

export type ParameterOption = [string, number];

export const parameterDebounceTime = 60;