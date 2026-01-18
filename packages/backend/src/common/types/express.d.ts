import "express";

declare module "express-serve-static-core" {
	interface Request {
		id?: string;
	}
}

declare module "http" {
	interface IncomingMessage {
		id?: string;
	}
}
