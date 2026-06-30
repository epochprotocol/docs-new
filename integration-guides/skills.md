---
name: integrate-epoch
description: Integrates Epoch Protocol cross-chain intents into JavaScript/TypeScript projects using @epoch-protocol/epoch-intents-sdk (smallocator/sdk). Use when adding Epoch swaps, bridges, deposits, balance checks, or withdrawals; when the user mentions Epoch, smallocator, compact-demo-epoch, or testnet-dev.epochprotocol.xyz.
---

# Integrate Epoch

Add Epoch cross-chain intent flows to any JavaScript/TypeScript project using `@epoch-protocol/epoch-intents-sdk` from `smallocator/sdk`. Reference implementation: `compact-demo-epoch/`.

## When to Use

- User wants Epoch swaps, bridges, or protocol interactions
- Integrating `@epoch-protocol/epoch-intents-sdk` into React, Next.js, Vite, or Node.js
- Setting up testnet against `https://testnet-dev.epochprotocol.xyz`
- Mirroring patterns from `compact-demo-epoch/`

## Integration Checklist

```
- [ ] Install @epoch-protocol/epoch-intents-sdk, viem (peer dep)
- [ ] Set apiBaseUrl env var (testnet: https://testnet-dev.epochprotocol.xyz)
- [ ] Configure wallet client (viem or wagmi) on a supported chain
- [ ] Fetch allocator address from GET /health (do not hard-code)
- [ ] Implement: getTaskData → getIntentQuote → solveIntent → getIntentStatus
- [ ] Use testnetGraph/mainnetGraph for token/chain discovery
```

## Install

```bash
npm install @epoch-protocol/epoch-intents-sdk viem
# or link locally during development:
# "@epoch-protocol/epoch-intents-sdk": "file:../smallocator/sdk"
```

**Requirements:** Node.js 18+, TypeScript 5+, viem 2.x

**Local monorepo dev** (see `compact-demo-epoch/vite.config.ts`): alias to `smallocator/sdk/dist/index.js` and point `tsconfig` paths at `dist/index.d.ts`.

## Environment

```bash
# .env
VITE_API_BASE_URL=https://testnet-dev.epochprotocol.xyz   # Vite
NEXT_PUBLIC_EPOCH_API_BASE=https://testnet-dev.epochprotocol.xyz  # Next.js
EPOCH_API_BASE=https://testnet-dev.epochprotocol.xyz        # Node.js
```

Always read the allocator address from `GET /health` at runtime — do not rely on stale SDK constants.

## Testnet Quick Reference

| Item                     | Value                                        |
| ------------------------ | -------------------------------------------- |
| Allocator API (testnet)  | `https://testnet-dev.epochprotocol.xyz`      |
| Allocator API (mainnet)  | `https://api.epochprotocol.xyz`     |
| The Compact (all chains) | `0x00000000000000171ede64904551eeDF3C6C9788` |

**Testnet chains** (graph name → viem chain → chain ID):

| Graph name | Network          | Chain ID |
| ---------- | ---------------- | -------- |
| Mainnet    | Ethereum Sepolia | 11155111 |
| Base       | Base Sepolia     | 84532    |
| Optimism   | Optimism Sepolia | 11155420 |

| Symbol | Address                                      |
| ------ | -------------------------------------------- |
| USDC   | `0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69` |
| DAI    | `0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a` |
| USDT   | `0xc04d2869665Be874881133943523723Be5782720` |
| WETH   | `0x7946dd86eE310D0aC16804A37787289Fa5b88A8A` |
| WBTC   | `0x9b2a2754a9182fD65360E23afCDf3BeFF51796E9` |
| PENGU  | `0xEA7dC9849206Ce73b11c465d37b85eC06B11Cf2C` |
| OSWALD | `0xB588418c0f90F07Bc9587d0050845a90C23C7502` |
| KICK   | `0x512Ee6Bd7A4be5Ba4796F15Df080c4D0F89a38eD` |
| FERB   | `0x145e03A80c19ad1b9d0429d06b6d52707de724A0` |

Full chain/token tables and API details: [reference.md](reference.md)

## Core Intent Flow

```
GET /health
  → getTaskData({ taskType, intentData })
  → getIntentQuote({ sponsorAddress, taskTypeString, intentData })
  → solveIntent({ ...params, quoteResult, onExecutionStatus })
  → getIntentStatus(userAddress, nonce)
```

The SDK handles ERC-20 approval and Compact deposits automatically inside `solveIntent`.

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
// compact-demo-epoch/src/hooks/useAllocatorAPI.ts
const response = await fetch(`${apiBaseUrl}/health`);
const { allocatorAddress, chainConfig } = await response.json();
```

## Task Types

| Task            | Enum                           | Use case                        |
| --------------- | ------------------------------ | ------------------------------- |
| Swap / bridge   | `TaskType.GetTokenOut`         | Cross-chain token output        |
| Protocol action | `TaskType.ProtocolInteraction` | NFT buy, raffle, lending, etc.  |
| Deposit only    | `TaskType.Deposit`             | Lock funds without swap mandate |

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

## compact-demo-epoch File Map

| File                                      | Purpose                                |
| ----------------------------------------- | -------------------------------------- |
| `src/config/wagmi.ts`                     | Supported chains + RainbowKit          |
| `src/config/web3.ts`                      | Token/chain discovery from graphs      |
| `src/config/api.ts`                       | `VITE_API_BASE_URL` helper             |
| `src/hooks/useAllocatorAPI.ts`            | Health check, allocator address        |
| `src/pages/BalancePage.tsx`               | Full swap flow: quote → solve → status |
| `src/components/UserBalancesList.tsx`     | `getDepositedBalances`                 |
| `src/components/WalletWithdrawDialog.tsx` | Forced withdrawal flow                 |

## Common Mistakes

- Hard-coding allocator address instead of reading `/health`
- Submitting `solveIntent` without a prior `getIntentQuote`
- Wrong `destinationChainId` type — pass as **string** (e.g. `"84532"`)
- Using mainnet API URL on testnet chains (or vice versa)
- Forgetting viem `walletClient` must have `.chain` and `.account` set

## Additional Resources

- Full API endpoints, error handling, EIP-712 details: [reference.md](reference.md)
- SDK source guide: `smallocator/sdk/skills.md`
- Working demo: `compact-demo-epoch/`
