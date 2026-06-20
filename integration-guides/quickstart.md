# Quickstart

Get a minimal Epoch integration running in your app.

## Prerequisites

* Node.js 18+
* A React (or similar) app with wallet connection — [wagmi](https://wagmi.sh) + [viem](https://viem.sh) recommended
* Epoch SDK `apiBaseUrl` — testnet: `https://testnet-dev.epochprotocol.xyz`

## Install

```bash
npm install @epoch-protocol/epoch-intents-sdk @epoch-protocol/epoch-commons-sdk viem
```

## Initialize the SDK

```typescript
import { EpochIntentSDK } from "@epoch-protocol/epoch-intents-sdk";
import { TaskType } from "@epoch-protocol/epoch-commons-sdk";
import { useWalletClient, useAccount } from "wagmi";

const EPOCH_API_BASE = "https://testnet-dev.epochprotocol.xyz"; // testnet

// Inside your component:
const { data: walletClient } = useWalletClient();
const { address } = useAccount();

const sdk = new EpochIntentSDK({
  apiBaseUrl: EPOCH_API_BASE,
  walletClient: walletClient!,
});
```

## Minimal flow: quote and solve

This example swaps toward a target token on a destination chain using `GetTokenOut`:

```typescript
import { parseUnits } from "viem";

const chainId = walletClient!.chain!.id;
const sponsorAddress = address as `0x${string}`;

// 1. Build task data
const { taskTypeString, intentData } = await sdk.getTaskData({
  taskType: TaskType.GetTokenOut,
  intentData: {
    isNative: false,
    depositTokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // example: USDC on Polygon
    tokenInAmount: parseUnits("10", 6).toString(),
    outputTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // example: USDC on Base
    minTokenOut: "0",
    destinationChainId: "8453",
    protocolHashIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
    recipient: sponsorAddress,
  },
  extraDataTypestring: "",
  extraData: {},
});

// 2. Get quote (show user before signing)
const quote = await sdk.getIntentQuote({
  sponsorAddress,
  taskTypeString,
  intentData,
  isNative: false,
});

if (!quote.success) {
  throw new Error("Quote failed");
}

console.log("Expected input:", quote.tokenIn);
console.log("Expected output:", quote.tokenOut);

// 3. Solve (user signs in wallet)
const result = await sdk.solveIntent({
  isNative: false,
  sponsorAddress,
  taskTypeString,
  intentData,
  quoteResult: quote,
});

console.log("Solve result:", result);

// 4. Poll status
const nonce = result?.allocationResponse?.nonce ?? result?.intentNonce;
if (nonce) {
  const status = await sdk.getIntentStatus(sponsorAddress, nonce.toString());
  console.log("Intent status:", status);
}
```

## Checklist

* [ ] Wallet connected on the **source chain** (where input tokens live)
* [ ] User has sufficient balance of the input token
* [ ] Token approval granted if the SDK requests it
* [ ] Quote shown to user before `solveIntent`
* [ ] Status polled until all transactions complete

## Testnet

Use testnet chain IDs and tokens from [Supported Chains & Tokens](../supported-chains-and-tokens.md). Set `apiBaseUrl` to `https://testnet-dev.epochprotocol.xyz`.

For testnet ERC-20 mints and a live Compact UI, use the [Epoch User Dashboard](https://userdashboard.epochprotocol.xyz/) ([source](https://github.com/epochprotocol/epoch-user-dashboard)).

## Next steps

* [SDK Integration Guide](sdk-integration-guide.md) — full patterns and checklist
* [SDK Reference](sdk-reference.md) — full method list
* [Swap & Bridge](swap-and-bridge.md) — forward and reverse quotes
* [Protocol Interaction](protocol-interaction.md) — cross-chain protocol actions
* [Error Handling](error-handling.md)
