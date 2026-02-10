---
trigger: always_on
---

# 🧲 ANTIGRAVITY AI DEVELOPMENT RULES (STRICT, NON-NEGOTIABLE)

These rules are **hard constraints** for the AI agent operating in the `hayl` repository.  
Violating these rules is considered a **failure**, not a suggestion.

---

## 0. PRIME DIRECTIVE (READ FIRST)

The AI must solve problems **directly, completely, and correctly**.

The AI is NOT allowed to:
- bypass issues using `any`, unsafe casts, or placeholders
- defer correctness “for later”
- ship partial implementations in critical paths

If something is difficult:
- slow down
- reason step by step
- research or ask
- then implement correctly

Speed is secondary to correctness.

---

## 1. TYPE SAFETY IS LAW

### 1.1 Absolute Prohibitions

- `any` is forbidden in **all code** (production, tests, examples).
- `as any`, double-casting (`as unknown as X`), or unsafe assertions are forbidden.
- Suppressing or silencing TypeScript errors is forbidden.

If the type system fails, **the design is wrong**. Fix the design.

---

### 1.2 Required Type Practices

- TypeScript must run with `strict: true`.
- Every external boundary MUST define a runtime schema:
  - HTTP bodies
  - headers
  - query parameters
  - webhooks
- Validation must occur at the boundary using Elysia validators or equivalent.
- After validation, rely on **inferred types only**. No manual casting.

---

### 1.3 No Unresolved `unknown`

- `unknown` is allowed only when:
  1. Immediately narrowed
  2. Exhaustively handled via type guards
- Leaving values as `unknown` beyond a boundary is forbidden.

---

## 2. NO TODOs IN CRITICAL PATHS

### 2.1 Forbidden TODO Zones

The following areas must be **fully implemented**:
- payment verification
- signature validation
- authentication and authorization
- money and quantity calculations
- data mutations affecting subscriptions, workouts, or access control

Placeholder comments or TODOs in these areas are forbidden.

---

### 2.2 Explicit Blocking Is Required

If the AI cannot safely complete an implementation:
- it must STOP
- explain exactly what information is missing
- request that information explicitly

Guessing is forbidden.

---

## 3. RUNTIME VALIDATION IS MANDATORY

- All external input is untrusted until validated.
- Validation happens at the edge, not inside business logic.
- After validation, internal code must assume correctness.

Required layers:
1. runtime schema validation
2. domain/business rule validation
3. persistence and schema validation

---

## 4. TESTING IS NOT OPTIONAL

### 4.1 Test Requirements

- Critical paths require tests before implementation.
- Payment flows must include:
  - valid success case
  - invalid signature case
  - replay or duplication case
- No tests means no merge.

---

### 4.2 Failure Tests Are Mandatory

Security-critical code must prove that it **fails correctly**.

Examples:
- invalid webhook signature → rejected
- expired subscription → denied
- malformed payload → 400 error

---

## 5. RESEARCH BEFORE CODE

- The AI must never invent APIs, payloads, or undocumented behavior.
- If documentation is unclear or missing:
  - stop
  - ask the user
  - or document the gap explicitly

Guessing is not allowed.

---

## 6. CLEAN CODE ENFORCEMENT

- One function = one responsibility
- Functions should stay under ~50 lines (soft limit)
- Names must be explicit and meaningful

Every exported or public function must include documentation explaining:
- purpose
- inputs
- outputs
- failure modes

---

## 7. DATA INTEGRITY & STATE RULES

- The database schema is the source of truth.
- Broad or untyped fields require:
  - versioning
  - migration strategy
- All sensitive or financial mutations must be logged with a correlation ID.

---

## 8. AI SELF-REVIEW CHECKLIST (MANDATORY)

Before presenting code, the AI must internally confirm:

- no `any` exists
- no TODOs exist in critical paths
- all external inputs are validated
- types are inferred, not cast
- success and failure tests exist
- code compiles under strict mode

If any check fails, the code must not be shown.

---

## 9. PR DISCIPLINE

- One logical change per PR
- No refactors mixed with features
- PRs must explain:
  - what changed
  - why it changed
  - risks involved

---

## 10. ENGINEERING PHILOSOPHY

Type errors are design feedback.  
Difficulty is a signal to think, not to bypass.  
Correctness beats speed. Always.

The AI must behave like a senior engineer protecting a production system.
