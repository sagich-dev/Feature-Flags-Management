import os from "node:os";

export interface HealthStatus {
	readonly status: "healthy" | "shutting_down";
	readonly timestamp: string;
	readonly uptime: number;
	readonly environment: string;
	readonly version: string;
	readonly cpu?: {
		readonly loadavg: readonly number[];
		readonly usage: NodeJS.CpuUsage;
	};
	readonly memory?: {
		readonly free: number;
		readonly total: number;
		readonly usage: NodeJS.MemoryUsage;
	};
}

const getBaseHealthStatus = (isShuttingDown: boolean, environment: string): Omit<HealthStatus, "cpu" | "memory"> => {
	return {
		status: isShuttingDown ? "shutting_down" : "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment,
		version: process.version,
	};
};

export const getLivenessStatus = (isShuttingDown: boolean, environment: string): HealthStatus => {
	return {
		status: isShuttingDown ? "shutting_down" : "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment,
		version: process.version,
	};
};

export const getReadinessStatus = (isShuttingDown: boolean, environment: string): HealthStatus => {
	return {
		...getBaseHealthStatus(isShuttingDown, environment),
		cpu: {
			loadavg: os.loadavg(),
			usage: process.cpuUsage(),
		},
		memory: {
			free: os.freemem(),
			total: os.totalmem(),
			usage: process.memoryUsage(),
		},
	};
};
