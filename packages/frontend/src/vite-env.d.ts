/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_API_TIMEOUT: string;
	readonly VITE_ENABLE_MOCKING: string;
	readonly VITE_HOST: string;
	readonly VITE_MOCK_DELAY_HEALTH: string;
	readonly VITE_MOCK_DELAY_EXAMPLE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
