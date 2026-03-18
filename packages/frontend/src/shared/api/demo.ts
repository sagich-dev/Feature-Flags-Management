import { http } from "@/shared/api/http";
import { exampleResponseSchema, healthResponseSchema } from "@/shared/api/schemas";

export async function getHealth() {
	const res = await http.get("/health");
	return healthResponseSchema.parse(res.data);
}

export async function getDemo() {
	const res = await http.get("/example");
	return exampleResponseSchema.parse(res.data);
}
