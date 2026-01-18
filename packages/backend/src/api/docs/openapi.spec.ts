import type { OpenAPIV3 } from "openapi-types";
import { config } from "@/common/utils/config";
import { APP_VERSION } from "@/common/utils/version";

export const openApiSpec: OpenAPIV3.Document = {
	openapi: "3.0.0",
	info: {
		title: "Moodify API",
		version: APP_VERSION,
		description: "Moodify Backend API.",
		contact: {
			name: "API Support",
		},
	},
	servers: [
		{
			url: `${config.NODE_ENV === "production" ? "https" : "http"}://${config.HOST}:${config.PORT}`,
			description: config.NODE_ENV === "production" ? "Production server" : "Development server",
		},
	],
	tags: [
		{
			name: "Health",
			description: "Health check endpoints",
		},
		{
			name: "Chaos",
			description: "Chaos vulnerability assessment endpoints",
		},
		{
			name: "Documentation",
			description: "API documentation endpoints",
		},
	],
	paths: {
		"/api/health/liveness": {
			get: {
				operationId: "getHealthLiveness",
				tags: ["Health"],
				summary: "Liveness probe",
				description: "Checks if the service is running.",
				responses: {
					"200": {
						$ref: "#/components/responses/HealthSuccess",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
					"500": {
						$ref: "#/components/responses/HealthInternalServerError",
					},
				},
			},
		},
		"/api/health/readiness": {
			get: {
				operationId: "getHealthReadiness",
				tags: ["Health"],
				summary: "Readiness probe",
				description: "Checks if the service is ready to handle traffic.",
				responses: {
					"200": {
						$ref: "#/components/responses/HealthSuccess",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
					"503": {
						$ref: "#/components/responses/HealthServiceUnavailable",
					},
				},
			},
		},
		"/api/docs": {
			get: {
				operationId: "getApiDocs",
				tags: ["Documentation"],
				summary: "API Documentation",
				description: "Returns the interactive API documentation page.",
				responses: {
					"200": {
						description: "HTML documentation page",
						content: {
							"text/html": {
								schema: {
									type: "string",
								},
							},
						},
					},
					"404": {
						$ref: "#/components/responses/NotFoundResponse",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
				},
			},
		},
		"/api/docs/json": {
			get: {
				operationId: "getApiDocsJson",
				tags: ["Documentation"],
				summary: "OpenAPI Specification",
				description: "Returns the OpenAPI 3.0 specification in JSON format.",
				responses: {
					"200": {
						description: "OpenAPI specification document",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/OpenAPISpec",
								},
								example: {
									openapi: "3.0.0",
									info: {
										title: "Moodify API",
										version: "1.0.0",
									},
								},
							},
						},
					},
					"404": {
						$ref: "#/components/responses/NotFoundResponse",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
				},
			},
		},
		"/api/docs/standalone.js": {
			get: {
				operationId: "getApiDocsStandalone",
				tags: ["Documentation"],
				summary: "Scalar Standalone JavaScript",
				description: "Returns the Scalar API reference standalone JavaScript bundle.",
				responses: {
					"200": {
						description: "JavaScript bundle file",
						content: {
							"application/javascript": {
								schema: {
									type: "string",
								},
							},
						},
					},
					"404": {
						$ref: "#/components/responses/NotFoundResponse",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
				},
			},
		},
		"/api/chaos/vulnerabilities": {
			get: {
				operationId: "getChaosVulnerabilities",
				tags: ["Chaos"],
				summary: "Get all vulnerabilities",
				description: "Returns all CVE vulnerabilities detected by Chaos scans.",
				responses: {
					"200": {
						$ref: "#/components/responses/ChaosVulnerabilitiesSuccess",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
					"502": {
						$ref: "#/components/responses/ChaosBadGateway",
					},
				},
			},
		},
		"/api/chaos/vulnerabilities/by-ip": {
			get: {
				operationId: "getChaosVulnerabilitiesByIp",
				tags: ["Chaos"],
				summary: "Get vulnerabilities grouped by IP",
				description: "Returns a list of IP addresses and the CVE vulnerabilities found on each machine.",
				responses: {
					"200": {
						$ref: "#/components/responses/ChaosVulnerabilitiesByIpSuccess",
					},
					"429": {
						$ref: "#/components/responses/RateLimitResponse",
					},
					"502": {
						$ref: "#/components/responses/ChaosBadGateway",
					},
				},
			},
		},
	},
	components: {
		parameters: {
			RequestIdHeader: {
				name: "X-Request-ID",
				in: "header",
				description: "Unique request identifier for tracking and correlation",
				required: false,
				schema: {
					type: "string",
					format: "uuid",
				},
			},
		},
		responses: {
			ErrorResponse: {
				description: "Standard error response",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ErrorResponse",
						},
						example: {
							success: false,
							message: "An error occurred",
							statusCode: 400,
							errorId: "550e8400-e29b-41d4-a716-446655440000",
						},
					},
				},
			},
			ValidationErrorResponse: {
				description: "Validation error - Request validation failed",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ValidationErrorResponse",
						},
						example: {
							success: false,
							message: "Validation failed",
							statusCode: 400,
							errorId: "550e8400-e29b-41d4-a716-446655440000",
							errors: [
								{
									path: "email",
									message: "Invalid email format",
								},
							],
						},
					},
				},
			},
			NotFoundResponse: {
				description: "Resource not found - Route or resource does not exist",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ErrorResponse",
						},
						example: {
							success: false,
							message: "Route GET /api/invalid not found",
							statusCode: 404,
						},
					},
				},
			},
			RateLimitResponse: {
				description: "Rate limit exceeded - Too many requests from this IP address",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ErrorResponse",
						},
						example: {
							success: false,
							message: "Too many requests from this IP, please try again later.",
							statusCode: 429,
							errorId: "550e8400-e29b-41d4-a716-446655440000",
						},
					},
				},
				headers: {
					"Retry-After": {
						schema: {
							type: "integer",
							description: "Number of seconds to wait before retrying",
						},
					},
				},
			},
			InternalServerErrorResponse: {
				description: "Internal server error - An unexpected error occurred",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ErrorResponse",
						},
						example: {
							success: false,
							message: "Internal server error",
							statusCode: 500,
							errorId: "550e8400-e29b-41d4-a716-446655440000",
						},
					},
				},
			},
			HealthSuccess: {
				description: "Service is healthy",
				headers: {
					"X-Request-ID": {
						schema: {
							type: "string",
							format: "uuid",
						},
						description: "Unique request identifier for request tracking",
					},
					"Cache-Control": {
						schema: {
							type: "string",
						},
						description: "Cache control header - health endpoints use no-cache",
					},
				},
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/HealthResponse",
						},
						example: {
							success: true,
							message: "Service is healthy",
							data: {
								status: "healthy",
								timestamp: "2024-01-01T00:00:00.000Z",
								uptime: 3600,
								environment: "production",
								version: "v20.6.0",
							},
							statusCode: 200,
						},
					},
				},
			},
			HealthServiceUnavailable: {
				description: "Service is unavailable or shutting down",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/HealthResponse",
						},
						example: {
							success: true,
							message: "Service is shutting_down",
							data: {
								status: "shutting_down",
								timestamp: "2024-01-01T00:00:00.000Z",
								uptime: 3600,
								environment: "production",
								version: "v20.6.0",
								cpu: {
									loadavg: [0.1, 0.2, 0.3],
									usage: {
										user: 1000000,
										system: 500000,
									},
								},
								memory: {
									free: 1024000000,
									total: 2048000000,
									usage: {
										rss: 50000000,
										heapTotal: 30000000,
										heapUsed: 20000000,
										external: 1000000,
										arrayBuffers: 500000,
									},
								},
							},
							statusCode: 503,
						},
					},
				},
			},
			HealthInternalServerError: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/HealthResponse",
						},
						example: {
							success: true,
							message: "Service is shutting_down",
							data: {
								status: "shutting_down",
								timestamp: "2024-01-01T00:00:00.000Z",
								uptime: 3600,
								environment: "production",
								version: "v20.6.0",
							},
							statusCode: 500,
						},
					},
				},
			},
			ChaosVulnerabilitiesSuccess: {
				description: "Successfully retrieved vulnerabilities from Chaos",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								success: { type: "boolean", example: true },
								message: { type: "string", example: "Vulnerabilities retrieved successfully" },
								data: {
									type: "array",
									items: { $ref: "#/components/schemas/ChaosVulnerability" },
								},
								statusCode: { type: "number", example: 200 },
							},
						},
						example: {
							success: true,
							message: "Vulnerabilities retrieved successfully",
							data: [
								{ endpoint_id: "23-49-72-1", CVE: "CVE-2023-1234" },
								{ endpoint_id: "23-49-83-1", CVE: "CVE-2023-5678" },
							],
							statusCode: 200,
						},
					},
				},
			},
			ChaosVulnerabilitiesByIpSuccess: {
				description: "Successfully retrieved vulnerabilities grouped by IP",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								success: { type: "boolean", example: true },
								message: { type: "string", example: "Vulnerabilities by IP retrieved successfully" },
								data: {
									type: "array",
									items: { $ref: "#/components/schemas/VulnerabilityByIp" },
								},
								statusCode: { type: "number", example: 200 },
							},
						},
						example: {
							success: true,
							message: "Vulnerabilities by IP retrieved successfully",
							data: [
								{
									ip: "192.168.4.5",
									vulnerabilities: ["CVE-2023-1234", "CVE-2023-5678"],
								},
								{
									ip: "192.168.4.7",
									vulnerabilities: ["CVE-2023-9012"],
								},
							],
							statusCode: 200,
						},
					},
				},
			},
			ChaosBadGateway: {
				description: "Failed to communicate with Chaos API",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ErrorResponse",
						},
						example: {
							success: false,
							message: "Failed to fetch vulnerabilities from Chaos API",
							statusCode: 502,
							errorId: "550e8400-e29b-41d4-a716-446655440000",
						},
					},
				},
			},
		},
		schemas: {
			ErrorResponse: {
				type: "object",
				description: "Standard error response format",
				properties: {
					success: {
						type: "boolean",
						example: false,
					},
					message: {
						type: "string",
						description: "Human-readable error message",
						example: "An error occurred",
					},
					statusCode: {
						type: "number",
						description: "HTTP status code",
						example: 400,
					},
					errorId: {
						type: "string",
						format: "uuid",
						description:
							"Unique error identifier for tracking and debugging. Not included in 404 responses from route not found handler.",
						example: "550e8400-e29b-41d4-a716-446655440000",
					},
				},
				required: ["success", "message", "statusCode"],
			},
			ValidationErrorResponse: {
				allOf: [
					{
						$ref: "#/components/schemas/ErrorResponse",
					},
					{
						type: "object",
						properties: {
							errors: {
								type: "array",
								description: "Array of validation errors",
								items: {
									type: "object",
									properties: {
										path: {
											type: "string",
											description: "Path to the field that failed validation",
											example: "email",
										},
										message: {
											type: "string",
											description: "Validation error message",
											example: "Invalid email format",
										},
									},
									required: ["path", "message"],
								},
								example: [
									{
										path: "email",
										message: "Invalid email format",
									},
								],
							},
						},
						required: ["errors"],
					},
				],
			},
			SuccessResponse: {
				type: "object",
				description: "Standard success response wrapper",
				properties: {
					success: {
						type: "boolean",
						example: true,
					},
					message: {
						type: "string",
						description: "Human-readable success message",
						example: "Operation completed successfully",
					},
					data: {
						description: "Response data (structure varies by endpoint)",
						example: {},
					},
					statusCode: {
						type: "number",
						description: "HTTP status code",
						example: 200,
					},
				},
				required: ["success", "message", "data", "statusCode"],
			},
			HealthResponse: {
				type: "object",
				properties: {
					success: {
						type: "boolean",
						example: true,
					},
					message: {
						type: "string",
						example: "Service is healthy",
					},
					data: {
						type: "object",
						properties: {
							status: {
								type: "string",
								enum: ["healthy", "shutting_down"],
								example: "healthy",
							},
							timestamp: {
								type: "string",
								format: "date-time",
								example: "2024-01-01T00:00:00.000Z",
							},
							uptime: {
								type: "number",
								description: "Uptime in seconds",
								example: 3600,
							},
							environment: {
								type: "string",
								example: "production",
							},
							version: {
								type: "string",
								example: "1.0.0",
							},
							cpu: {
								type: "object",
								properties: {
									loadavg: {
										type: "array",
										items: { type: "number" },
										example: [0.1, 0.2, 0.3],
									},
									usage: {
										type: "object",
										properties: {
											user: { type: "number" },
											system: { type: "number" },
										},
									},
								},
							},
							memory: {
								type: "object",
								properties: {
									free: { type: "number" },
									total: { type: "number" },
									usage: {
										type: "object",
										properties: {
											rss: { type: "number" },
											heapTotal: { type: "number" },
											heapUsed: { type: "number" },
											external: { type: "number" },
											arrayBuffers: { type: "number" },
										},
									},
								},
							},
						},
						required: ["status", "timestamp", "uptime", "environment"],
					},
					statusCode: {
						type: "number",
						example: 200,
					},
				},
				required: ["success", "message", "data", "statusCode"],
			},
			OpenAPISpec: {
				type: "object",
				description: "OpenAPI 3.0 specification document",
				properties: {
					openapi: {
						type: "string",
						example: "3.0.0",
					},
					info: {
						type: "object",
					},
					servers: {
						type: "array",
						items: {
							type: "object",
						},
					},
					paths: {
						type: "object",
					},
					components: {
						type: "object",
					},
				},
				required: ["openapi", "info", "paths"],
			},
			ChaosVulnerability: {
				type: "object",
				description: "Vulnerability detected by Chaos scanner",
				properties: {
					endpoint_id: {
						type: "string",
						description: "Identifier of the scanned endpoint",
						example: "23-49-72-1",
					},
					CVE: {
						type: "string",
						description: "Common Vulnerabilities and Exposures identifier",
						example: "CVE-2023-1234",
					},
				},
				required: ["endpoint_id", "CVE"],
			},
			VulnerabilityByIp: {
				type: "object",
				description: "Vulnerabilities grouped by IP address",
				properties: {
					ip: {
						type: "string",
						description: "IP address of the scanned machine",
						example: "192.168.4.5",
					},
					vulnerabilities: {
						type: "array",
						description: "List of CVE identifiers found on this IP",
						items: {
							type: "string",
						},
						example: ["CVE-2023-1234", "CVE-2023-5678"],
					},
				},
				required: ["ip", "vulnerabilities"],
			},
		},
	},
};
