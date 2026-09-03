'use client';

import { useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from '@react-three/fiber';
import { GraphView } from "./graphView";
import InputRecorder from "./inputRecorder";

export default function Page() {
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <InputRecorder />
            <Canvas
                camera={{
                    position: [0, 0, 15],
                    fov: 75,
                    near: 0.1,
                    far: 500
                }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[0, 50, 100]} />
                <GraphView />
            </Canvas>
        </div>
    );
}