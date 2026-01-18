import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	HOST: z.string().min(1).default("localhost"),
	PORT: z.coerce.number().int().positive().default(8080),
	CORS_ORIGIN: z
		.string()
		.default("http://localhost:5173")
		.transform((value) => value.split(",").map((s) => s.trim())),
	TRUST_PROXY: z
		.string()
		.default("0")
		.transform((value) => {
			if (value === "true") return true;
			if (value === "false") return false;
			const num = Number.parseInt(value, 10);
			return Number.isNaN(num) ? false : num;
		}),
	LOG_TIMEZONE: z.string().default("Asia/Jerusalem"),
	SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
});

export type Config = z.infer<typeof envSchema>;

export const parseConfig = (env: NodeJS.ProcessEnv): Config => {
	const parsed = envSchema.safeParse(env);
	if (!parsed.success) {
		throw new Error(`Invalid environment variables: ${JSON.stringify(parsed.error.format())}`);
	}
	return parsed.data;
};

export const config = parseConfig(process.env);
