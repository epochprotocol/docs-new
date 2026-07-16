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
  allowGaslessSmartAccount?: boolean;  // opt in local-wallet gasless relay (also overridable per solveIntent)
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

`extraDataTypestring` and `extraData` must declare the **same keys** with **no spaces around commas** (e.g. `uint256 foo,uint256 bar`, not `uint256 foo, uint256 bar`). Witness fields may use EIP-712 types including `string` (earn `marketUid` / `action`, Miden account ids, etc.). The allocator hashes witness data with EIP-712 `hashStruct`, matching client signing.

See [Witness typestrings & Miden bridge](#witness-typestrings--miden-bridge) for Miden field rules and exported constants.

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
  allowGaslessSmartAccount?: boolean;  // local wallet: strict relay; throws if not delegated (no auto-convert)
}): Promise<{ allocationResponse?: { nonce: string }; gaslessUsed?: boolean; ... }>
```

When `gasless: true` on a supported testnet chain, the SDK submits on-chain steps without the user paying gas (relay for local signers with `allowGaslessSmartAccount`; wallet batching for injected smart wallets). Call `convertToSmartAccount({ chainId })` once before the first gasless solve for local private-key wallets. The user still signs authorization and sponsor data. See [Gasless Deposits](gasless-deposits.md).

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
| `buildResourceLockCalls(params)` | Build (not send) the Compact leg — returns `{ calls: [approve, depositERC20AndRegister], createAllocationRequest }` for you to batch |
| `submitAllocation(createAllocationRequest)` | Start solving after the deposit+register lands on-chain (no off-chain sponsor signature — `isRegisteredOnchain: true`) |

Contact Epoch before exposing Compact flows to end users. `buildResourceLockCalls` / `submitAllocation` are the **build-don't-send** split used by [Smart Withdraw](#smart-withdraw-headless); confirm your SDK build exposes them (`typeof sdk.buildResourceLockCalls === 'function'`) before relying on them.

---

## Gasless methods (testnet)

Available when using a gasless-enabled allocator (`GET /gasless-status` → `enabled: true`).

| Method | Purpose |
|--------|---------|
| `getWalletGaslessStatus(chainId)` | Probe delegation state, relay eligibility, `accountType`, setup needed |
| `convertToSmartAccount({ chainId })` | One-time smart-account enable for local signers (testnet) |
| `setupSmartAccount({ chainId })` | Legacy alias for smart-account enable |
| `ensureGaslessReady({ chainId, allowSetup? })` | Verify readiness; when `allowSetup: false`, does not auto-convert |
| `setupGaslessWallet({ chainId })` | Alias for smart-account setup |
| `gaslessDepositToCompact(...)` | Standalone relayed deposit (without full solve) |
| `revokeGaslessWallet({ chainId })` | Revoke smart-account delegation |

**Config / solve params**

| Field | Purpose |
|-------|---------|
| `allowGaslessSmartAccount?: boolean` | Opt in local-wallet gasless relay (config + `solveIntent`) |
| `gasless?: boolean` | Use relay when eligible; with `allowGaslessSmartAccount`, throws instead of wallet fallback |

**Exported helpers** (also available from package root):

```typescript
import {
  GaslessUnavailableError,
  getWalletGaslessStatus,
  GASLESS_SUPPORTED_CHAIN_IDS,
  shouldUseGaslessRelay,
  convertToSmartAccount,
  setupSmartAccount,
  ensureGaslessReady,
} from "@epoch-protocol/epoch-intents-sdk";
```

Local-wallet end-to-end test: `smallocator/sdk/test/local-wallet-gasless.ts` — run with `pnpm example:local-wallet`. See [Gasless Deposits](gasless-deposits.md) and [Transaction Batching & EIP-7702](transaction-batching-and-eip7702.md).

---

## Transaction batching (EIP-5792)

When multiple on-chain calls run on the same chain (Compact approve + deposit, or multi-tx intent execution), the SDK may batch them via `wallet_sendCalls` instead of separate `eth_sendTransaction` calls.

**Strategy probe:**

```typescript
import {
  canBatchCalls,
  resolveWalletBatchStrategy,
  executeWalletBatch,
} from "@epoch-protocol/epoch-intents-sdk";

