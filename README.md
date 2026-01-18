
# Feature Flags Management System


### Prerequisites

**For Docker Development:**
- **Docker**: v20.10+
- **Docker Compose**: v2.0+

---

## Running the Project

### Docker 

```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# Rebuild after dependency changes
docker-compose up --build

# Stop all services
docker-compose down
```

**Services will be available at:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health/liveness


**Stopping the services:**
```bash
docker-compose down
```


## Design Decisions

### API Design 

The API follows RESTful principles with additional specialized endpoints optimized for feature flag operations:

#### Standard CRUD Operations
- `GET /api/flags` - List all flags
- `POST /api/flags` - Create a new flag
- `GET /api/flags/:key` - Get a specific flag (with optional `?environment=` query)
- `PATCH /api/flags/:key` - Update flag metadata (name, description, group)
- `DELETE /api/flags/:key` - Delete a flag

#### Specialized Feature Flag Endpoints
- `GET /api/flags/:key/check` - Check if a flag is enabled in a specific environment (returns boolean)
- `POST /api/flags/:key/toggle` - Toggle a flag on/off for a specific environment
- `POST /api/flags/:key/reset` - Reset environment overrides to default value

#### Group Management
- `GET /api/flags/groups` - List all groups
- `POST /api/flags/groups` - Create a group
- `GET /api/flags/groups/:key` - Get group details with associated flags
- `POST /api/flags/groups/:key/toggle` - Bulk toggle all flags in a group
- `DELETE /api/flags/groups/:key` - Delete a group (flags remain, but become ungrouped)

#### Environment Promotion
- `POST /api/flags/promote` - Copy all flag values from source to target environment

**Design Rationale:**

**Separation of Concerns:**
- **CRUD endpoints** (`GET /api/flags/:key`) return full flag objects with all metadata, suitable for dashboard/management UIs.
- **Check endpoint** (`GET /api/flags/:key/check`) returns a lightweight boolean response optimized for high-frequency runtime checks by application services.
- This separation allows the check endpoint to be optimized differently (caching, rate limiting, response size) from CRUD operations.

**Bulk Operations:**
- Group toggling and environment promotion enable efficient multi-flag operations without multiple API calls.
- Environment promotion enforces directional flow (dev → qa → staging → prod) to prevent accidental rollbacks.

**RESTful Semantics:**
- Uses appropriate HTTP methods (GET, POST, PATCH, DELETE) and status codes.
- Maintains statelessness and resource-based URLs.

### Data Model for Flags and Environment Overrides

**Flag Structure:**

Each flag contains:
- **Metadata**: `key`, `name`, `description`, `groupKey` (nullable), `createdAt`, `updatedAt`
- **Default Value**: `defaultValue` (boolean) - used when no environment override exists
- **Environment Overrides**: `overrides` (Record<Environment, boolean | undefined>)

```typescript
interface Flag {
  key: string;
  name: string;
  description: string;
  defaultValue: boolean;
  groupKey: string | null;
  overrides: {
    dev?: boolean;
    qa?: boolean;
    staging?: boolean;
    prod?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Environment Override Resolution:**

The flag evaluation logic follows a clear precedence:
1. **Environment Override** - If an override exists for the requested environment, use that value.
2. **Default Value** - If no override exists (undefined), fall back to `defaultValue`.

This design allows:
- **Flexible configuration**: Each environment can have its own value or inherit from the default.
- **Efficient updates**: Changing `defaultValue` affects all environments without overrides.
- **Clear semantics**: An override of `false` explicitly disables a flag, while `undefined` means "use default".

**Environment Promotion Model:**

Environments follow a strict hierarchy: `dev` → `qa` → `staging` → `prod`. Promotion:
- Only allows forward progression (prevents accidental rollbacks)
- Copies override values from source to target environment
- Preserves existing overrides in the target if the source has no override (undefined)

**Group Model:**

Groups are independent entities that organize flags:
- Groups can be created, updated, and deleted independently
- Flags reference groups via `groupKey` (nullable foreign key)
- Deleting a group sets `groupKey` to `null` for all associated flags (flags remain)

### Frontend Structure and State Management

**Feature-Based Architecture:**

The frontend is organized using a **feature-based structure** rather than a traditional MVC or layer-based approach:

```
src/
├── app/              # Application-level setup
│   ├── providers/    # Context providers (Query, MUI)
│   ├── routes/       # Route definitions
│   └── theme/        # Global theme configuration
├── features/         # Feature modules (domain-driven)
│   └── flags/
│       ├── api/      # API layer (queries, mutations, API client)
│       ├── components/ # Feature-specific components
│       ├── hooks/     # Feature-specific hooks
│       └── schemas.ts # Zod schemas for validation
├── layouts/          # Layout components
└── shared/           # Shared utilities and components
    ├── api/          # Shared API client
    ├── components/   # Reusable UI components
    ├── hooks/        # Shared hooks
    └── lib/          # Utility functions
