import axios from "axios";

export class ApiError extends Error {
	status: number | undefined;
	code: string | undefined;

	constructor(message: string, opts?: { status?: number; code?: string; cause?: unknown }) {
		super(message);
		this.name = "ApiError";
		this.status = opts?.status;
		this.code = opts?.code;
		if (opts?.cause) {
			(this as unknown as { cause?: unknown }).cause = opts.cause;
		}
	}
}

export function isApiError(value: unknown): value is ApiError {
	return value instanceof ApiError;
}

export const http = axios.create({
	baseURL: "/api",
	timeout: 10_000,
	headers: {
		Accept: "application/json",
	},
});

http.interceptors.response.use(
	(res) => res,
	(error: unknown) => {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const message =
				typeof error.response?.data === "object" && error.response?.data && "message" in error.response.data
					? String((error.response.data as { message?: unknown }).message ?? "Request failed")
					: error.message || "Request failed";
			throw new ApiError(message, {
				...(status === undefined ? {} : { status }),
				...(error.code === undefined ? {} : { code: error.code }),
				cause: error,
			});
		}
		throw new ApiError("Request failed", { cause: error });
	}
);
