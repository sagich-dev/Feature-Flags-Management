declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV?: string;
			APP_VERSION?: string;
		}
	}
}
