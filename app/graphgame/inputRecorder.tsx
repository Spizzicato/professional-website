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
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			syncModifiers(e);
            keyUp(e.key);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("wheel", syncModifiers, true);
		window.addEventListener("pointerdown", syncModifiers, true);
		window.addEventListener("pointermove", syncModifiers, true);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("wheel", syncModifiers, true);
			window.removeEventListener("pointerdown", syncModifiers, true);
			window.removeEventListener("pointermove", syncModifiers, true);
		};
	}, [keyDown, keyUp]);

	return null;
}
