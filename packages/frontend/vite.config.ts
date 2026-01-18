import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react(), svgr()],
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext",
		},
		force: false,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
					query: ["@tanstack/react-query"],
					mui: ["@mui/material", "@mui/icons-material"],
				},
				entryFileNames: "assets/[name]-[hash].js",
				chunkFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
			},
		},
		chunkSizeWarningLimit: 1200,
		minify: "esbuild",
		esbuildOptions: {
			drop: mode === "production" ? ["console", "debugger"] : [],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	server: {
		host: "0.0.0.0",
		port: 5173,
		strictPort: true,
		proxy: {
			"/api": {
				target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8080",
				changeOrigin: true,
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		include: ["**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/dist/**"],
		},
	},
}));
