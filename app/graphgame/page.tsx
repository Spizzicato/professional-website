'use client';

import { useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from '@react-three/fiber';
import { GraphView } from "./graphView";
import InputRecorder from "./inputRecorder";
import Lighting from "./lighting";
import { useGraphStore } from "./graphStore";
import NodeMenu from "./nodeMenu";
import CameraPan from "./cameraPan";



export default function Page() {
    return (
        <div className="relative w-full h-dvh">
            <InputRecorder />
            <Canvas
                className="w-full h-full"
                orthographic={true}
                camera={{
                    position: [0, 0, 10],
                    zoom: 50,
                    near: 0.1,
                    far: 1000,
                }}
            >
                <CameraPan />
                <Lighting />
                <GraphView />
            </Canvas>
            {/* <NodeMenu /> */}
        </div>
    );
}