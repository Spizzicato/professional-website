'use client';

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Canvas } from '@react-three/fiber';
import { GraphView } from "./graphView";
import InputRecorder from "./inputRecorder";
import Lighting from "./lighting";
import { useGraphStore } from "./graphStore";
import CameraPan from "./cameraPan";
import GridBackground from "./gridBackground";
import RoomStatus from "./roomStatus";

const createRoomId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 8);

const normalizeRoomId = (value: string | null) => {
    if (!value) return undefined;
    const room = value.trim();
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(room)) return undefined;
    return room;
}

function GraphGame() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const roomId = useGraphStore(state => state.roomId);
    const requestedRoom = normalizeRoomId(searchParams.get("room"));

    // redirects user to requested room or random room if no room was requested
    useEffect(() => {
        if (!requestedRoom) {
            router.replace(`${pathname}?room=${createRoomId()}`);
            return;
        }

        useGraphStore.getState().enterRoom(requestedRoom);

        return () => useGraphStore.getState().leaveRoom();
    }, [requestedRoom, router, pathname]);

    return (
        <div className="relative w-full h-dvh overflow-hidden overscroll-none touch-none">
            <InputRecorder />
            <RoomStatus />
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
                {roomId ? <GraphView key={roomId} /> : null}
            </Canvas>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <GraphGame />
        </Suspense>
    );
}
