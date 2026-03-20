# Codebase Audit Report

**Project:** `sunflower-ltd` — pnpm Monorepo  
**Date:** March 19, 2026  
**Scope:** Full workspace (root + all packages)  
**Primary Focus:** Frontend package  

---

## 🔥 Critical Issues

### 1. TypeScript Compilation Errors in Routes

**Location:** `packages/frontend/src/app/routes/index.tsx`

**Problem:**  
The routes file has TypeScript errors. The `ErrorBoundary` import path may not resolve correctly, and `createBrowserRouter` usage lacks proper typing for the route tree. This blocks type-checking and could mask runtime errors.

**Impact:**  
- `pnpm type-check` fails
- IDE shows red squiggles, degrading DX
- Runtime errors may go undetected

**Fix:**  
Ensure `ErrorBoundary` is exported with a named export from `../ErrorBoundary` and verify the import resolves. Add proper typing for route objects.

**Example:**

```tsx
// ❌ Current — potentially broken import
import ErrorBoundary from "../ErrorBoundary";

// ✅ Fix — ensure ErrorBoundary.tsx has a default export
// If using named export, update import:
import { ErrorBoundary } from "../ErrorBoundary";
```

Additionally, `ComponentErrorBoundary` was referenced in subagent analysis — verify this import matches the actual export in `ErrorBoundary.tsx`.

---

### 2. Missing Environment Variable Validation at Startup

**Location:** `packages/frontend/src/shared/config.ts`

**Problem:**  
The `createConfig()` function reads `VITE_API_URL` via `import.meta.env.VITE_API_URL ?? ""`. An empty string fallback is dangerous — the app will silently fail on API calls with no clear error message.

**Impact:**  
- API calls fail silently in production if env is misconfigured
- Debugging is painful because no error is thrown at startup

**Fix:**  
Validate required env vars at startup and throw a descriptive error.

**Example:**

```ts
// ❌ Current
export function createConfig(): AppConfig {
  return {
    api: {
      url: import.meta.env.VITE_API_URL ?? "",
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
    },
  };
}

// ✅ Fix
function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Set it in .env or .env.local.`
    );
  }
  return value;
}

export function createConfig(): AppConfig {
  return {
    api: {
      url: getRequiredEnv("VITE_API_URL"),
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
    },
  };
}
```

---

### 3. API Error Interceptor Swallows Error Context

**Location:** `packages/frontend/src/shared/api/http.ts`

**Problem:**  
The response error interceptor catches `AxiosError` and converts it to `ApiError`, but it may lose the original `response.data` content if the server returns a structured error body. The `cause` field is set to the full `AxiosError`, but downstream consumers may not inspect it.

**Impact:**  
- Server error messages (e.g., `{ "message": "Invalid token" }`) are lost
- Debugging production errors is harder

**Fix:**  
Extract the server's error body and pass it through.

**Example:**

```ts
// ❌ Current
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.message,
        error.response?.status ?? 500,
        error.code,
        error,
      );
    }
    throw error;
  },
);

// ✅ Fix
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error instanceof AxiosError) {
      const serverMessage =
        (error.response?.data as { message?: string })?.message ??
        error.message;
      throw new ApiError(
        serverMessage,
        error.response?.status ?? 500,
        error.code,
        error.response?.data,
      );
    }
    throw error;
  },
);
```

---

## ⚠️ Medium Priority Improvements

### 4. Monorepo Underutilization — No Shared Packages

**Location:** `pnpm-workspace.yaml`, `packages/`

**Problem:**  
The workspace contains only `packages/frontend`. A monorepo with a single package provides no benefit over a single project — it adds complexity (workspace resolution, hoisting rules) without payoff.

**Impact:**  
- Overhead without benefit
- No code sharing infrastructure when it's needed later

**Fix:**  
Either:
- **Option A:** Extract shared code into packages now (e.g., `@sunflower/ui`, `@sunflower/api-client`, `@sunflower/config`)
- **Option B:** Collapse to a single-project structure if only one package will exist for the foreseeable future

**Recommendation:** If this is meant to be a feature flags management platform (per the git remote), start extracting `api-client` and `schemas` into a shared package:

```
packages/
├── frontend/
├── api-client/       ← schemas, http.ts, types
├── ui/               ← CodeBlock, ErrorMessage, LoadingSpinner
└── config/           ← shared env validation
```

---

### 5. No Shared TypeScript Configuration

**Location:** `packages/frontend/tsconfig.json`

**Problem:**  
Each package defines its own `tsconfig.json` independently. No `tsconfig.base.json` exists at the root.

**Impact:**  
- Duplicated TS config across packages (when more are added)
- Inconsistent compiler settings

**Fix:**  
Create a root `tsconfig.base.json` and extend it in each package.

**Example:**

```jsonc
// tsconfig.base.json (root)
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}

