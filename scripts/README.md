# Integration reference scripts

Copy-paste examples for Epoch SDK integration patterns. These live in the docs repo for reference; runnable end-to-end tests ship in `smallocator/sdk`.

| Script | Wallet | Purpose |
| ------ | ------ | ------- |
| [`injected-wallet-batch-probe.ts`](./injected-wallet-batch-probe.ts) | Browser / injected (wagmi) | Probe EIP-5792 batch strategy; solve with user-paid gas |
| `smallocator/sdk/test/local-wallet-gasless.ts` | Local private key | Gasless SIO relay smoke test (`pnpm example:local-wallet`) |

**Rule:** gasless relay (`allowGaslessSmartAccount: true` + `convertToSmartAccount`) is **local private-key only**. Injected wallets may batch via `wallet_sendCalls` when already a smart wallet, but the user pays on-chain gas.

See [Gasless Deposits](../integration-guides/gasless-deposits.md) and [Transaction Batching & EIP-7702](../integration-guides/transaction-batching-and-eip7702.md).
