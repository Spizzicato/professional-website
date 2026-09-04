import * as THREE from 'three';
import { MathUtils } from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

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