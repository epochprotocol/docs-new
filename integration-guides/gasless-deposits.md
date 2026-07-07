# Gasless Deposits (Testnet)

> **Architecture & batching:** For EIP-5792 transaction batching, SIO relay flow diagrams, batch strategy tables, and operator setup, see [Transaction Batching & EIP-7702](transaction-batching-and-eip7702.md).

On testnet, **gasless mode** lets users sign intent data without paying on-chain gas for the Compact deposit step. The Epoch allocator relays those transactions when gasless is enabled for your environment.

**User-facing rule:** when gasless is enabled, treat the **entire flow** as gasless. Do not tell end users that only part of the intent is sponsored.

Gasless is **testnet-only** today. Mainnet support is not documented here until explicitly announced.

***

## Who can use gasless relay

Gasless **relay** (allocator-sponsored gas via epoch-sio) is **local private-key wallets only**. Injected browser wallets do **not** use the relay — they may still **batch** approve + deposit in one prompt when the wallet is already a smart account, but the **user pays gas**.

| Integration | Gasless relay (SIO) | Batching (`wallet_sendCalls`) | Setup |
| ----------- | ------------------- | ----------------------------- | ----- |
| **Local private-key wallet** (scripts, agents, CI) | Yes — `convertToSmartAccount` + `allowGaslessSmartAccount: true` | Sequential txs, or relayed atomic batch on-chain | `convertToSmartAccount({ chainId })` once per EOA + chain |
| **Browser wallet** (MetaMask, Rainbow, …) | **No** — user pays gas | Yes — when wallet is already a smart account (7702 or atomic) | SDK does **not** prompt upgrade |
| **Widget** | Not supported | Not supported | Use SDK or [compact-demo-epoch](../integration-examples.md#compact-demo-epoch) |

Use `shouldUseGaslessRelay(walletClient)` — returns `true` only when `walletClient.account.type === "local"`.

***

## Injected wallets: batching (not gasless)

Browser wallets use **EIP-5792 batching** inside `depositToCompact` and `solveIntent` when the wallet strategy is `atomic`. This is **not** gasless relay — the user pays on-chain gas.

### Probe before showing UI

```typescript
import {
  canBatchCalls,
  resolveWalletBatchStrategy,
  getWalletGaslessStatus,
} from "@epoch-protocol/epoch-intents-sdk";

const strategy = await resolveWalletBatchStrategy({
  walletClient,
  chainId,
  user: account.address,
  publicClient,
});

const cap = await canBatchCalls(walletClient, chainId, account.address, publicClient);
const status = await sdk.getWalletGaslessStatus(chainId);

// Injected wallet expectations:
// strategy.mode === "atomic"     → one prompt (smart wallet active)
// strategy.mode === "sequential-tx" → separate prompts (plain EOA)
// status.accountType === "json-rpc"
// status.canRelayDeposit === false
```

### Submit with batching (user-paid gas)

```typescript
const result = await sdk.solveIntent({
  isNative: false,
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  gasless: false, // do not pass allowGaslessSmartAccount for browser wallets
  onExecutionStatus: (s) => {
    if (s.phase === "batching") {
      console.log("wallet_sendCalls batch in progress…");
    }
  },
});

// result.gaslessUsed is false/undefined — relay never runs for injected wallets
```

Passing `gasless: true` **without** `allowGaslessSmartAccount` on a browser wallet still executes wallet-paid transactions; batching applies when the wallet supports it. Do **not** label this path "gasless" in your UI.

### Batching edge cases (injected wallets)

| Scenario | What happens |
| -------- | ------------ |
| Plain EOA, no atomic capability | `sequential-tx` — approve and deposit are **two separate prompts**; user pays gas twice |
| Smart wallet active (7702 delegated or atomic enabled) | `atomic` — **one** `wallet_sendCalls` prompt; user **still pays gas** |
| User rejects atomic batch | SDK throws `TransactionError`; **no** gasless relay fallback |
| Batch RPC error (not user reject) | SDK may **fall back** to sequential `eth_sendTransaction` per call |
| USDT-style token (allowance reset required) | SDK may build `[approve(0), approve(N), deposit]` — batching depends on wallet limits |
| `gasless: true` + `allowGaslessSmartAccount: true` on injected wallet | Relay **ignored** (`shouldUseGaslessRelay` is false); user pays gas — misconfiguration if UI says "gasless" |
| Multi-leg intent (`resourceLockRequired: false`) | Contiguous same-chain txs batched via `executeWalletBatch` when `atomic`; `onExecutionStatus` reports `phase: "batching"` |
| `delegation === "other"` | Unsupported delegate bytecode — use a fresh EOA or revoke before local gasless relay |

The SDK **never** calls `convertToSmartAccount` for injected wallets. Smart-account upgrade must come from the wallet vendor, not your app.

**Reference script:** [`scripts/injected-wallet-batch-probe.ts`](../scripts/injected-wallet-batch-probe.ts)

***

## Supported chains

Verify live support before showing gasless UI:

```http
GET {apiBaseUrl}/gasless-status
```

Example response fields: `enabled`, `supportedChainIds`.

| Network | Chain ID |
| ------- | -------- |
| Base Sepolia | 84532 |
| Ethereum Sepolia | 11155111 |
| Optimism Sepolia | 11155420 |
| Polygon Amoy | 80002 |

***

## SDK integration (local private-key wallets)

**Package:** `@epoch-protocol/epoch-intents-sdk`

Gasless relay steps below apply **only** to local signers (`account.type === "local"`). Skip this section for MetaMask / Rainbow / wagmi injected clients — use [Injected wallets: batching](#injected-wallets-batching-not-gasless) instead.

### 1. Check wallet and chain support

```typescript
const status = await sdk.getWalletGaslessStatus(chainId);

if (!status.canRelayDeposit) {
  // Local: call convertToSmartAccount or fall back to gasless: false
  // Injected: expected — hide gasless relay UI
}
```

Useful fields: `delegation`, `needsSetup`, `canRelayDeposit`, `accountType` (`"local"` | `"json-rpc"`).

### 2. Enable smart account (local wallets only)

Call once per EOA and chain before the first gasless solve. The user signs an authorization; the allocator broadcasts setup via epoch-sio.

```typescript
const setup = await sdk.convertToSmartAccount({ chainId: 84532 });
if (!setup.ok) {
  throw new Error(setup.reason ?? "Smart account setup failed");
}

// Legacy alias — still supported
await sdk.setupSmartAccount({ chainId: 84532 });
```

`solveIntent` does **not** auto-convert EOAs. If you pass `allowGaslessSmartAccount: true` without prior setup, the SDK throws `GaslessUnavailableError`.

**Do not call `convertToSmartAccount` for injected wallets** — it is designed for local private-key signers in scripts and backend flows.

### 3. Submit a gasless intent (local wallets only)

```typescript
const result = await sdk.solveIntent({
  isNative: false,
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  gasless: true,
  allowGaslessSmartAccount: true, // required — local private-key wallets only
  onExecutionStatus: (s) => console.log(s.phase),
});

if (result.gaslessUsed) {
  console.log("Deposit relayed — user did not pay gas");
}
```

Optional config default:

```typescript
new EpochIntentSDK({
  apiBaseUrl,
  walletClient, // must be local account (privateKeyToAccount + createWalletClient)
  allowGaslessSmartAccount: true,
  gaslessDefault: false,
});
```

### Parameter reference

| Param | Local private-key | Injected browser wallet |
| ----- | ----------------- | ----------------------- |
| `gasless: true` + `allowGaslessSmartAccount: true` | SIO gasless relay; throws on failure (no wallet-paid fallback) | Relay **not used**; wallet-paid execution |
| `gasless: true` (no `allowGaslessSmartAccount`) | Wallet-paid sequential txs | Wallet-paid; batch when smart wallet active |
| `gasless: false` | Standard wallet-paid deposit | Standard wallet-paid deposit |
| omitted | Uses `gaslessDefault` from SDK config | Uses `gaslessDefault` from SDK config |

### Errors

| Error | What to do |
| ----- | ---------- |
| `GaslessUnavailableError` | Chain not enabled, smart account not set up, or relay unavailable — call `convertToSmartAccount` (local only) or fall back to `gasless: false` |
| `INTENT_TASK_INVALID` | Swap intents need different `tokenIn` and `tokenOut` (e.g. USDC → DAI, not USDC → USDC) |
| `NO_QUOTE_AVAILABLE` | Retry quote; confirm tokens are supported on the testnet graph |

See [Error Handling](error-handling.md).

***

## End-to-end test scripts

### Local wallet — gasless relay

Use the SDK example to validate your integration against a gasless-enabled allocator:

**Script:** `smallocator/sdk/test/local-wallet-gasless.ts`

#### Setup

Create `smallocator/sdk/.env.local` (do not commit private keys):

```bash
GASLESS_API_BASE_URL=https://testnet-dev.epochprotocol.xyz
# Or your local allocator: http://localhost:3000

GASLESS_CHAIN_ID=84532
GASLESS_RPC_URL=https://sepolia.base.org
GASLESS_PRIVATE_KEY=0x...   # funded test EOA on Base Sepolia

# Swap intent — tokenIn and tokenOut must differ
INTENT_TOKEN_IN=0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69   # USDC Base Sepolia
INTENT_TOKEN_OUT=0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a  # DAI Base Sepolia
INTENT_AMOUNT_IN=1
INTENT_TOKEN_DECIMALS=18
INTENT_DEST_CHAIN_ID=84532
```

Fund the test wallet with testnet ETH. Point `GASLESS_API_BASE_URL` at an allocator with gasless enabled.

#### Run

```bash
cd smallocator/sdk
pnpm build
pnpm example:local-wallet
```

On success:

```text
=== PASS === Local wallet gasless flow complete.
```

Optional env flags:

| Env | Effect |
| --- | ------ |
| `SKIP_SETUP=1` | Skip smart-account setup; probe + intent only |
| `SKIP_INTENT=1` | Setup + verify only |

#### What the script demonstrates

```typescript
const sdk = new EpochIntentSDK({ apiBaseUrl, walletClient }); // local account

await sdk.getWalletGaslessStatus(chainId);
await sdk.convertToSmartAccount({ chainId });
await sdk.verifySmartAccountWorks({ chainId });

const quoteResult = await sdk.getIntentQuote({
  sponsorAddress,
  taskTypeString,
  intentData,
  isNative: false,
});

const result = await sdk.solveIntent({
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  gasless: true,
  allowGaslessSmartAccount: true,
});

await sdk.getIntentStatus(account.address, result.nonce!);
```

Other example: `pnpm example:gasless` (`test/integration-gasless-example.ts`).

### Injected wallet — batch probe

**Script:** [`scripts/injected-wallet-batch-probe.ts`](../scripts/injected-wallet-batch-probe.ts)

Copy into a wagmi React app (see [compact-demo-epoch](../integration-examples.md#compact-demo-epoch)). Probes `resolveWalletBatchStrategy`, `canBatchCalls`, and `getWalletGaslessStatus`, then runs `solveIntent` **without** `allowGaslessSmartAccount`.

Compare outcomes:

| Wallet state | Expected `strategy.mode` | Prompts | Gas payer |
| ------------ | ------------------------ | ------- | --------- |
| Plain EOA | `sequential-tx` | 2+ (approve, deposit) | User |
| Smart wallet active | `atomic` | 1 (`wallet_sendCalls`) | User |
| Local private key + gasless | N/A (use local script) | Sign only (relay) | Relayer |

***

## Reference UI

[compact-demo-epoch](../integration-examples.md#compact-demo-epoch) demonstrates gasless in a React app with a **local-signer tab** for relay testing. The browser wallet tab uses batching when available — not gasless relay. The widget package does **not** expose gasless mode.

***

## Next steps

* [SDK Integration Guide](sdk-integration-guide.md) — full integration checklist
* [Transaction Batching & EIP-7702](transaction-batching-and-eip7702.md) — architecture, batch strategy, SIO relay, test scripts
* [SDK Reference](sdk-reference.md) — method signatures
* [Supported Chains & Tokens](../supported-chains-and-tokens.md) — testnet tokens and chain IDs
* [Scripts](../scripts/README.md) — reference integration scripts
* [Gasless & batching skill](../.cursor/skills/epoch-gasless-batching/SKILL.md) — Cursor agent skill