```

**Benefits:**
- **Co-location**: Related code (components, API calls, hooks) lives together
- **Scalability**: Easy to add new features without affecting existing ones
- **Maintainability**: Clear boundaries between features and shared code

**State Management with TanStack Query (React Query):**

The application uses **TanStack Query** as the primary state management solution:

**Query Layer:**
- `useFlags()` and `useGroups()` hooks fetch data from the API
- Automatic caching with 10-minute stale time
- Background refetching and structural sharing enabled
- Deduplication of concurrent requests via Axios interceptors

**Mutation Layer:**
- Each mutation (create, update, delete, toggle) invalidates relevant query caches
- Automatic UI updates after successful mutations
- Optimistic updates could be added for better UX
- Toast notifications for user feedback

**Key Configuration:**
- **Stale Time**: 10 minutes - data considered fresh for this duration
- **Cache Time**: 30 minutes - unused data kept in cache
- **No Refetch on Mount/Focus**: Uses cached data when available
- **Retry Logic**: 3 retries for server errors (5xx), no retries for client errors (4xx)

**State Flow:**
1. Components call `useFlags()` or `useGroups()` hooks
2. React Query checks cache first, then fetches if stale
3. Mutations update server state, then invalidate queries
4. Invalidated queries refetch automatically
5. UI updates reactively via React Query's reactive cache

**Separation of Concerns:**
- **API Layer** (`flagsApi.ts`): Pure functions that make HTTP requests
- **Query Layer** (`queries.ts`): React Query hooks for fetching
- **Mutation Layer** (`mutations.ts`): React Query hooks for updates with side effects
- **Components**: Focus on UI logic, delegate data fetching to hooks

This architecture provides:
- **Automatic caching** and background updates
- **Optimistic UI updates** capability
- **Built-in loading and error states**
- **Reduced boilerplate** compared to Redux or Context API

## Technology Stack

### Backend
- **Node.js** (v20.6.0+)
- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **Vitest** - Testing framework
- **Biome** - Linting and formatting
- **Docker** - Containerization for development and production

### Frontend
- **React** (v18) - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library and theming
- **Tanstack Query (React Query)** - Data fetching and caching
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **React Toastify** - Toast notifications

### Monorepo
- **pnpm Workspaces** - Multi-package management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration for local development

### How Services Query Feature Flags

**Centralized Feature Flag Service**

In production, feature flags would be served by a dedicated microservice or managed platform (e.g., LaunchDarkly, Flagsmith, or a self-hosted solution).

**Query Flow:**
1. **Service Initialization**: On startup, services connect to the feature flag system and fetch initial flag states.
2. **Runtime Queries**: Services query flag states via HTTP calls


### What Happens If the Feature Flag System Is Unavailable?

**Fail-Safe Strategy: "Fail Open" vs. "Fail Closed"**

- **Fail Open**: If the flag system is unreachable, default to `true` (enable new features). This is suitable for non-critical features where enabling is safer than disabling.
- **Fail Closed**: Default to `false` (disable features). Use for high-risk features (e.g., new billing logic) to prevent issues if the flag system fails.

**Implementation:**
- **Circuit Breaker Pattern**: After N consecutive failures, stop querying the flag service and use cached/default values.
- **Health Checks**: Monitor flag service availability and alert on downtime.
- **Fallback Defaults**: Store default flag states in the application code as a last resort.


### Caching and Update Propagation

**Why Cache?**
- **Performance**: Querying a remote flag service on every request adds latency (10-50ms per call).
- **Resilience**: Local cache ensures flags are available even if the flag service is temporarily down.

**Caching Strategies:**

1. **In-Memory Cache (Service-Level)**
   - Store flag states in-process memory (e.g., Node.js Map, Redis, or SDK cache).
   - **TTL**: 60-300 seconds (balance between freshness and performance).
   - **Update Mechanism**: Poll the flag service at intervals or use webhooks/SSE for real-time updates.

2. **Distributed Cache (Cross-Service)**
   - Use Redis or Memcached as a shared cache layer.
   - Reduces load on the flag service but adds a dependency on the cache.

3. **Client-Side Cache (Frontend)**
   - Cache flag states in the browser (localStorage, sessionStorage) with a short TTL.
   - Useful for user-level targeting (e.g., beta features for specific users).

**Update Propagation:**
- **Polling**: Services periodically fetch updated flag states (simple, but delayed updates).
- **Push-Based (SSE/WebSockets)**: Flag service pushes updates to connected clients in real-time.
- **Cache Invalidation**: When flags change, invalidate the cache (via TTL expiration, pub/sub, or explicit invalidation API).

**Trade-offs:**
- **Polling**: Simpler to implement, but changes take time to propagate (up to polling interval).
- **Push-Based**: Near-instant updates, but requires persistent connections (more complex, higher server load).

### Avoiding Excessive Conditional Logic

**Problem**: As feature flags accumulate, code can become littered with flag checks, making it hard to read and maintain.

**Best Practices:**

1. **Feature Toggle Abstraction Layer**
   - Wrap flag checks in a dedicated service/module.
   - Avoid inline checks throughout the codebase.

2. **Strategy Pattern**
   - Use flags to select implementations, not control flow.

3. **Temporary Flags**
   - Treat feature flags as **temporary** (except kill switches and permission-based flags).
   - After a feature is fully rolled out, remove the flag and its checks (technical debt cleanup).

4. **Flag Lifecycle Management**
   - Track flag age and usage in the dashboard.
   - Alert on flags older than 90 days (candidates for removal).

### Minimizing Performance Overhead

**Latency Reduction:**
- **SDK-Level Caching**: Flag SDKs cache responses locally, avoiding network calls on every check.
- **Batch Queries**: Fetch multiple flags in a single API call during initialization.
- **Edge Caching**: Deploy flag service at the edge (e.g., Cloudflare Workers, AWS Lambda@Edge) to reduce latency.

**Network Overhead:**
- **Gzip Compression**: Compress API responses (especially for bulk flag fetches).
- **Pagination**: If querying thousands of flags, paginate results to avoid large payloads.

**Redundant Checks:**
- **Memoization**: Cache flag results within a single request context (e.g., using a request-scoped cache in Express middleware).
- **Lazy Evaluation**: Only check flags when the code path is reached.

## Future Improvements

### 1. Persistence
**Current**: In-memory storage (data lost on server restart).

**Improvement**: Add a database backend (PostgreSQL, MongoDB, or DynamoDB) for persistent flag storage.

**Benefits**:
- Flag configurations survive server restarts.
- Support for multi-instance deployments (shared state).
- Historical tracking (flag change audit log).

### 2. Per-User Targeting
**Current**: Flags apply to entire environments.

**Improvement**: Enable targeting based on user attributes (ID, email, role, percentage rollout).

**Examples**:
- "Enable dark mode for users in the 'beta_testers' group."
- "Gradually roll out new feature to 10% of users, then 50%, then 100%."

### 3. Automated Tests
**Current**: Manual testing via browser.

**Improvement**: Add comprehensive test coverage.

**Test Types**:
- **Unit Tests**: Flag evaluation logic, API routes, utility functions.
- **Integration Tests**: End-to-end API flows (create, toggle, promote, delete).
- **E2E Tests**: Frontend user workflows (Playwright, Cypress).

### 4. Observability and Metrics

**Improvement**: Track flag usage and performance.

**Metrics to Collect**:
- **Flag Evaluation Counts**: How often each flag is checked.
- **Toggle Events**: When flags are enabled/disabled (audit log).
- **Performance**: Latency of flag queries (P50, P95, P99).
- **Errors**: Failed queries, timeouts, cache misses.

### 5. Role-Based Access Control (RBAC)
**Current**: No authentication or authorization (anyone can modify flags).

**Improvement**: Restrict flag management based on user roles.

**Roles**:
- **Viewer**: Read-only access (can check flags, but not modify).
- **Editor**: Can create and toggle flags, but not delete or promote.
- **Admin**: Full access (promote environments, delete flags).
