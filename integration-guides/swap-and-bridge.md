# Swap & Bridge Integration

Use **`TaskType.GetTokenOut`** for cross-chain swaps and bridges where the user receives a target token on a destination chain.

***

## When to use each pattern

| User goal                                               | Task type                              | Amount pattern                                         |
| ------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| Swap token A → token B on another chain                 | `GetTokenOut`                          | Forward quote: set `tokenInAmount`                     |
| Bridge same asset to another chain                      | `GetTokenOut`                          | Forward quote: set `tokenInAmount`                     |
| Receive exact output (e.g. pay exactly 50 USDC on Base) | `GetTokenOut` or `ProtocolInteraction` | Reverse quote: `tokenInAmount: "0"`, set `minTokenOut` |

***

## Forward quote

User specifies how much they want to **spend**:

```typescript
const { taskTypeString, intentData } = await sdk.getTaskData({
  taskType: TaskType.GetTokenOut,
  intentData: {
    isNative: false,
    depositTokenAddress: SOURCE_USDC,
    tokenInAmount: parseUnits("100", 6).toString(),  // user spends 100 USDC
    outputTokenAddress: DEST_USDC,
    minTokenOut: "0",                               // accept any output >= 0
    destinationChainId: "8453",
    protocolHashIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
    recipient: sponsorAddress,
  },
  extraDataTypestring: "",
  extraData: {},
});
```

Display `quote.tokenOut` to the user as the expected receive amount.

***

## Reverse quote

User needs an **exact output**; Epoch computes the required input:

```typescript
const { taskTypeString, intentData } = await sdk.getTaskData({
  taskType: TaskType.GetTokenOut,
  intentData: {
    isNative: false,
    depositTokenAddress: SOURCE_USDC,
    tokenInAmount: "0",                             // backend computes input
    outputTokenAddress: DEST_TOKEN,
    minTokenOut: parseUnits("50", 6).toString(),    // user must receive exactly 50
    destinationChainId: "8453",
    protocolHashIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
    recipient: sponsorAddress,
  },
  extraDataTypestring: "",
  extraData: {},
});

const quote = await sdk.getIntentQuote({ sponsorAddress, taskTypeString, intentData, isNative: false });
// Display quote.tokenIn as "You will pay approximately X USDC"
```

Reverse quotes are **required** for fixed-price purchases (raffle tickets, exact payment amounts).

***

## Approvals

Before or during `solveIntent`, the user may need to approve the input token on the source chain. The SDK returns approval transactions when needed.

Your UI should:

1. Detect when approval is required (from quote or solve response).
2. Prompt the user to sign the approval transaction.
3. Proceed to the main intent solve after approval confirms.

Ensure the wallet is on the **source chain** before signing.

***

## Displaying quotes

Show the user:

| Field                 | Label suggestion                           |
| --------------------- | ------------------------------------------ |
| `quote.tokenIn`       | "You pay"                                  |
| `quote.tokenInSymbol` | Token symbol                               |
| `quote.tokenOut`      | "You receive"                              |
| `quote.path`          | Optional: "Route" (human-readable summary) |
| Slippage / fees       | If exposed in quote response               |

Always require explicit user confirmation before calling `solveIntent`.

***

## Chain and token selection

* Source chain: where the user's wallet is connected and input tokens exist.
* Destination chain: where output tokens are delivered (`destinationChainId`).
* Use token addresses from [Chains & Tokens](../appendices/chains-and-tokens.md).

***

## Resource locks

If `quote.resourceLockRequired === true`, the intent requires Compact collateral. See [Core Concepts](../02-core-concepts.md#resource-locks-compact) and contact Epoch for Compact partner setup.

***

## Next steps

* [Protocol Interaction](protocol-interaction.md) — combine swap/bridge with on-chain actions
* [Error Handling](error-handling.md)
