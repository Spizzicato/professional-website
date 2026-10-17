import { useGraphStore } from "./graphStore";
import { RoomStatus as Status } from "./roomSync";

const statusLabels: Record<Status, string> = {
    offline: "offline, edits sync on reconnect",
    connecting: "connecting",
    connected: "connected",
};

const statusColors: Record<Status, string> = {
    offline: "bg-red-500",
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
};

export default function RoomStatus() {
    const roomId = useGraphStore(state => state.roomId);
    const connectionStatus = useGraphStore(state => state.connectionStatus);

    if (!roomId) return null;

    return (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-md bg-black/50 px-3 py-1.5 font-mono text-sm text-white pointer-events-none select-none">
            <span className={`h-2 w-2 rounded-full ${statusColors[connectionStatus]}`} />
            <span>{roomId}</span>
            <span className="opacity-60">{statusLabels[connectionStatus]}</span>
        </div>
    );
}
