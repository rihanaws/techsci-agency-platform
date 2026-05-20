# Testing & Code Verification

This document details the testing framework, unit test cases, and how to verify code changes before merging to production.

---

## 🧪 Testing Framework

We use **Vitest** as our main test runner because it provides native TypeScript execution and matches Jest-compatible assertions out of the box with minimal configuration overhead.

The tests are located in the `__tests__/` directory.

### Running Tests
Execute the test runner using Bun:
```bash
bun run test
```

---

## 🔍 Implemented Unit Tests

### 1. Webhook Signature Verification (`__tests__/whop/verify.test.ts`)
Validates that our HMAC verification function correctly hashes incoming request bodies against the secret key.

- **Prefix Stripping**: Confirms the code handles both signature variants (`sha256=<hex>` and raw `<hex>`).
- **Valid Request**: Matches calculated HMAC against a mocked request body.
- **Tampered Request**: Verifies that invalid signature hashes or mismatched bodies return `false`.
- **Edge Cases**: Ensures missing secrets or empty headers default to rejection.

### 2. Event Normalization (`__tests__/whop/normalize.test.ts`)
Validates that the parser extracts user details, currency types, pricing, subscription flags, and product IDs correctly from various Whop webhook payloads.

- **Decoupled Environment Variables**: Sets up temporary test environment variables (e.g. `WHOP_PRODUCT_ID_AI_AGENT_PACK`) to simulate production ID configurations.
- **Payload Parsing**: Asserts that `normalizeWhopEvent` correctly converts order values to cents (e.g., `"49.00"` to `4900`) and correctly sets fields like `isSubscription = false` for single checkouts.

---

## 🏗️ Production Build Verification

To guarantee that TypeScript compilation passes and that page rendering works, always run the Next.js compiler before deployments:

```bash
bun run build
```

This ensures that:
- No dynamic endpoints are missing strict type declarations.
- No files contain implicit `any` types (enforced by `tsconfig.json`).
- All Next.js page metadata and imports are aligned.
```
