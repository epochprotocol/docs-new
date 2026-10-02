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

## Routing & liquidity options

Optional `routingAndLiquidityOptions` lets integrators choose **how** the swap is filled:

| Preset | When to use |
|--------|-------------|
| `any` | Default — best quote across all solvers |
| `filler-single-transaction` | Prefer Epoch filler liquidity — the user signs **one** transaction for seamless end-to-end execution (protocol interactions are handled behind the scenes) |
| `external-multi-transactions` | External aggregators only (multi-step signing) |
| `custom` | Pin specific solver address(es) |

Pass the **same** options to `getIntentQuote` and `solveIntent`:

```typescript
const routingAndLiquidityOptions = { preset: "filler-single-transaction" as const };

const quote = await sdk.getIntentQuote({
  sponsorAddress,
  taskTypeString,
  intentData,
  routingAndLiquidityOptions,
});

await sdk.solveIntent({ ...params, quoteResult: quote, routingAndLiquidityOptions });
```

See [SDK Reference](./sdk-reference.md#getintentquoteparams).

***

## Pin an external provider and a preferred Uniswap v4 pool

An application can constrain an external provider, destination pool, or both
through signed `extraData`. The signed fields survive the Compact witness, so
the selected provider and `PoolKey` used for quoting are the same ones used for
execution.

This Base Sepolia example chooses Sodax and a hooked Test USDC/Test USDT v4
fixture. It accepts any supported source asset, such as WETH on another chain:
the provider is quoted to the other PoolKey currency, then the destination v4
plan swaps that currency to the final output.

```typescript
import {
  DEX_POOLS_EXTRA_TYPESTRING,
  encodeDexPools,
  EXTERNAL_PROVIDER_EXTRA_TYPESTRING,
  type DexPoolPreference,
} from "@epoch-protocol/epoch-commons-sdk";

const provider = "sodax" as const;
const destinationChainId = "84532"; // Base Sepolia
const sourceWethAddress = "<WETH address on the source chain>";

const pool = {
  protocol: "uniswap-v4",
  chainId: 84532,
  poolKey: {
    currency0: "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69", // Test USDC
    currency1: "0xc04d2869665Be874881133943523723Be5782720", // Test USDT
    fee: 3000,
    tickSpacing: 60,
    hooks: "0xf892b81907d2b466E2bc469fD1097eb9424B40c0",
  },
  hookData:
    "0x70518dc220115fec722d1c344e307ec149ec2f25dc54c87a8908cb22e29867d1",
} satisfies DexPoolPreference;

const extraDataTypestring = [
  EXTERNAL_PROVIDER_EXTRA_TYPESTRING,
  DEX_POOLS_EXTRA_TYPESTRING,
].join(",");
const extraData = { provider, dexPools: encodeDexPools([pool]) };

const quote = await sdk.getIntentQuote({
  sponsorAddress,
  taskTypeString,
  intentData: {
    depositTokenAddress: sourceWethAddress,
    outputTokenAddress: pool.poolKey.currency1,
    destinationChainId,
    // Remaining task fields are configured as in the SDK Integration Guide.
  },
  extraDataTypestring,
  extraData,
  routingAndLiquidityOptions: { preset: "external-multi-transactions" },
});
```

For this example, the external provider delivers Test USDC on Base Sepolia and
the returned destination plan swaps Test USDC to Test USDT through the exact
hooked PoolKey. The source WETH is never treated as a v4 pool currency.

`PoolKey` identifies a v4 pool; there is no standalone v4 pool address. The
currencies must be sorted, `hookData` must match the hook's requirements, and
the pool's `chainId` must equal `destinationChainId`. Omit `provider` to compare
enabled external providers, or omit both signed preferences to use ordinary
automatic routing and v3 fallback.

***

## Chain and token selection

* Source chain: where the user's wallet is connected and input tokens exist.
* Destination chain: where output tokens are delivered (`destinationChainId`).
* Use token addresses from [Chains & Tokens](../supported-chains-and-tokens.md).

***

## Resource locks

If `quote.resourceLockRequired === true`, the intent requires Compact collateral. See [Core Concepts](../02-core-concepts.md#resource-locks-compact) and contact Epoch for Compact partner setup.

***

## Next steps

* [Protocol Interaction](protocol-interaction.md) — combine swap/bridge with on-chain actions
* [Error Handling](error-handling.md)
