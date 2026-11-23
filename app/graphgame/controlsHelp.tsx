import { useState } from "react";

const controls: [string, string][] = [
    ["drag empty space", "pan the camera"],
    ["scroll", "zoom"],
    ["drag a node", "move it"],
    ["space on empty space", "place a node (connects it if an edge is started)"],
    ["space on a node", "start an edge, then space on another node to finish it"],
    ["delete", "remove the hovered node"],
    ["escape", "deselect"],
    ["ctrl + scroll on a node", "change its note"],
    ["enter", "pause or resume walkers"],
    ["up / down", "speed walkers up or down"],
];

export default function ControlsHelp() {
    const [open, setOpen] = useState(false);

    if (!open) {
        return (
            <button
                type="button"
                data-game-ui
                aria-label="show controls"
                aria-expanded={false}
                onClick={() => setOpen(true)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 font-mono text-sm text-white select-none hover:bg-black/70"
            >
                ?
            </button>
        );
    }

    return (
        <div
            data-game-ui
            role="dialog"
            aria-label="controls"
            onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
            }}
            className="absolute top-3 right-3 z-10 flex max-h-[calc(100%-1.5rem)] w-80 max-w-[calc(100%-1.5rem)] flex-col rounded-md bg-black/50 font-mono text-sm text-white select-none"
        >
            <div className="flex items-center justify-between px-3 py-1.5">
                <span>controls</span>
                <button
                    type="button"
                    aria-label="close controls"
                    onClick={() => setOpen(false)}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
                >
                    ×
                </button>
            </div>
            <dl className="overflow-y-auto overscroll-contain touch-pan-y px-3 pb-3">
                {controls.map(([input, action]) => (
                    <div key={input} className="py-1">
                        <dt>{input}</dt>
                        <dd className="opacity-60">{action}</dd>
                    </div>
                ))}
                <div className="pt-2 opacity-60">share this page&apos;s url to invite others into the room</div>
            </dl>
        </div>
    );
}
