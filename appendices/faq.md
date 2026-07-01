# FAQ

## For investors and partners

### What is Epoch Protocol?

Epoch is cross-chain intent infrastructure. Users sign once to express what they want (swap, bridge, or execute a protocol action), and Epoch handles routing and execution across blockchains.

### How is Epoch different from a bridge or DEX aggregator?

| Product            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| **Bridge**         | Moves assets between chains                                     |
| **DEX aggregator** | Finds best swap on one chain                                    |
| **Epoch**          | Composes swap + bridge + protocol action into one signed intent |

Epoch is the orchestration layer — not a single bridge or DEX.

### What chains are supported?

See [Supported Chains & Tokens](../supported-chains-and-tokens.md). Public mainnet supports Base, Arbitrum, Polygon, and Optimism with USDC, USDT, WETH, and DAI. For additional chains or tokens, [contact the Epoch team](https://epochprotocol.xyz/#contact) or on [Telegram](http://t.me/AkshitOstwal).

### Is Epoch custodial?

No. Users connect their own wallets and sign transactions. Epoch orchestrates execution but does not take custody of user assets outside of explicitly opted-in Compact resource-lock flows.

### Who uses Epoch today?

[Kismet](https://app.kismet.today) — cross-chain raffle ticket purchases on Base — is a live reference integration.

***

## For integrators

### What wallet do users need?

A standard EOA wallet: MetaMask, Rainbow, Coinbase Wallet, or any WalletConnect-compatible wallet. No smart-wallet deployment is required for the default integration path.

For **testnet gasless Compact deposits**, integrators can use a **local private-key signer** (viem) or MetaMask with EIP-5792 batching. See [Gasless Deposits](../integration-guides/gasless-deposits.md).

### What is gasless in Epoch?

On testnet, optional **gasless Compact deposits** let users sign approve + deposit intent data while Epoch's relayer pays gas for those on-chain steps (EIP-7702 delegation + relay). It does not remove gas from the entire cross-chain intent — only the Compact deposit phase. Mainnet gasless is not documented until announced.

### Do I need the SDK?

**Yes — use the SDK.** It handles task encoding, quoting, signing, and status polling. All integrations should go through `@epoch-protocol/epoch-intents-sdk`. See [Quickstart](../integration-guides/quickstart.md) and [SDK Integration Guide](../integration-guides/sdk-integration-guide.md).

### How do reverse quotes work?

Set `tokenInAmount: "0"` and provide `minTokenOut` with the exact output the user needs. Epoch computes the required input amount. Required for fixed-price purchases (e.g. raffle tickets).

### How long does execution take?

Cross-chain intents typically complete in **1–10 minutes** depending on path complexity and chain finality. Poll intent status every 3 seconds; do not assume instant completion.

### How do I get testnet access?

Use testnet with `apiBaseUrl: https://testnet-dev.epochprotocol.xyz`. See [Supported Chains & Tokens](../supported-chains-and-tokens.md) for testnet chain IDs and token addresses.

### How do I add my protocol?

1. Define protocol and action names.
2. Document your `extraData` schema and destination contracts.
3. Contact Epoch for partner onboarding.

See [Protocol Interaction Guide](../integration-guides/protocol-interaction.md).

### What happens if a transaction fails?

Check [Error Handling](../integration-guides/error-handling.md). Users can retry with a new quote. Use `retryIntentSolve` only per Epoch guidance.

### Can I show the execution path to users?

Yes. The quote response includes a `path` field. Present it as a human-readable route summary.

### Are resource locks (Compact) required?

Only for certain flows. The quote response includes `resourceLockRequired: true` when applicable. Contact Epoch for Compact partner setup.

***

## Security

### What should I never expose in my app?

* User private keys
* Internal Epoch infrastructure URLs

### What addresses are safe to show users?

Integration-facing contract addresses (raffle factory, protocol contracts) — see [Public Contracts](public-contracts.md).
