# ANTIGRAVITY AI DEVELOPMENT RULES

These rules are strict constraints for the AI agent (Antigravity) to ensure high-quality, secure, and maintainable code in the `hayl` repository.

## 1. Type Safety & Validation

- **NO `any` ALLOWED**: The `any` type is strictly forbidden in production code. Use `unknown` with narrowing or strict schema definitions.
- **Runtime Validation**: All external inputs (API bodies, headers, query params) MUST be validated at the boundary using runtime validators (e.g., Elysia uses `t` from TypeBox, Zod, etc.).
- **Strict Integers**: When handling money or quantities, use integers (cents) or strict decimal types. Never use floating-point math for currency.

## 2. Documentation & Research

- **Verify Before Implementing**: Do not hallucinate API signatures. If external documentation is missing, create a research task or ask the user.
- **Docblocks**: All public functions and complex logic blocks must have TSDoc/JSDoc comments explaining:
  - `@param` details
  - `@returns` shape
  - `@throws` potential errors
- **ADRs**: Significant architectural decisions must be recorded in `docs/decisions/`.

## 3. Testing Strategy (Target: 100% Critical Path Coverage)

- **Test-First / TDD**: Write the test case before implementing complex logic.
- **Unit Tests**: Test individual functions/classes in isolation. Mock external dependencies (DB, Payment APIs).
- **Integration Tests**: Test API endpoints with a test database/runtime. Verify schema validation and error handling.
- **E2E Tests**: Use Playwright/etc. for critical user flows (e.g., "User subscribes via Telebirr").
- **Safety Gates**: Security-critical functions (signatures, auth) must have negative tests (verify they fail on invalid input).

## 4. Security & Best Practices

- **Secrets**: Never commit secrets. Use environment variables.
- **Least Privilege**: Functions should only ask for the data they need.
- **Audit Logs**: All financial or sensitive data mutations must be logged with a context ID.
- **Clean Code**:
  - Functions < 50 lines.
  - One purpose per function.
  - Descriptive variable names (no `x`, `data`, `item`).

## 5. Review Protocol

- **Self-Correction**: Before showing code to the user, the AI must run lints and tests.
- **One Change per PR**: Do not bundle refactors with features.