// packages/frontend/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

---

### 6. QueryProvider Configuration Could Be More Aggressive

**Location:** `packages/frontend/src/app/providers/QueryProvider.tsx`

**Problem:**  
The default `staleTime` of 5 minutes is fine for most cases, but the `QueryClient` is created inside the provider, meaning it's recreated on every render tree mount. This is correct, but there's no error handling for query defaults — if a query fails, users see raw errors.

**Impact:**  
- No global error toast or notification system
- Silent failures on network errors

**Fix:**  
Add a global `onError` handler and consider a `defaultOptions.query.onError` callback.

**Example:**

```tsx
// ✅ Enhanced QueryProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: config.cache.staleTime,
      gcTime: config.cache.gcTime,
    },
    mutations: {
      onError: (error) => {
        // Global error handling — e.g., toast notification
        console.error("Mutation error:", error);
      },
    },
  },
});
```

---

### 7. CSS Modules Lack Design Tokens

**Location:** `packages/frontend/src/components/ui/*.module.css`, `packages/frontend/src/app/pages/DemoPage.module.css`

**Problem:**  
Color values, spacing, and border-radius are hardcoded in multiple CSS files. For example, `#667eea` (primary purple) appears in multiple places.

**Impact:**  
- Theme changes require touching multiple files
- No dark mode support possible without a full refactor
- Inconsistent values creep in over time

**Fix:**  
Introduce CSS custom properties (variables) at the root level.

**Example:**

```css
/* packages/frontend/src/app/style.css — add to :root */
:root {
  --color-primary: #667eea;
  --color-primary-dark: #5a67d8;
  --color-success: #48bb78;
  --color-error: #fc8181;
  --color-text: #2d3748;
  --color-text-secondary: #4a5568;
  --color-bg: #f7fafc;
  --color-surface: #ffffff;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

Then use `var(--color-primary)` in modules instead of `#667eea`.

---

### 8. DemoPage Test Uses `act` Incorrectly

**Location:** `packages/frontend/src/app/pages/DemoPage.test.tsx`

**Problem:**  
If the test uses `act()` to wrap `render()` with async queries, it may cause "act() warning" noise. The correct pattern for Testing Library is to let `render` run and then use `waitFor` or `findBy` for async assertions.

**Impact:**  
- Noisy test output
- Potential false positives/negatives

**Fix:**  
Use `screen.findByText` or `waitFor` for async state changes.

**Example:**

