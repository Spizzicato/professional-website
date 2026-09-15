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

                // onWheel={(event) => {
                //     if (event.deltaY < 0) {
                //         for (const walker of useGraphStore.getState().walkers) {
                //             walker.walkSpeed += 4;
                //             walker.walkSpeed = Math.min(241, walker.walkSpeed);
                //         }
                //     }
                //     else if (event.deltaY > 0) {
                //         for (const walker of useGraphStore.getState().walkers) {
                //             walker.walkSpeed -= 4;
                //             walker.walkSpeed = Math.max(1, walker.walkSpeed); 
                //         }
                //     }
                // }}
            >
                <CameraPan />
                <Lighting />
                <GraphView />
            </Canvas>
            <NodeMenu />
        </div>
    );
}