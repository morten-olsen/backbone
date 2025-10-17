# Project Context

## Purpose

Backbone is a Kubernetes-native MQTT broker with fine-grained access control and topic validation. It provides declarative configuration through Custom Resource Definitions (CRDs), JWT-based authentication with multiple providers, and AWS IAM-style statement-based authorization for MQTT operations. The broker supports multiple transport protocols (TCP, WebSocket) and includes a RESTful API for management.

## Tech Stack

- **Runtime**: Node.js 23+, TypeScript 5.9
- **Package Manager**: pnpm 10.18
- **MQTT Broker**: Aedes (v0.51) with Redis persistence support
- **HTTP Framework**: Fastify 5.6 with WebSocket plugin
- **Kubernetes Client**: @kubernetes/client-node
- **Authentication**: jsonwebtoken, OIDC support
- **Validation**: Zod 4.1 for schema validation
- **Database**: Knex with PostgreSQL and SQLite support
- **Testing**: Vitest 3.2 with coverage
- **Code Quality**: ESLint 9.37, Prettier 3.6, TypeScript strict mode

## Project Conventions

### Code Style

- **NO default exports** - use named exports only (`export { ClassName }`)
- **Type definitions**: use `type`, NOT `interface` (`type Foo = { ... }`)
- **File extensions**: always include `.ts` in imports (`from './file.ts'`)
- **Import paths**: use `#root/*` alias for src/ (`#root/utils/services.ts`)
- **Import order**: builtin → external → internal → parent → sibling → index (newlines between groups)
- **Private fields**: use `#` prefix for private class members (`#services: Services`)
- **Formatting**: 120 char width, single quotes, 2 spaces, semicolons, trailing commas
- **Exports**: exports must be last in file (`import/exports-last` rule)
- **NO comments** unless explicitly requested

### Architecture Patterns

- **Dependency Injection**: Services container pattern - all classes accept `services: Services` in constructor, access via `this.#services.get(ClassName)`
- **Configuration**: Centralized `Config` class using environment variables
- **Authentication**: Pluggable provider system via `SessionProvider` supporting multiple auth methods (K8s, OIDC, JWT, Admin)
- **Authorization**: Statement-based policies (similar to AWS IAM) with effect/resources/actions structure
- **Validation**: Zod schemas for all data validation (see `*.schemas.ts` files)
- **Event-driven**: Custom event emitter for broker events and K8s resource changes
- **CRD Pattern**: Kubernetes operator watches Client and Topic CRDs for declarative configuration

### Testing Strategy

- **Framework**: Vitest with coverage via @vitest/coverage-v8
- **Test command**: `pnpm test:unit` (all tests) or `pnpm test:unit tests/mqtt.test.ts` (specific file)
- **Pre-commit checks**: MUST run `pnpm build` (TypeScript compilation) and `pnpm test:lint` (ESLint) before committing
- **Test location**: `tests/` directory with `tests/utils/` for test utilities
- **Coverage**: Enabled via Vitest configuration
- **NEVER assume test framework** - always check package.json or README for test commands

### Git Workflow

- **CI/CD**: GitHub Actions with auto-labeler, build jobs, draft releases
- **Release Management**: Automated draft releases via release-drafter
- **Commit Requirements**: Must pass `pnpm build` and `pnpm test:lint` before committing
- **NEVER commit unless explicitly requested** by the user

## Domain Context

### MQTT Concepts

- **Actions**: `mqtt:publish`, `mqtt:subscribe`, `mqtt:read`
- **Topic Patterns**: Supports wildcards (`*` single-level, `**` multi-level)
- **QoS Levels**: 0 (at most once), 1 (at least once), 2 (exactly once)
- **Transports**: TCP (port 1883), WebSocket (ws://host:8883/ws)

### Authorization Model

- **Statements**: Array of `{ effect: 'allow' | 'deny', resources: string[], actions: string[] }`
- **Resource Format**: `mqtt:topic/pattern` or `*` for all
- **Evaluation**: Deny-by-default, explicit allow required, deny overrides allow

### Kubernetes Resources

- **Client CRD**: Defines MQTT client access policies with statement-based authorization
- **Topic CRD**: Configures topic validation rules (maxMessageSize, allowedQoS, patterns)
- **Namespace-scoped**: Resources are namespace-aware for multi-tenancy

### Authentication Providers

- **K8sAuth**: Kubernetes ServiceAccount token authentication
- **OidcAuth**: OpenID Connect with configurable discovery, client credentials, group-based authorization
- **JwtAuth**: Custom JWT tokens with configurable secret
- **AdminAuth**: Static admin token for management operations

## Important Constraints

- **Strict TypeScript**: No implicit any, null checks required
- **No default exports**: Enforced by ESLint
- **Import extensions**: Must include `.ts` in all imports
- **Private field syntax**: Must use `#` prefix, not `private` keyword
- **Services pattern**: All dependencies must go through Services container
- **Validation required**: All external data must be validated via Zod schemas
- **Pre-commit checks**: Build and lint must pass before committing

## External Dependencies

- **Kubernetes API**: When K8S_ENABLED=true, connects to K8s API to watch Client/Topic CRDs
- **Redis**: Optional persistence layer when REDIS_ENABLED=true (Aedes persistence)
- **OIDC Provider**: When OIDC_ENABLED=true, requires OIDC discovery endpoint
- **PostgreSQL/SQLite**: Database support via Knex (configurable)
- **GitHub Actions**: CI/CD pipeline for build, lint, and release management