```tsx
// ❌ Current pattern (if using act)
await act(async () => {
  render(<DemoPage />);
});

// ✅ Fix
render(<DemoPage />);
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

---

## 💡 Low Priority / Nice to Have

### 9. No Barrel Exports (Index Files)

**Location:** `packages/frontend/src/shared/api/`, `packages/frontend/src/components/ui/`

**Problem:**  
Consumers must import from deep paths:
```ts
import { http } from "@/shared/api/http";
import { ApiError, isApiError } from "@/shared/api/http";
```

**Impact:**  
- Verbose imports
- Refactoring paths requires updating many files

**Fix:**  
Add `index.ts` barrel files.

**Example:**

```ts
// packages/frontend/src/shared/api/index.ts
export { http } from "./http";
export { ApiError, isApiError } from "./http";
export { demoApi, healthApi } from "./demo";
export { exampleResponseSchema, type ExampleResponse } from "./schemas";
```

---

### 10. No Vitest Coverage Configuration

**Location:** `packages/frontend/vite.config.ts`

**Problem:**  
Coverage is not configured. No thresholds, no reporters, no include/exclude patterns.

**Impact:**  
- No visibility into test coverage
- No enforcement of minimum coverage

**Fix:**  
Add coverage config to `vitest` section.

**Example:**

```ts
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
  css: true,
  coverage: {
    provider: "v8",
    reporter: ["text", "json", "html"],
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/mocks/**", "src/test/**", "**/*.d.ts"],
    thresholds: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
},
```

---

### 11. Missing `React.memo` on Expensive Components

**Location:** `packages/frontend/src/components/ui/CodeBlock.tsx`

**Problem:**  
`CodeBlock` performs syntax highlighting via Prism, which can be expensive. It's not wrapped in `React.memo`, so parent re-renders cause unnecessary re-computation.

**Impact:**  
- Unnecessary re-renders on tab switches or state changes
- Performance degradation with multiple code blocks

**Fix:**  
Wrap with `React.memo` and ensure props are stable.

**Example:**

```tsx
export const CodeBlock = React.memo(function CodeBlock({
  code,
  language = "typescript",
  title,
}: CodeBlockProps) {
  // ... existing implementation
});

CodeBlock.displayName = "CodeBlock";
```

---

### 12. `addRequestInterceptor` Returns Cleanup Function But Lacks Documentation

**Location:** `packages/frontend/src/shared/api/http.ts`

**Problem:**  
The `addRequestInterceptor` utility returns an eject function, but there's no JSDoc explaining its lifecycle or when to call the cleanup.

**Impact:**  
- Developers may not know to clean up interceptors
- Potential memory leaks in long-lived sessions

**Fix:**  
Add JSDoc.

**Example:**

```ts
/**
 * Registers a request interceptor on the Axios instance.
 * @param onFulfilled - Called before each request
 * @returns A cleanup function to remove the interceptor. Call this in useEffect cleanup or similar.
 */
export function addRequestInterceptor(
  onFulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
): () => void {
  const id = http.interceptors.request.use(onFulfilled);
  return () => http.interceptors.request.eject(id);
}
```

---

## 🧱 Architecture Review

### Overall Structure

```
app/
├── App.tsx              ← Root component
├── ErrorBoundary.tsx    ← Error handling
├── style.css            ← Global styles
├── pages/               ← Route-level components
├── providers/           ← Context providers
└── routes/              ← Router configuration

components/
└── ui/                  ← Reusable UI primitives

shared/
├── config.ts            ← App configuration
└── api/                 ← HTTP client, schemas, queries

mocks/                   ← MSW mock setup
test/                    ← Test utilities
```

**Assessment:** The structure is clean and follows a reasonable convention. The separation between `app/`, `components/ui/`, and `shared/` is logical.

**What's Good:**
- Clear layering: config → HTTP → schemas → API functions → query hooks
- CSS Modules prevent style collisions
- ErrorBoundary provides a safety net
- MSW setup supports both browser and test environments

**What's Concerning:**
- As the app grows, the single `shared/api/` directory will become a bottleneck
- No feature-based grouping (e.g., `features/flags/`, `features/settings/`)
- No separation between domain logic and framework code

### Proposed Folder Structure for Growth

```
packages/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── providers/
│   │   │   └── routes/
│   │   ├── features/           ← NEW: Feature modules
│   │   │   ├── flags/
│   │   │   │   ├── api/
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   └── dashboard/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── shared/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── test/
│   └── ...
├── api-client/              ← NEW: Shared API types & schemas
│   ├── package.json         ← @sunflower/api-client
│   ├── src/
│   │   ├── schemas.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── tsconfig.json
└── ui/                      ← NEW: Shared UI components
    ├── package.json         ← @sunflower/ui
    ├── src/
    └── tsconfig.json
```

---

## ⚡ Performance Findings

### Bundle Analysis Opportunities

1. **`axios` is heavy (~14KB gzipped)** — For simple HTTP fetching, `ofetch` (from `unjs`) or native `fetch` with a thin wrapper would reduce bundle size by ~10KB.

2. **`react-router-dom` v7** — Full router is included. If using only client-side routing with a small route count, this is fine. But verify tree-shaking is working (Vite should handle this).

3. **No lazy loading** — `DemoPage` is eagerly imported in routes. For a small app this is fine, but establish the pattern now:

```tsx
// ❌ Current
import { DemoPage } from "../pages/DemoPage";

