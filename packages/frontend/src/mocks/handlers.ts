import { delay, HttpResponse, http } from "msw";

export const handlers = [
	http.get("/api/health", async () => {
		await delay(150);
		return HttpResponse.json({
			ok: true,
			service: "msw-mock",
			time: new Date().toISOString(),
		});
	}),
	http.get("/api/example", async () => {
		await delay(200);
		const requestId = crypto.randomUUID();
		return HttpResponse.json({
			message: "Hello from MSW",
			requestId,
		});
	}),
];
