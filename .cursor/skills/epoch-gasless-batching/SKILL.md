---
name: epoch-gasless-batching
description: >-
  Implements Epoch testnet gasless Compact deposits and EIP-5792 wallet batching
  with @epoch-protocol/epoch-intents-sdk. Use when integrating gasless deposits,
  EIP-7702 smart accounts, wallet_sendCalls batching, injected vs local signers,
  convertToSmartAccount, allowGaslessSmartAccount, or MetaMask/Rainbow batch flows.
---

# Epoch Gasless & Wallet Batching

Guide for **gasless SIO relay** (local private-key only) vs **EIP-5792 batching** (injected wallets, user-paid gas).

## Core rule

| Wallet | Gasless relay (SIO) | Batching | Gas payer |
| ------ | ------------------- | -------- | --------- |
| Local private key (`account.type === "local"`) | Yes | Sequential txs or relayed on-chain batch | Relayer |
| Injected browser (`json-rpc`, wagmi) | **No** | `wallet_sendCalls` when smart wallet active | **User** |

`shouldUseGaslessRelay(walletClient)` returns `true` only for local signers.

**Never** call `convertToSmartAccount` for injected wallets. **Never** show "gasless" UI for browser wallets unless the wallet vendor sponsors gas separately.

## Decision workflow

```
1. Detect wallet type
   walletClient.account.type === "local"  → gasless relay path possible
   json-rpc / wagmi injected              → batching only, user pays gas

2. Probe capabilities
   const status = await sdk.getWalletGaslessStatus(chainId);
   const cap = await canBatchCalls(walletClient, chainId, user, publicClient);
   const strategy = await resolveWalletBatchStrategy({ walletClient, chainId, user, publicClient });

3. Choose path
   Local + gasless relay  → convertToSmartAccount once, then solveIntent with allowGaslessSmartAccount
   Injected               → solveIntent without allowGaslessSmartAccount; batch if strategy.mode === "atomic"
```

## Local private-key — gasless relay (testnet)

One-time setup per EOA + chain, then strict relay (throws on failure, no wallet fallback):

```typescript
const sdk = new EpochIntentSDK({
  apiBaseUrl: "https://testnet-dev.epochprotocol.xyz",
  walletClient, // privateKeyToAccount + createWalletClient, account.type === "local"
  allowGaslessSmartAccount: true,
});

const status = await sdk.getWalletGaslessStatus(chainId);
if (!status.canRelayDeposit) {
  const setup = await sdk.convertToSmartAccount({ chainId });
  if (!setup.ok) throw new Error(setup.reason ?? "Smart account setup failed");
}

const result = await sdk.solveIntent({
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  isNative: false,
  gasless: true,
  allowGaslessSmartAccount: true,
});

// result.gaslessUsed === true when relay succeeded
```

**Smoke test:** `cd smallocator/sdk && pnpm example:local-wallet` (`test/local-wallet-gasless.ts`).

## Injected wallet — batching (not gasless)

Probe before UI; do **not** pass `allowGaslessSmartAccount`:

```typescript
const strategy = await resolveWalletBatchStrategy({
  walletClient, chainId, user: account.address, publicClient,
});
const status = await sdk.getWalletGaslessStatus(chainId);
// Expect: accountType "json-rpc", canRelayDeposit false, canRelayEnable false

const result = await sdk.solveIntent({
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  isNative: false,
  gasless: false,
  onExecutionStatus: (s) => {
    if (s.phase === "batching") console.log("wallet_sendCalls batch…");
  },
});
// result.gaslessUsed is false/undefined
```

**Reference script:** `scripts/injected-wallet-batch-probe.ts` (copy into wagmi app).

## Batch strategy matrix

| Condition | `strategy.mode` | UX |
| --------- | --------------- | -- |
| Local private key | `sequential-tx` | Sequential txs, or gasless relay when configured |
| Injected plain EOA | `sequential-tx` | Approve + deposit = **two prompts** |
| Injected smart wallet (7702 or atomic) | `atomic` | **One** `wallet_sendCalls` prompt; user pays gas |

## Injected wallet edge cases

Handle these in UI copy and error paths:

1. **Plain EOA** — two prompts, user pays gas twice; expected, not a bug.
2. **Smart wallet active** — one atomic batch; still user-paid (not gasless relay).
3. **User rejects batch** — `TransactionError`; no gasless fallback.
4. **Batch RPC failure** — SDK may fall back to sequential `eth_sendTransaction`.
5. **USDT-style tokens** — may need `[approve(0), approve(N), deposit]`; batching wallet-dependent.
6. **`gasless: true` + `allowGaslessSmartAccount` on injected** — relay ignored; misconfiguration if UI says "gasless".
7. **`delegation === "other"`** — unsupported delegate; fresh EOA or revoke before local gasless.
8. **Multi-leg intents** — contiguous same-chain txs batched when atomic; `onExecutionStatus` phase `"batching"`.

## Parameter reference

| Param | Local private key | Injected |
| ----- | ----------------- | -------- |
| `gasless: true` + `allowGaslessSmartAccount: true` | SIO relay; throws on failure | Relay **not used** |
| `gasless: true` (no allow flag) | Wallet-paid sequential | Wallet-paid; batch if atomic |
| `gasless: false` | Standard deposit | Standard deposit |

## Common mistakes

- Calling `convertToSmartAccount` for MetaMask/Rainbow users
- Showing "gasless" for injected wallets when `canRelayDeposit === false`
- Expecting one prompt on plain EOA (needs smart wallet or atomic capability)
- Using `allowGaslessSmartAccount: true` without prior local setup → `GaslessUnavailableError`
- Swap intents with same `tokenIn` and `tokenOut` → `INTENT_TASK_INVALID`

## Verification checklist

```
- [ ] GET /gasless-status — chain enabled before gasless UI
- [ ] getWalletGaslessStatus — accountType matches wallet (local vs json-rpc)
- [ ] Local path: convertToSmartAccount before first gasless solve
- [ ] Injected path: no allowGaslessSmartAccount; probe canBatchCalls for UI hints
- [ ] result.gaslessUsed only true for local relay path
- [ ] onExecutionStatus handles phase "batching" for multi-leg flows
```

## Key SDK exports

```typescript
import {
  EpochIntentSDK,
  canBatchCalls,
  resolveWalletBatchStrategy,
  shouldUseGaslessRelay,
  convertToSmartAccount,
  GaslessUnavailableError,
  GASLESS_SUPPORTED_CHAIN_IDS,
} from "@epoch-protocol/epoch-intents-sdk";
```

## Docs & scripts in this repo

| Resource | Path |
| -------- | ---- |
| Gasless integrator guide | `integration-guides/gasless-deposits.md` |
| Batching & SIO architecture | `integration-guides/transaction-batching-and-eip7702.md` |
| Injected batch probe script | `scripts/injected-wallet-batch-probe.ts` |
| Local gasless smoke test | `smallocator/sdk/test/local-wallet-gasless.ts` |
| SDK unit tests | `smallocator/sdk/test/gasless-helpers.test.ts`, `batching.test.ts` |
| Demo UI | `compact-demo-epoch` — local signer tab for gasless; browser tab for batching |

## Supported testnet chains (gasless relay)

84532 (Base Sepolia), 11155111 (Sepolia), 11155420 (Optimism Sepolia), 80002 (Polygon Amoy).

Verify live: `GET {apiBaseUrl}/gasless-status`.