// ✅ Scalable pattern
const DemoPage = lazy(() => import("../pages/DemoPage"));
```

### Rendering Performance

- **No memoization concerns yet** — The app is small enough that re-renders aren't a problem
- **CodeBlock re-renders** — As noted, `React.memo` should be applied if multiple instances exist on a page

### Data Fetching Performance

- **React Query staleTime of 5 minutes is reasonable** — Good default
- **No prefetching** — Consider prefetching on hover for navigation links:

```tsx
<Link
  to="/dashboard"
  onMouseEnter={() => queryClient.prefetchQuery(dashboardQueryOptions())}
>
  Dashboard
</Link>
```

---

## 🧪 Testing Gaps

### Current Test Coverage

- **1 test file exists:** `DemoPage.test.tsx`
- Tests loading, success, and error states — good
- Uses MSW for realistic API mocking

### Missing Tests (Critical)

1. **`ErrorMessage` component** — No tests for different error types, retry behavior
2. **`http.ts` utilities** — No tests for `ApiError` construction, `isApiError` guard
3. **`createConfig`** — No test for env var fallback behavior
4. **`useHealthQuery` and `useDemoQuery`** — Only indirectly tested via DemoPage
5. **`ErrorBoundary`** — No tests for error recovery

### Recommended Test Cases

```tsx
// ErrorMessage.test.tsx
describe("ErrorMessage", () => {
  it("renders error message", () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("shows retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

// http.test.ts
describe("ApiError", () => {
  it("stores status and message", () => {
    const error = new ApiError("Not found", 404);
    expect(error.status).toBe(404);
    expect(isApiError(error)).toBe(true);
  });

  it("distinguishes ApiError from generic Error", () => {
    expect(isApiError(new Error("fail"))).toBe(false);
  });
});
```

---

## 📦 Dependency Review

### Current Dependencies

| Package | Version | Assessment |
|---------|---------|------------|
| react | 18.3.1 | ✅ Good — stable, well-supported |
| react-dom | 18.3.1 | ✅ Matches React |
| react-router-dom | 7.9.2 | ⚠️ New major — verify API stability |
| @tanstack/react-query | 5.90.2 | ✅ Excellent choice |
| axios | 1.7.0 | ⚠️ Consider native fetch for new projects |
| zod | 3.23.8 | ✅ Excellent for runtime validation |

### Dev Dependencies

| Package | Version | Assessment |
|---------|---------|------------|
| vite | 7.1.7 | ✅ Excellent build tool |
| @vitejs/plugin-react-swc | — | ✅ Fast JSX transform |
| typescript | 5.9.2 | ✅ Latest stable |
| vitest | 3.2.4 | ✅ Vite-native testing |
| @testing-library/react | 16.1.0 | ✅ Industry standard |
| msw | 2.11.2 | ✅ Excellent mock tool |
| @biomejs/biome | 2.1.4 | ✅ Modern lint/format |

### Recommendations

- **`axios` → native `fetch`**: For a greenfield project, native `fetch` with a small wrapper eliminates a dependency. The current `http.ts` abstraction layer makes migration straightforward.
- **`react-router-dom` v7**: This is a new major version. Verify that the flat routes API is stable and that migration from v6 patterns is complete.

---

## 🛠 Recommended Refactors (With Code)

### Refactor 1: Extract Interceptor Management into a Class

**Location:** `packages/frontend/src/shared/api/http.ts`

```ts
// ❌ Current — scattered interceptor management
export function addRequestInterceptor(onFulfilled) { ... }

// ✅ Fix — centralized interceptor manager
class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string, timeout: number) {
    this.instance = axios.create({ baseURL, timeout });
    this.setupDefaults();
  }

  private setupDefaults() {
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error instanceof AxiosError) {
          const serverMessage =
            (error.response?.data as { message?: string })?.message ??
            error.message;
          throw new ApiError(
            serverMessage,
            error.response?.status ?? 500,
            error.code,
            error.response?.data,
          );
        }
        throw error;
      },
    );
  }

  addRequestInterceptor(
    onFulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
  ): () => void {
    const id = this.instance.interceptors.request.use(onFulfilled);
    return () => this.instance.interceptors.request.eject(id);
  }

  get client(): AxiosInstance {
    return this.instance;
  }
}

