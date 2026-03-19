/**
 * Application configuration management
 * Centralized configuration for environment variables and app settings
 */

export interface AppConfig {
  apiUrl: string;
  debug: boolean;
  enableMocking: boolean;
  cache: {
    staleTime: number;
    gcTime: number;
  };
  api: {
    timeout: number;
  };
}

/**
 * Environment variable validation and defaults
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value ?? defaultValue!;
};

/**
 * Application configuration factory
 */
export function createConfig(): AppConfig {
  return {
    apiUrl: getEnvVar("VITE_API_URL", "/api"),
    debug: import.meta.env.DEV,
    enableMocking: import.meta.env["VITE_ENABLE_MOCKING"] === "true" || import.meta.env.DEV,
    cache: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    api: {
      timeout: Number(getEnvVar("VITE_API_TIMEOUT", "10000")),
    },
  };
}

/**
 * Global application configuration instance
 */
export const config = createConfig();

/**
 * Type-safe environment variable access
 */
export const env = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === "test",
} as const;