const cap = await canBatchCalls(walletClient, chainId, userAddress, publicClient);
// { supported, atomic, mode: "atomic" | "sequential-tx" }
```

| `mode` | Meaning |
| ------ | ------- |
| `atomic` | Smart wallet active (7702 delegation or EIP-5792 atomic enabled) — one prompt, atomic batch |
| `sequential-tx` | Plain EOA or local wallet — separate transactions |

Local private-key wallets always use `sequential-tx` for deposits unless the gasless relay path is enabled. Injected wallets with an active smart account batch approve + deposit automatically inside `depositToCompact` and `solveIntent`.

**Execution status:** multi-leg batched flows report `phase: "batching"` via `onExecutionStatus`.

Full architecture, SIO relay flow, and test commands: [Transaction Batching & EIP-7702](transaction-batching-and-eip7702.md).

---

## Witness typestrings & Miden bridge

`getTaskData` assembles a full `taskTypeString` (base mandate fields + your `extraDataTypestring`). The allocator, SIO, and compact validation all receive that same `witnessTypeString` alongside mandate data.

### Canonical extra suffixes

Import from `@epoch-protocol/epoch-intents-sdk` (re-exported from `@epoch-protocol/epoch-commons-sdk`):

| Constant | Value | Use |
| -------- | ----- | --- |
| `MIDEN_TO_EVM_EXTRA_TYPESTRING` | `string midenSourceAccount,string midenFaucetId,string midenNoteType,string midenNoteId` | Miden → EVM bridge collateral |
| `EVM_TO_MIDEN_EXTRA_TYPESTRING` | `string midenRecipientAccount,string midenFaucetId` | EVM → Miden delivery |
| `DEPOSIT_EXTRADATA_TYPESTRING` | `string marketUid,string action,string payAsset,bool isAll` | Earn / lending deposit |
| `WITHDRAW_EXTRADATA_TYPESTRING` | `string marketUid,string action,string payAsset,bool isAll` | Earn / lending withdraw |

Compose lending + Miden by concatenating suffixes — protocol fields and Miden fields may appear in any order:

```typescript
import {
  DEPOSIT_EXTRADATA_TYPESTRING,
  MIDEN_TO_EVM_EXTRA_TYPESTRING,
} from "@epoch-protocol/epoch-intents-sdk";

const extraDataTypestring =
  `${DEPOSIT_EXTRADATA_TYPESTRING},${MIDEN_TO_EVM_EXTRA_TYPESTRING}`;
```

### Miden field inclusion (not exact suffix matching)

For Miden bridge intents, the witness must **declare and include** the required Miden fields for the detected direction. Additional protocol fields (earn `marketUid`, etc.) are allowed before or after the Miden block.

| Direction | Required in `extraDataTypestring` + `extraData` | Direction signal |
| --------- | ------------------------------------------------- | ---------------- |
| **Miden → EVM** | `midenSourceAccount`, `midenFaucetId`, `midenNoteType`, `midenNoteId` | `midenSourceAccount` set |
| **EVM → Miden** | `midenRecipientAccount`, `midenFaucetId` | `midenRecipientAccount` set and `midenSourceAccount` absent |

Do **not** set both `midenSourceAccount` and `midenRecipientAccount` on the same intent.

### Shared Miden helpers

Also exported from the SDK for client-side checks:

```typescript
import {
  isMidenIntent,
  isEVMToMidenIntent,
  isMidenToEvmIntent,
  getMidenMetadata,
} from "@epoch-protocol/epoch-intents-sdk";

// At least one of typestring or data must be provided
isMidenIntent(taskTypeString, intentData);
isEVMToMidenIntent(intentData); // recipient set, source absent
```

The allocator uses the same helpers from `epoch-commons-sdk` when routing Miden intents through quote, compact validation, and SIO.

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

## Smart Withdraw (headless)

**Smart Withdraw** = redeem a lending position and deliver the proceeds to a **different chain/token**, or to a **Miden** account, instead of the underlying on its native chain. It is **not one intent** — you compose two, then fuse them into a single EIP-5792 batch executed over a Compact resource lock. The [widget](widget-integration.md#smart-withdraw) does all of this for you in `mode="earn"`; this recipe is for headless integrations that build their own UI.

**Functions used, in order:**

| Step | SDK function(s) | Purpose |
|------|-----------------|---------|
| 1 | `getTaskData` + `getIntentQuote` — `TaskType.ProtocolInteraction` | Quote the **withdraw** leg → returns raw `withdraw(token, amount)` calldata in `transactions[]` (`resourceLockRequired: false`, a direct user tx) |
| 2 | `getTaskData` + `getIntentQuote` — `TaskType.GetTokenOut` | Quote the **swap/bridge** leg with a `minTokenOut` slippage floor (`resourceLockRequired: true`, solver-executed over the lock) |
| 3 | `buildResourceLockCalls(...)` | Build the Compact leg → `{ calls: [approve, depositERC20AndRegister], createAllocationRequest }` |
| 4 | `resolveWalletBatchStrategy` + `executeWalletBatch` | Fuse `[...withdrawTxs, ...lockCalls]` into one `wallet_sendCalls` (1 prompt), or fall back to sequential txs (N prompts) |
| 5 | `submitAllocation(createAllocationRequest)` | After the batch lands on-chain, start solving |
| 6 | `getIntentStatus(user, nonce)` | Poll to settlement |

```typescript
import { EpochIntentSDK, resolveWalletBatchStrategy, executeWalletBatch } from "@epoch-protocol/epoch-intents-sdk";
import { TaskType } from "@epoch-protocol/epoch-commons-sdk";