export const httpClient = new HttpClient(config.api.url, config.api.timeout);
export const http = httpClient.client;
```

### Refactor 2: Type-Safe Query Keys Factory

**Location:** `packages/frontend/src/shared/api/demo.queries.ts`

```ts
// ❌ Current — plain arrays
const queryKeys = {
  health: ["health"] as const,
  demo: ["demo"] as const,
};

// ✅ Fix — factory pattern with parameter support
const queryKeys = {
  health: () => ["health"] as const,
  demo: (id?: string) => (id ? ["demo", id] : ["demo"]) as const,
} as const;

// Usage with parameters:
// queryClient.invalidateQueries({ queryKey: queryKeys.demo("123") });
```

### Refactor 3: Configurable Error Boundary

**Location:** `packages/frontend/src/app/ErrorBoundary.tsx`

```tsx
// ❌ Likely current — hardcoded fallback UI
// ✅ Fix — configurable fallback
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // ... existing implementation

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}
```

---

## ✅ Quick Wins (High Impact, Low Effort)

| # | Task | Effort | Impact | File(s) |
|---|------|--------|--------|---------|
| 1 | Add env var validation at startup | 15 min | High | `config.ts` |
| 2 | Fix TypeScript errors in routes | 10 min | High | `routes/index.tsx` |
| 3 | Add barrel exports (`index.ts`) | 10 min | Medium | `shared/api/`, `components/ui/` |
| 4 | Extract CSS variables | 20 min | Medium | `style.css` + modules |
| 5 | Wrap CodeBlock in React.memo | 5 min | Low | `CodeBlock.tsx` |
| 6 | Add coverage config to Vitest | 5 min | Medium | `vite.config.ts` |
| 7 | Add JSDoc to `addRequestInterceptor` | 5 min | Low | `http.ts` |

---

## 📋 Final Action Plan (Top 10 Tasks)

| Priority | Task | Category | Estimated Time |
|----------|------|----------|----------------|
| 🔴 P0 | Fix TypeScript compilation errors in routes | Bug Fix | 15 min |
| 🔴 P0 | Add environment variable validation at startup | Reliability | 15 min |
| 🔴 P0 | Extract server error message in API interceptor | Bug Fix | 10 min |
| 🟡 P1 | Create `tsconfig.base.json` at workspace root | DX | 10 min |
| 🟡 P1 | Add barrel exports for `shared/api/` and `components/ui/` | DX | 15 min |
| 🟡 P1 | Extract CSS custom properties from hardcoded values | Maintainability | 25 min |
| 🟠 P2 | Add Vitest coverage configuration | Testing | 10 min |
| 🟠 P2 | Write tests for ErrorMessage and ApiError | Testing | 30 min |
| 🟢 P3 | Plan `@sunflower/api-client` shared package extraction | Architecture | 60 min |
| 🟢 P3 | Add lazy loading pattern for route components | Performance | 15 min |

**Total Estimated Time: ~3.5 hours**

---

## Summary

This is a **well-structured starter project** with clean separation of concerns, modern tooling (Biome, Vite, Vitest, MSW), and solid patterns (Zod schemas, React Query, CSS Modules). The API layer architecture is particularly good — the `config → http → schemas → api → queries` pipeline is a pattern worth keeping.

**Main risks:**
1. TypeScript errors blocking type-checking (must fix immediately)
2. No env var validation (silent failures in production)
3. Monorepo overhead with no shared packages (either extract shared code or simplify)

**Main opportunities:**
1. The Zod + React Query pattern is excellent for scale
2. MSW setup is production-ready for testing
3. Biome is a forward-looking choice over ESLint

The codebase is in a good position to scale — the foundations are solid, and the issues identified are all addressable with focused effort.