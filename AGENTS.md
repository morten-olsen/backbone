<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Backbone - Agent Development Guide

## Commands

- Build: `pnpm build` (TypeScript compilation - run before committing)
- Lint: `pnpm test:lint` (ESLint - run before committing)
- Test all: `pnpm test:unit` (runs all Vitest tests)
- Test single: `pnpm test:unit tests/mqtt.test.ts` (run specific test file)
- Dev: `pnpm dev` (watch mode with auto-reload)

## Code Style (enforced by ESLint/Prettier)

- **NO default exports** - use named exports only (`export { ClassName }`)
- **Type definitions**: use `type`, NOT `interface` (`type Foo = { ... }`)
- **File extensions**: always include `.ts` in imports (`from './file.ts'`)
- **Import paths**: use `#root/*` alias for src/ (`#root/utils/services.ts`)
- **Import order**: builtin → external → internal → parent → sibling → index (newlines between groups)
- **Private fields**: use `#` prefix for private class members (`#services: Services`)
- **Formatting**: 120 char width, single quotes, 2 spaces, semicolons, trailing commas
- **Exports**: exports must be last in file (`import/exports-last` rule)

## Patterns

- **Dependency injection**: use `Services` container - constructor takes `services: Services`, access via `this.#services.get(ClassName)`
- **Validation**: use Zod schemas for all data validation
- **Types**: leverage TypeScript strict mode - no implicit any, null checks required
