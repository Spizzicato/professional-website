import { useEffect } from "react";
import { useInputStore } from "./inputStore";

export default function InputRecorder() {
	const keyDown = useInputStore((state) => state.keyDown);
    const keyUp = useInputStore((state) => state.keyUp);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
            keyDown(e.key);
		};

		const handleKeyUp = (e: KeyboardEvent) => {
            keyUp(e.key);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [keyDown, keyUp]);

	return null;
}