import { delay, HttpResponse, http } from "msw";

/**
 * Configurable mock delays (in ms)
 */
const MOCK_DELAYS = {
	health: Number(import.meta.env["VITE_MOCK_DELAY_HEALTH"] ?? 150),
	example: Number(import.meta.env["VITE_MOCK_DELAY_EXAMPLE"] ?? 200),
};

/**
 * Base mock handlers
 */
export const handlers = [
	http.get("/api/health", async () => {
		await delay(MOCK_DELAYS.health);
		return HttpResponse.json({
			ok: true,
			service: "msw-mock",
			time: new Date().toISOString(),
		});
	}),
	http.get("/api/example", async () => {
		await delay(MOCK_DELAYS.example);
		const requestId = crypto.randomUUID();
		return HttpResponse.json({
			message: "Hello from MSW",
			requestId,
		});
	}),
];

/**
 * Error scenario handlers for testing
 */
export const errorHandlers = {
	healthServerError: http.get("/api/health", () => {
		return HttpResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}),
	exampleServiceUnavailable: http.get("/api/example", () => {
		return HttpResponse.json(
			{ error: "Service Unavailable" },
			{ status: 503 }
		);
	}),
	exampleTimeout: http.get("/api/example", async () => {
		await delay(30_000);
		return HttpResponse.json({ message: "Timeout" });
	}),
};