const sdk = new EpochIntentSDK({ apiBaseUrl, walletClient });

// 1 — withdraw position → underlying (direct calldata)
import { WITHDRAW_EXTRADATA_TYPESTRING } from "@epoch-protocol/epoch-intents-sdk";

const wTask = await sdk.getTaskData({
  taskType: TaskType.ProtocolInteraction,
  intentData: withdrawIntent,
  extraDataTypestring: WITHDRAW_EXTRADATA_TYPESTRING,
  extraData: {
    marketUid,
    action: "withdraw",
    payAsset: underlyingAddress,
    isAll: false, // set true to withdraw the entire position
  },
});
const wQuote = await sdk.getIntentQuote({ sponsorAddress, taskTypeString: wTask.taskTypeString, intentData: wTask.intentData, isNative: false });
const withdrawTxs = wQuote.transactions;                     // withdraw(token, amount)

// 2 — swap/bridge to the destination, with a slippage floor
const sTask  = await sdk.getTaskData({ taskType: TaskType.GetTokenOut, intentData: swapIntent, extraDataTypestring, extraData });
const sQuote = await sdk.getIntentQuote({ sponsorAddress, taskTypeString: sTask.taskTypeString, intentData: sTask.intentData, isNative: false });

// 3 — Compact resource-lock leg (build, don't send)
const { calls: lockCalls, createAllocationRequest } = await sdk.buildResourceLockCalls({
  isNative: false, sponsorAddress, taskTypeString: sTask.taskTypeString, intentData: sTask.intentData, quoteResult: sQuote,
});

// 4 — fuse the legs and execute
const calls = [
  ...withdrawTxs.map((t) => ({ to: t.target, data: t.callData, value: BigInt(t.value ?? "0") })),
  ...lockCalls,
];
const strategy = await resolveWalletBatchStrategy({ walletClient, chainId, user: sponsorAddress, publicClient });
if (strategy.mode === "sequential-tx") {
  for (const c of calls) { const hash = await walletClient.sendTransaction(c); await publicClient.waitForTransactionReceipt({ hash }); }
} else {
  await executeWalletBatch({ walletClient, chainId, account: sponsorAddress, calls, forceAtomic: strategy.mode === "atomic" });
}

// 5 + 6 — register is verified on-chain → start solving → poll
const { nonce } = await sdk.submitAllocation(createAllocationRequest);
// poll sdk.getIntentStatus(sponsorAddress, nonce) until settled
```

**Order matters:** the withdraw must fund the wallet before `depositERC20AndRegister` runs. In one atomic `wallet_sendCalls` this holds by construction; in the `sequential-tx` fallback you must `await` each receipt (as above). Only call `submitAllocation` **after** the batch lands — never submit an allocation for a batch that didn't execute.

**Miden destination.** For EVM→Miden, build the leg-2 `GetTokenOut` like the [Miden → EVM Lending](miden-lending.md) bridge shape — the EVM output slot is the zero sentinel and the real target rides in `extraData`:

```typescript
import { EVM_TO_MIDEN_EXTRA_TYPESTRING } from "@epoch-protocol/epoch-intents-sdk";

const swapIntent = {
  isNative: false,
  depositTokenAddress: underlyingAddress,
  tokenInAmount,
  outputTokenAddress: "0x0000000000000000000000000000000000000000", // zero sentinel — no EVM output token
  minTokenOut,
  destinationChainId: "999999999",                                  // Miden virtual chain id
  protocolHashIdentifier: "0x000…0",                                // ZERO_BYTES32
  recipient: sponsorAddress,
};
const extraDataTypestring = EVM_TO_MIDEN_EXTRA_TYPESTRING;
const extraData = { midenRecipientAccount, midenFaucetId };
```

Omitting `midenSourceAccount` is what flags the **EVM→Miden** direction to the allocator. You may append additional declared fields after the canonical Miden suffix when needed.

**Availability.** Everything except `buildResourceLockCalls` / `submitAllocation` is in the standard SDK. Those two are the resource-lock **build-don't-send** helpers (see [Compact-related methods](#compact-related-methods)); confirm your `@epoch-protocol/epoch-intents-sdk` build exposes them before shipping, and contact Epoch to enable Compact resource-lock flows.

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
