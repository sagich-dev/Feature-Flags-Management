import { http } from "@/shared/api/http";
import type { ExampleResponse, HealthResponse } from "@/shared/api/schemas";
import { exampleResponseSchema, healthResponseSchema } from "@/shared/api/schemas";

export async function getHealth(): Promise<HealthResponse> {
	const res = await http.get("/health");
	return healthResponseSchema.parse(res.data);
}

export async function getDemo(): Promise<ExampleResponse> {
	const res = await http.get("/example");
	return exampleResponseSchema.parse(res.data);
}
