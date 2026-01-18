import { useEffect } from "react";

interface KeyboardShortcut {
	key: string;
	ctrlKey?: boolean;
	metaKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	handler: (event: KeyboardEvent) => void;
	description?: string;
}

/**
 * Custom hook to handle keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcut definitions
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			for (const shortcut of shortcuts) {
				const { key, ctrlKey = false, metaKey = false, shiftKey = false, altKey = false, handler } = shortcut;

				const isCtrlOrCmd = ctrlKey || metaKey;
				const isCtrlPressed = event.ctrlKey || event.metaKey;

				if (
					event.key.toLowerCase() === key.toLowerCase() &&
					isCtrlPressed === isCtrlOrCmd &&
					event.shiftKey === shiftKey &&
					event.altKey === altKey
				) {
					// Prevent default browser behavior for shortcuts
					if (isCtrlPressed || metaKey) {
						event.preventDefault();
					}
					handler(event);
					break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [shortcuts, enabled]);
}
