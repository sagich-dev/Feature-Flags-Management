import { http } from "@/shared/api/http";
import { exampleResponseSchema, healthResponseSchema } from "@/shared/api/schemas";

export interface HealthResponse {
	ok: boolean;
	service: string;
	time: string;
}

export interface ExampleResponse {
	message: string;
	requestId: string;
}

export async function getHealth(): Promise<HealthResponse> {
	const res = await http.get("/health");
	return healthResponseSchema.parse(res.data);
}

export async function getDemo(): Promise<ExampleResponse> {
	const res = await http.get("/example");
	return exampleResponseSchema.parse(res.data);
}
