import { create } from "zustand";

type InputState = {
    keysDown: Set<string>;
    justPressed: Set<string>;
    keyDown: (key: string) => void;
    keyUp: (key: string) => void;
    clearJustPressed: () => void;
};

export const useInputStore = create<InputState>((set) => ({
	keysDown: new Set<string>(),
	justPressed: new Set<string>(),

	keyDown: (key: string) =>
		set((state) => {
			const keysDown = new Set(state.keysDown);
			const justPressed = new Set(state.justPressed);
			if (!keysDown.has(key)) {
				justPressed.add(key);
			}
			keysDown.add(key);
			return { keysDown, justPressed };
		}),

	keyUp: (key: string) =>
		set((state) => {
			const keysDown = new Set(state.keysDown);
			keysDown.delete(key);
			return { keysDown };
		}),

	clearJustPressed: () =>
		set({ justPressed: new Set() }),
}));