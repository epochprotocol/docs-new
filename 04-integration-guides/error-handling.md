# Error Handling

Guidance for handling errors in Epoch integrations.

---

## HTTP status codes (API)

| Code | Meaning | Integrator action |
|------|---------|-------------------|
| **200** | Success | Process response |
| **400** | Invalid request (validation) | Fix request payload; show user-friendly message |
| **409** | Intent already processed | Do not retry the same nonce; start a new intent |
| **422** | Validation failed (nonce, signature, balance) | Re-fetch nonce, re-sign, or check user balance |
| **503** | Service unavailable | Retry with backoff; check `/health` |

Error response shape:

```json
{
  "error": "Human-readable message",
  "code": "STABLE_ERROR_CODE",
  "details": {},
  "requestId": "optional-request-id"
}
```

Branch on `code` when available; fall back to `error` message for display.

---

## SDK errors

The SDK throws typed errors:

| Error class | Typical cause |
|-------------|---------------|
| `CompactSDKError` | Invalid parameters, unsupported chain, simulation timeout |
| `APIError` | HTTP error from Epoch API |
| `TransactionError` | On-chain transaction failure |

Wrap SDK calls in try/catch and surface `error.message` to users (avoid raw stack traces).

```typescript
try {
  await sdk.solveIntent({ ... });
} catch (error) {
  if (error instanceof CompactSDKError) {
    // show error.message
  }
}
```

---

## Common error categories

| Category | User-facing message | Retry? |
|----------|---------------------|--------|
| **Wallet rejected** | "Transaction cancelled" | Yes — user can retry |
| **Wrong network** | "Please switch to {chain name}" | Yes — after chain switch |
| **Insufficient balance** | "Insufficient {token} balance" | No — until user adds funds |
| **Quote failed** | "Unable to get quote. Try a different amount or token." | Yes |
| **Nonce / signature invalid** | "Session expired. Please try again." | Yes — new quote + solve |
| **Intent already processed** | "This request was already submitted." | No — same nonce |
| **Execution failed** | "Transaction failed. Please try again or contact support." | Maybe — see `retryIntentSolve` |

---

## Quote failures

When `getIntentQuote` returns `success: false`:

- Check that source and destination chains are supported.
- Verify token addresses match the selected chain.
- For reverse quotes, ensure `minTokenOut` is set and `tokenInAmount` is `"0"`.
- Ensure the wallet is connected on the source chain.

---

## Polling and timeouts

- Poll `getIntentStatus` every **3 seconds**.
- Set a **client-side timeout** (e.g. 5–10 minutes) and show a "still processing" state with support contact.
- Do not assume failure immediately — cross-chain execution can take several minutes.

---

## Retry guidance

| Action | Safe to retry? |
|--------|----------------|
| `getIntentQuote` | Yes |
| `getTaskData` | Yes |
| `solveIntent` with **new** nonce | Yes, after new quote |
| `solveIntent` with **same** nonce after 409 | No |
| `retryIntentSolve` | Contact Epoch for semantics |

---

## Execution status phases

Use `onExecutionStatus` during `solveIntent` for live UX:

```typescript
await sdk.solveIntent({
  ...params,
  onExecutionStatus: (status) => {
    switch (status.phase) {
      case "switching-chain":
        showToast("Please switch network in your wallet");
        break;
      case "sending":
        showToast(`Sending transaction ${status.transactionIndex + 1} of ${status.totalTransactions}`);
        break;
      case "sent":
        showToast(`Transaction submitted: ${status.transactionHash}`);
        break;
    }
  },
});
```

---

## Next steps

- [FAQ](../06-appendices/faq.md)
- [API Reference](../05-api-reference.md)
