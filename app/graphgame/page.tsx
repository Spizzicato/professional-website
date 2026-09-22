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
import GridBackground from "./gridBackground";



export default function Page() {
    return (
        <div className="relative w-full h-dvh overflow-hidden overscroll-none touch-none">
            <InputRecorder />
            <Canvas
                className="w-full h-full touch-none"
                orthographic={true}
                camera={{
                    position: [24, 16, 10],
                    zoom: 50,
                    near: 0.1,
                    far: 1000,
                }}
            >
                <CameraPan />
                <GridBackground />
                <Lighting />
                <GraphView />
            </Canvas>
            {/* <NodeMenu /> */}
        </div>
    );
}