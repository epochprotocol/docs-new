# SDK Integration Guide

Add Epoch cross-chain intent flows to any JavaScript/TypeScript project using `@epoch-protocol/epoch-intents-sdk`. Reference implementation: [compact-demo-epoch](../integration-examples.md#compact-demo-epoch).

> This guide is adapted from [skills.md](skills-md.md).

***

## Integration Checklist

```
- [ ] Install @epoch-protocol/epoch-intents-sdk, viem (peer dep)
- [ ] Set apiBaseUrl env var (testnet: https://testnet-dev.epochprotocol.xyz)
- [ ] Configure wallet client (viem or wagmi) on a supported chain
- [ ] Fetch allocator address via sdk.getHealthCheck() (do not hard-code)
- [ ] Implement: getTaskData → getIntentQuote → solveIntent → getIntentStatus
- [ ] Use testnetGraph/mainnetGraph for token/chain discovery
- [ ] (Optional, testnet) Gasless Compact deposits: setupSmartAccount → solveIntent({ gasless: true }) — see [Gasless Deposits](gasless-deposits.md)
```

***

## Install

```bash
npm install @epoch-protocol/epoch-intents-sdk viem
```

**Requirements:** Node.js 18+, TypeScript 5+, viem 2.x

***

## Environment

```bash
# .env
VITE_API_BASE_URL=https://testnet-dev.epochprotocol.xyz   # Vite
NEXT_PUBLIC_EPOCH_API_BASE=https://testnet-dev.epochprotocol.xyz  # Next.js
EPOCH_API_BASE=https://testnet-dev.epochprotocol.xyz        # Node.js
```

Always read the allocator address at runtime via `sdk.getHealthCheck()` — do not rely on stale SDK constants.

***

## APIs Quick Reference

<table><thead><tr><th width="270.38671875">Item</th><th>Value</th></tr></thead><tbody><tr><td>SDK <code>apiBaseUrl</code> (testnet)</td><td><code>https://testnet-dev.epochprotocol.xyz</code></td></tr><tr><td>SDK <code>apiBaseUrl</code> (mainnet)</td><td><code>https://api.epochprotocol.xyz</code></td></tr></tbody></table>

Full chain and token tables: [Supported Chains & Tokens](../supported-chains-and-tokens.md).

***

## Core Intent Flow

```
→ getHealthCheck()
→ getTaskData({ taskType, intentData })
→ getIntentQuote({ sponsorAddress, taskTypeString, intentData, routingAndLiquidityOptions? })
→ solveIntent({ ...params, quoteResult, routingAndLiquidityOptions?, onExecutionStatus })
→ getIntentStatus(userAddress, nonce)
```

The SDK handles ERC-20 approval and Compact deposits automatically inside `solveIntent`.

***

## Vanilla TypeScript (Node / any JS)

```typescript
import { EpochIntentSDK, TaskType } from "@epoch-protocol/epoch-intents-sdk";
import { createWalletClient, http, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
  account,
});

const sdk = new EpochIntentSDK({
  apiBaseUrl: process.env.EPOCH_API_BASE!,
  walletClient,
});

// 1. Health check
const health = await sdk.getHealthCheck();
console.log("Allocator:", health.allocatorAddress);

// 2. Build task data
const { taskTypeString, intentData } = await sdk.getTaskData({
  taskType: TaskType.GetTokenOut,
  intentData: {
    isNative: false,
    depositTokenAddress: "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69", // USDC
    tokenInAmount: parseUnits("100", 18).toString(),
    outputTokenAddress: "0x7946dd86eE310D0aC16804A37787289Fa5b88A8A", // WETH
    minTokenOut: parseUnits("0.05", 18).toString(),
    destinationChainId: "11155111", // Sepolia
    protocolHashIdentifier:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    recipient: account.address,
  },
  extraDataTypestring: "uint256 somethingKey",
  extraData: { somethingKey: "123" },
});

// 3. Quote
const quoteResult = await sdk.getIntentQuote({
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  isNative: false,
});

// 4. Solve (deposit + register + submit intent)
const result = await sdk.solveIntent({
  isNative: false,
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  onExecutionStatus: (s) => console.log(s.phase, s.transactionHash),
});

const nonce = result.allocationResponse?.nonce;

// 5. Poll status
if (nonce) {
  const status = await sdk.getIntentStatus(account.address, nonce);
  console.log(status);
}
```

See [epoch-integration-demo](../integration-examples.md#epoch-integration-demo) for a runnable Node.js script.

### Routing & liquidity options (optional)

Use `routingAndLiquidityOptions` when you want to control **how** the swap is filled — single-transaction filler liquidity (one user signature, seamless end-to-end execution including protocol interactions) vs multi-transaction external routing vs best-of-all.

```typescript
import type { RoutingAndLiquidityOptions } from "@epoch-protocol/epoch-intents-sdk";

const routingAndLiquidityOptions: RoutingAndLiquidityOptions = {
  preset: "filler-single-transaction",
};

const quoteResult = await sdk.getIntentQuote({
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  routingAndLiquidityOptions,
});

await sdk.solveIntent({
  isNative: false,
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  routingAndLiquidityOptions, // same as quote
});
```

Presets: `any` (default), `filler-single-transaction` (one transaction, seamless end-to-end execution for the user — protocol interactions handled by the filler), `external-multi-transactions`, `custom` (with `solvers: [\`0x…\`]`). See [SDK Reference](./sdk-reference.md#getintentquoteparams).

***

## React + wagmi Pattern (from compact-demo-epoch)

### 1. Wagmi chains

Configure viem testnet/mainnet chains in wagmi config (`compact-demo-epoch/src/config/wagmi.ts`):

```typescript
import {
  sepolia,
  baseSepolia,
  optimismSepolia,
  base,
  optimism,
  polygon,
  arbitrum,
} from "viem/chains";

export const chains = [
  sepolia,
  baseSepolia,
  optimismSepolia,
  polygon,
  arbitrum,
  base,
  optimism,
] as const;
```

### 2. Token/chain discovery from SDK graphs

```typescript
import { mainnetGraph, testnetGraph } from "@epoch-protocol/epoch-intents-sdk";

// compact-demo-epoch/src/config/web3.ts pattern:
// - Pick graph by chainId (mainnet vs testnet)
// - getTokensForChain(chainId) → { symbol, address, decimals }[]
// - getChainsFromGraph(chainId) → destination chain options
```

### 3. Instantiate SDK per action

```typescript
import { useWalletClient } from "wagmi";
import { EpochIntentSDK, TaskType } from "@epoch-protocol/epoch-intents-sdk";

const { data: walletClient } = useWalletClient();

const sdk = new EpochIntentSDK({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  walletClient: walletClient as any,
});
```

### 4. Swap submit (compact-demo-epoch/src/pages/BalancePage.tsx)

1. `getTaskData` with `TaskType.GetTokenOut`
2. `getIntentQuote` — store `quoteResult`
3. `solveIntent` with `quoteResult` and `onExecutionStatus` callback
4. Save `data.allocationResponse.nonce` for status polling
5. `getIntentStatus(address, nonce)`

### 5. Compact balances & withdrawals

```typescript
// compact-demo-epoch/src/components/UserBalancesList.tsx
const results = await sdk.getDepositedBalances(address, tokenInputs);

// compact-demo-epoch/src/components/WalletWithdrawDialog.tsx
await sdk.initateDepositWithdrawal(depositId);
await sdk.withdrawToken(depositId, recipient, amountWei);
await sdk.disableForcedWithdrawal(depositId);
```

### 6. Health / allocator address

```typescript
const health = await sdk.getHealthCheck();
const { allocatorAddress, chainConfig } = health;
```

### 7. Gasless Compact deposits (testnet, optional)

For local signers or custom UIs that opt into relay-sponsored deposits:

```typescript
// One-time per EOA on a gasless-enabled chain
await sdk.setupSmartAccount({ chainId: 84532 });

const result = await sdk.solveIntent({
  // ...standard solve params
  quoteResult,
  gasless: true,
});

if (result.gaslessUsed) {
  console.log("Deposit relayed — user did not pay gas for approve + deposit");
}
```

Probe before showing UI:

```typescript
const status = await sdk.getWalletGaslessStatus(chainId);
```

Full guide: [Gasless Deposits](gasless-deposits.md).

***

## Task Types

| Task            | Enum                           | Use case                        |
| --------------- | ------------------------------ | ------------------------------- |
| Swap / bridge   | `TaskType.GetTokenOut`         | Cross-chain token output        |
| Protocol action | `TaskType.ProtocolInteraction` | NFT buy, raffle, lending, etc.  |
| Deposit only    | `TaskType.Deposit`             | Lock funds without swap mandate |

***

## Key SDK Exports

```typescript
import {
  EpochIntentSDK,
  TaskType,
  CollateralType,
  COMPACT_ADDRESS,
  SUPPORTED_CHAINS,
  mainnetGraph,
  testnetGraph,
  createLockTag,
  getTokenId,
  getAllocatorId,
} from "@epoch-protocol/epoch-intents-sdk";
```

***

## compact-demo-epoch File Map

| File                                      | Purpose                                |
| ----------------------------------------- | -------------------------------------- |
| `src/config/wagmi.ts`                     | Supported chains + RainbowKit          |
| `src/config/web3.ts`                      | Token/chain discovery from graphs      |
| `src/config/api.ts`                       | `VITE_API_BASE_URL` helper             |
| `src/hooks/useAllocatorAPI.ts`            | Health check, allocator address        |
| `src/hooks/useEffectiveWallet.ts`           | Browser wallet + local signer          |
| `src/hooks/useGaslessWallet.ts`             | Gasless probe + smart-account setup    |
| `src/components/GaslessEnableButton.tsx`    | Gasless toggle UI                      |
| `src/components/WalletConnect.tsx`          | RainbowKit + local signer form         |
| `src/pages/BalancePage.tsx`               | Quote → solve (`gasless`) → status     |
| `src/components/UserBalancesList.tsx`     | `getDepositedBalances`                 |
| `src/components/WalletWithdrawDialog.tsx` | Forced withdrawal flow                 |

***

## Common Mistakes

* Hard-coding allocator address instead of calling `getHealthCheck()`
* Submitting `solveIntent` without a prior `getIntentQuote`
* Wrong `destinationChainId` type — pass as **string** (e.g. `"84532"`)
* Using mainnet `apiBaseUrl` on testnet chains (or vice versa)
* Forgetting viem `walletClient` must have `.chain` and `.account` set

***

## Next steps

* [SDK Reference](sdk-reference.md) — full method documentation
* [Gasless Deposits](gasless-deposits.md) — EIP-7702 testnet relay
* [Error Handling](error-handling.md)
* [Integration Examples](../integration-examples.md)
