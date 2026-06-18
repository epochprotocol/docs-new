# API Reference

Epoch Intent HTTP API — external integrator surface.

**Base path:** `/api/v1`  
**Health probes:** `GET /health`, `GET /ready` (mounted at root, not under `/api/v1`)

Contact the Epoch team for your API base URL (test and production environments).

---

## Authentication

Intent requests are authorized by the **user's wallet signature** on the intent payload (`nonce` + `signature` fields on solve).

When using the SDK, signing is handled automatically via the connected `walletClient`.

For direct HTTP integration, follow the signing flow documented by Epoch (obtain nonce → sign → submit).

---

## Endpoints

### Health

#### `GET /health`

Liveness probe. Returns `{ "status": "ok", "uptime": <seconds> }`.

#### `GET /ready`

Readiness probe. Returns `{ "status": "ready" }` or `503` if not ready.

---

### `POST /api/v1/getNonce`

Returns a nonce required before signing and submitting an intent.

**Request body:**

```json
{
  "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "approvals": [
    {
      "tokenAddress": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      "spenderAddress": "0x0000000000000000000000000000000000000001",
      "amount": "1000000",
      "chainId": 137
    }
  ],
  "task": "<base64-encoded-task>",
  "constraint": {
    "constraintData": "0x",
    "constraintResponse": "0x",
    "constraints": "",
    "optimizationFactor": 1,
    "deadline": 1749438779,
    "triggers": "",
    "preferredSolvers": []
  },
  "proposedFeeRewards": 0,
  "chainIds": [137, 8453],
  "recurring": false,
  "calldatas": []
}
```

**Response `200`:**

```json
{
  "nonce": "1234567890"
}
```

**Errors:** `400` validation error

---

### `POST /api/v1/solveIntent`

Submits a signed intent for execution.

**Additional required fields** (beyond `getNonce` body):

```json
{
  "nonce": "1234567890",
  "signature": "0x..."
}
```

**Response `200`:**

```json
{
  "path": [],
  "success": true,
  "resourceLockRequired": false,
  "transactions": []
}
```

**Errors:**

| Code | Meaning |
|------|---------|
| `400` | Invalid request |
| `409` | Intent already processed |
| `422` | Invalid nonce or signature |

---

### `POST /api/v1/findPathsForIntent`

Discovers possible execution paths without executing. Same request body as `getNonce`.

**Response `200`:** Path discovery result with `path`, `success`, `resourceLockRequired`, `transactions`.

---

### `POST /api/v1/checkIfResourceLockRequiredAndGetTransactions`

Planning endpoint: checks whether a resource lock is required and returns transaction data for client-side preview.

Same request/response shape as `solveIntent` (without requiring prior execution).

---

### `GET /api/v1/getIntentTransactionStatus`

Poll execution status for an intent.

**Query parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `user` | Yes | User wallet address (`0x...`) |
| `nonce` | Yes | Intent nonce from solve response |

**Example:**

```
GET /api/v1/getIntentTransactionStatus?user=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0&nonce=1234567890
```

**Response `200`:** Array of objects with status, `transactionHash`, and `chainId` per transaction step.

---

### `GET /api/v1/getIntents`

Lists intents for a user.

**Query parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `user` | Yes | User wallet address |
| `nonce` | No | Filter by nonce |

**Response `200`:** Map of intent nonce to queued transactions.

---

## Request schemas

### Approval

| Field | Type | Description |
|-------|------|-------------|
| `tokenAddress` | address | ERC-20 token |
| `spenderAddress` | address | Spender contract |
| `amount` | string | Allowance amount (wei/smallest unit) |
| `chainId` | integer | Chain where approval applies |

### Constraint

| Field | Type | Description |
|-------|------|-------------|
| `constraintData` | hex | Opaque constraint data |
| `constraintResponse` | hex | Constraint response |
| `constraints` | string | Constraint identifier |
| `optimizationFactor` | number | Optimization weight |
| `deadline` | integer | Unix timestamp deadline |
| `triggers` | string | Trigger conditions |
| `preferredSolvers` | string[] | Preferred solver addresses |

### Intent body (shared fields)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sender` | address | Yes | User wallet address |
| `approvals` | Approval[] | Yes | Token approvals (min 1) |
| `task` | string | No | Base64-encoded task |
| `constraint` | Constraint | No | Execution constraints |
| `proposedFeeRewards` | number/string | No | Fee rewards |
| `chainIds` | integer[] | Yes | Involved chain IDs |
| `recurring` | boolean | No | Recurring intent flag |
| `calldatas` | CalldataItem[] | No | Additional calldata |

---

## Error response

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": [],
  "requestId": "optional-id"
}
```

See [Error Handling](./04-integration-guides/error-handling.md).

---

## Not published externally

These endpoints exist but are not part of the public integrator API:

- `POST /api/v1/registerEvent`
- `POST /api/v1/echo`

Internal solver, inventory, and allocator admin routes are also not exposed to integrators.

---

## OpenAPI spec

A machine-readable spec is available at `/api/openapi.yaml` on Epoch API deployments (when enabled).

---

## Next steps

- [SDK Reference](./04-integration-guides/sdk-reference.md) — recommended integration path
- [Quickstart](./04-integration-guides/quickstart.md)
