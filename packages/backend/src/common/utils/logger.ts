import type { Logger } from "pino";
import pino from "pino";
import { config } from "./config";

/**
 * Creates a timestamp function that formats the current time in the specified timezone.
 * Returns ISO 8601 formatted string in the configured timezone.
 */
const createTimestamp = (timezone: string) => (): string => {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	const parts = formatter.formatToParts(now);
	const year = parts.find((p) => p.type === "year")?.value ?? "0000";
	const month = parts.find((p) => p.type === "month")?.value ?? "01";
	const day = parts.find((p) => p.type === "day")?.value ?? "01";
	const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
	const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
	const second = parts.find((p) => p.type === "second")?.value ?? "00";

	// Get milliseconds in the target timezone
	const ms = now.getMilliseconds().toString().padStart(3, "0");

	return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;
};

const timestamp = createTimestamp(config.LOG_TIMEZONE);

const createDevelopmentLogger = (): Logger => {
	// Dynamically require pino-pretty only in development to avoid production dependency
	const pinoPretty = (require as (id: string) => unknown)("pino-pretty") as (
		options: unknown
	) => NodeJS.ReadWriteStream;
	const prettyStream = pinoPretty({
		colorize: true,
		translateTime: "SYS:yyyy-mm-dd'T'HH:MM:ss.l",
		ignore: "pid,hostname",
		singleLine: false,
	});
	return pino(
		{
			name: "moodify-backend",
			formatters: {
				level: (label: string) => ({ level: label.toUpperCase() }),
			},
			level: "debug",
		},
		prettyStream
	);
};

export const logger: Logger =
	config.NODE_ENV === "production"
		? pino({
				name: "moodify-backend",
				timestamp,
				formatters: {
					level: (label: string) => ({ level: label.toUpperCase() }),
				},
				level: "info",
			})
		: createDevelopmentLogger();
