import { create } from "zustand";

type InputState = {
    keysDown: Set<string>;
    justPressed: Set<string>;
    keyDown: (key: string) => void;
    keyUp: (key: string) => void;
    isDown: (key: string) => boolean;
	isJustPressed: (key: string) => boolean;
    clearJustPressed: () => void;
};

export const useInputStore = create<InputState>((set, get) => ({
	keysDown: new Set<string>(),
	justPressed: new Set<string>(),

	keyDown: (key: string) =>
		set((state) => {
			if (state.keysDown.has(key)) return state;

			const keysDown = new Set(state.keysDown);
			const justPressed = new Set(state.justPressed);
			justPressed.add(key);
			keysDown.add(key);
			return { keysDown, justPressed };
		}),

	keyUp: (key: string) =>
		set((state) => {
			if (!state.keysDown.has(key)) return state;

			const keysDown = new Set(state.keysDown);
			keysDown.delete(key);
			return { keysDown };
		}),

	isDown: (key: string) => get().keysDown.has(key),

	isJustPressed: (key: string) => get().justPressed.has(key),

	clearJustPressed: () => set({ justPressed: new Set() }),
}));