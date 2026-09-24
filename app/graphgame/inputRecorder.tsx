import { useEffect } from "react";
import { useInputStore } from "./inputStore";

function syncModifiers(e: { ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean }) {
	const { keyDown, keyUp } = useInputStore.getState();
	const sync = (pressed: boolean, key: string) => (pressed ? keyDown : keyUp)(key);
	sync(e.ctrlKey, "Control");
	sync(e.shiftKey, "Shift");
	sync(e.altKey, "Alt");
	sync(e.metaKey, "Meta");
}

export default function InputRecorder() {
	const keyDown = useInputStore((state) => state.keyDown);
    const keyUp = useInputStore((state) => state.keyUp);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			syncModifiers(e);
            keyDown(e.key);

			if (e.key === " " || e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
			}

			if (e.ctrlKey || e.metaKey) {
				if (
					e.key === "+" || e.key === "-" || e.key === "=" || e.key === "_" || e.key === "0" ||
					e.code === "NumpadAdd" || e.code === "NumpadSubtract" || e.code === "NumpadZero"
				) {
					e.preventDefault();
				}
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			syncModifiers(e);
            keyUp(e.key);
		};

		const handleWheel = (e: WheelEvent) => {
			syncModifiers(e);
			e.preventDefault();
		};

		const handleGesture = (e: Event) => {
			e.preventDefault();
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("wheel", handleWheel, { capture: true, passive: false });
		window.addEventListener("pointerdown", syncModifiers, true);
		window.addEventListener("pointermove", syncModifiers, true);
		window.addEventListener("gesturestart", handleGesture, { capture: true, passive: false });
		window.addEventListener("gesturechange", handleGesture, { capture: true, passive: false });

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("wheel", handleWheel, true);
			window.removeEventListener("pointerdown", syncModifiers, true);
			window.removeEventListener("pointermove", syncModifiers, true);
			window.removeEventListener("gesturestart", handleGesture, true);
			window.removeEventListener("gesturechange", handleGesture, true);
		};
	}, [keyDown, keyUp]);

	return null;
}
