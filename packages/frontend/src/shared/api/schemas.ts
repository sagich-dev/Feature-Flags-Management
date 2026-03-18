import { z } from "zod";

export const healthResponseSchema = z.object({
	ok: z.literal(true),
	service: z.string().min(1),
	time: z.string().min(1),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const exampleResponseSchema = z.object({
	message: z.string().min(1),
	requestId: z.string().min(1),
});
export type ExampleResponse = z.infer<typeof exampleResponseSchema>;
