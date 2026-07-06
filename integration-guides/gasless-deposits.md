# Gasless Deposits (Testnet)

On testnet, **gasless mode** lets users sign intent data without paying on-chain gas for the Compact deposit step. The Epoch allocator relays those transactions when gasless is enabled for your environment.

**User-facing rule:** when gasless is enabled, treat the **entire flow** as gasless. Do not tell end users that only part of the intent is sponsored.

Gasless is **testnet-only** today. Mainnet support is not documented here until explicitly announced.

***

## Who can use gasless

| Integration | How |
| ----------- | --- |
| **Local private-key wallet** (scripts, agents, CI) | One-time `convertToSmartAccount`, then `solveIntent({ gasless: true, allowGaslessSmartAccount: true })` |
| **Browser wallet** (MetaMask, Rainbow, …) | Wallet-native batching when the user already has a smart wallet; SDK does not prompt upgrade |
| **Widget** | Not supported — use the SDK or [compact-demo-epoch](../integration-examples.md#compact-demo-epoch) |

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

## SDK integration

**Package:** `@epoch-protocol/epoch-intents-sdk`

### 1. Check wallet and chain support

```typescript
const status = await sdk.getWalletGaslessStatus(chainId);

if (!status.canRelayDeposit) {
  // Hide gasless option or show setup instructions
}
```

Useful fields: `delegation`, `needsSetup`, `canRelayDeposit`, `accountType` (`"local"` | `"json-rpc"`).

### 2. Enable smart account (local wallets only)

Call once per EOA and chain before the first gasless solve. The user signs an authorization; the allocator broadcasts setup.

```typescript
const setup = await sdk.convertToSmartAccount({ chainId: 84532 });
if (!setup.ok) {
  throw new Error(setup.reason ?? "Smart account setup failed");
}

// Legacy alias — still supported
await sdk.setupSmartAccount({ chainId: 84532 });
```

`solveIntent` does **not** auto-convert EOAs. If you pass `allowGaslessSmartAccount: true` without prior setup, the SDK throws `GaslessUnavailableError`.

### 3. Submit a gasless intent

```typescript
const result = await sdk.solveIntent({
  isNative: false,
  sponsorAddress: account.address,
  taskTypeString,
  intentData,
  quoteResult,
  gasless: true,
  allowGaslessSmartAccount: true, // required for local private-key wallets
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
  walletClient,
  allowGaslessSmartAccount: true,
  gaslessDefault: false,
});
```

### Parameter reference

| Param | Behavior |
| ----- | -------- |
| `gasless: true` + `allowGaslessSmartAccount: true` | Local wallet: use gasless relay; throw on failure (no silent fallback to wallet-paid gas) |
| `gasless: true` (browser wallet, no allow flag) | Wallet-paid execution; batch when the wallet already supports it |
| `gasless: false` | Standard wallet-paid deposit |
| omitted | Uses `gaslessDefault` from SDK config |

### Browser wallets

The SDK **does not** ask injected wallets to upgrade to a smart account. If the wallet is already a smart wallet, approve + deposit may batch in one prompt. Otherwise transactions run sequentially and the user pays gas.

Gasless **relay** (allocator-sponsored gas) is intended for **local signers** in scripts and backend flows.

### Errors

| Error | What to do |
| ----- | ---------- |
| `GaslessUnavailableError` | Chain not enabled, smart account not set up, or relay unavailable — call `convertToSmartAccount` or fall back to `gasless: false` |
| `INTENT_TASK_INVALID` | Swap intents need different `tokenIn` and `tokenOut` (e.g. USDC → DAI, not USDC → USDC) |
| `NO_QUOTE_AVAILABLE` | Retry quote; confirm tokens are supported on the testnet graph |

See [Error Handling](error-handling.md).

***

## End-to-end test script

Use the SDK example to validate your integration against a gasless-enabled allocator:

**Script:** `smallocator/sdk/test/local-wallet-gasless.ts`

### Setup

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

### Run

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

### What the script demonstrates

```typescript
const sdk = new EpochIntentSDK({ apiBaseUrl, walletClient });

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

***

## Reference UI

[compact-demo-epoch](../integration-examples.md#compact-demo-epoch) demonstrates gasless in a React app with a local-signer tab. The widget package does **not** expose gasless mode.

***

## Next steps

* [SDK Integration Guide](sdk-integration-guide.md) — full integration checklist
* [SDK Reference](sdk-reference.md) — method signatures
* [Supported Chains & Tokens](../supported-chains-and-tokens.md) — testnet tokens and chain IDs
