# SDK Reference

Package: **`@epoch-protocol/epoch-intents-sdk`**

Main class: **`EpochIntentSDK`**

Peer dependency: **viem** ^2.x

---

## Constructor

```typescript
new EpochIntentSDK({
  apiBaseUrl: string;      // Epoch allocator URL (no trailing slash)
  walletClient: WalletClient;  // viem wallet client from wagmi or viem
  gaslessDefault?: boolean;  // when true, solveIntent prefers gasless relay on supported chains
})
```

The wallet client must be connected to the **source chain** where the user's input tokens live.

---

## Core methods

### `getTaskData(params)`

Builds the task type string and intent data object used by quote and solve methods.

```typescript
getTaskData(params: {
  taskType: TaskType;
  intentData: {
    isNative: boolean;
    depositTokenAddress: string;
    tokenInAmount: string;       // use "0" for reverse quotes
    outputTokenAddress: string;
    minTokenOut: string;         // use fixed output for reverse quotes
    destinationChainId: string;
    protocolHashIdentifier: string;
    recipient: string;
  };
  extraDataTypestring: string;   // ABI-style type string for extra fields
  extraData: Record<string, unknown>;
}): Promise<{ taskTypeString: string; intentData: unknown }>
```

**Validation:** Either `tokenInAmount` or `minTokenOut` must be non-zero.

---

### `getIntentQuote(params)`

Fetches a quote without executing. Use this to display amounts to the user before signing.

```typescript
getIntentQuote(params: {
  sponsorAddress: `0x${string}`;
  taskTypeString: string;
  intentData: unknown;
  isNative?: boolean;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
}): Promise<IntentQuoteResult>
```

**`RoutingAndLiquidityOptions`** (optional) — controls which solver liquidity paths SIO may quote. Mapped server-side to `constraint.preferredSolvers`. Use the **same** value in `getIntentQuote` and `solveIntent`.

| Preset | UX | Behavior |
|--------|-----|----------|
| `{ preset: "any" }` | Best quote (default) | All registered solvers |
| `{ preset: "filler-single-transaction" }` | One user transaction; seamless end-to-end execution | Epoch filler treasury only — protocol interactions bundled behind a single signature |
| `{ preset: "external-multi-transactions" }` | Multi-transaction flow | External aggregators only |
| `{ preset: "custom"; solvers: [\`0x…\`] }` | Pin specific solver(s) | Explicit solver address(es) |

```typescript
await sdk.getIntentQuote({
  sponsorAddress,
  taskTypeString,
  intentData,
  routingAndLiquidityOptions: { preset: "filler-single-transaction" },
});
```

**`IntentQuoteResult` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether quoting succeeded |
| `tokenIn` | string | Resolved input amount |
| `tokenOut` | string | Resolved output amount |
| `tokenInDecimals` | number | Input token decimals |
| `tokenInSymbol` | string | Input token symbol |
| `path` | array | Execution path |
| `resourceLockRequired` | boolean | Whether Compact lock is needed |
| `transactions` | array | Transaction preview |

---

### `solveIntent(params)`

Signs and submits the intent for execution. The user will be prompted to sign in their wallet.

```typescript
solveIntent(params: {
  isNative: boolean;
  sponsorAddress: `0x${string}`;
  taskTypeString: string;
  intentData: unknown;
  quoteResult?: IntentQuoteResult;  // optional; fetched internally if omitted
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
  onExecutionStatus?: (status: TransactionExecutionStatus) => void;
  collateralType?: CollateralType;  // EVM | Miden — partner flows
  gasless?: boolean;  // opt-in EIP-7702 relay for Compact deposit (testnet)
}): Promise<{ allocationResponse?: { nonce: string }; gaslessUsed?: boolean; ... }>
```

When `gasless: true` on a supported testnet chain with a delegated EOA, the SDK relays approve + Compact deposit via the allocator relayer. The user still signs sponsor data; the relayer pays gas. See [Gasless Deposits](gasless-deposits.md).

**Execution status phases** (via `onExecutionStatus`):

| Phase | Meaning |
|-------|---------|
| `starting` | Execution began |
| `switching-chain` | Prompting wallet chain switch |
| `preparing-transaction` | Simulating transaction |
| `waiting-for-transaction` | Retrying simulation |
| `sending` | Submitting transaction |
| `sent` | Transaction submitted; hash available |

---

### `getIntentStatus(userAddress, nonce)`

Polls execution progress.

```typescript
getIntentStatus(
  userAddress: string,
  nonce: string,
): Promise<IntentTransactionStatus[]>
```

Each entry includes status, `transactionHash`, and `chainId` per step.

Recommended polling interval: **3 seconds** until all steps report completion.

---

### `retryIntentSolve(...)`

Retries a failed intent solve. Contact Epoch for guidance on when retries are safe.

---

### `getHealthCheck()`

Checks Epoch service availability.

```typescript
getHealthCheck(): Promise<HealthCheckResponse>
```

---

## Compact-related methods

Available for partner integrations using The Compact:

| Method | Purpose |
|--------|---------|
| `getDepositedBalances(account, tokens)` | Query locked balances |
| `withdrawToken(...)` | Withdraw deposited tokens |
| `initateDepositWithdrawal(id)` | Initiate forced withdrawal |
| `disableForcedWithdrawal(id)` | Disable forced withdrawal |
| `getForcedWithdrawalStatus(id)` | Check withdrawal status |

Contact Epoch before exposing Compact flows to end users.

---

## Gasless methods (testnet)

Available when using a gasless-enabled allocator (`GET /gasless-status` → `enabled: true`).

| Method | Purpose |
|--------|---------|
| `getWalletGaslessStatus(chainId)` | Probe delegation state, relay eligibility, setup needed |
| `setupSmartAccount({ chainId })` | Sign 7702 authorization + relay enable (local signers) |
| `ensureGaslessReady({ chainId })` | Upgrade + setup + verify in one call |
| `setupGaslessWallet({ chainId })` | Alias for smart-account setup |
| `gaslessDepositToCompact(...)` | Standalone relayed deposit (without full solve) |
| `revokeGaslessWallet({ chainId })` | Revoke 7702 delegation |

**Exported helpers** (also available from package root):

```typescript
import {
  GaslessUnavailableError,
  getWalletGaslessStatus,
  GASLESS_SUPPORTED_CHAIN_IDS,
  shouldUseGaslessRelay,
  setupSmartAccount,
  ensureGaslessReady,
} from "@epoch-protocol/epoch-intents-sdk";
```

Full guide: [Gasless Deposits](gasless-deposits.md).

---

## Task types

Import from `@epoch-protocol/epoch-commons-sdk`:

```typescript
import { TaskType } from "@epoch-protocol/epoch-commons-sdk";

TaskType.GetTokenOut           // "gettokenout" — swap / bridge
TaskType.Deposit               // "deposit"
TaskType.ProtocolInteraction   // "protocol-interaction"
```

---

## What the SDK handles internally

You do **not** need to implement these steps manually when using the SDK:

| Internal step | Handled by |
|---------------|------------|
| Nonce retrieval | SDK during solve flow |
| Intent signing | SDK via `walletClient` |
| Compact data assembly | SDK during quote/solve |
| Transaction simulation retries | SDK during `solveIntent` |

---

## Next steps

- [SDK Integration Guide](./sdk-integration-guide.md)
- [Gasless Deposits](./gasless-deposits.md)
- [Swap & Bridge](./swap-and-bridge.md)
- [Protocol Interaction](./protocol-interaction.md)
- [Error Handling](./error-handling.md)
