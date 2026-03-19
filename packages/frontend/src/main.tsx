import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import "@/app/style.css";

async function start() {
	const rootElement = document.getElementById("root");
	if (!rootElement) {
		throw new Error("Root element not found");
	}

	if (import.meta.env.DEV) {
		const { worker } = await import("@/mocks/browser");
		await worker.start({
			onUnhandledRequest: "warn",
		});
	}

	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}

start().catch((error) => {
	console.error("Failed to start application:", error);
});
