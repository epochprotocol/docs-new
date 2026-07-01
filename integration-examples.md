# Integration Examples & References

Working reference implementations for Epoch Protocol integrations. All examples use the **`@epoch-protocol/epoch-intents-sdk`** — the recommended integration path.

---

## epoch-integration-demo

**Type:** Node.js CLI script  
**Repo:** [github.com/epochprotocol/epoch-integration-demo](https://github.com/epochprotocol/epoch-integration-demo)

Minimal headless integration showing the full swap-and-bridge flow without a UI:

```
getHealthCheck()
  → getTaskData({ taskType: GetTokenOut, intentData })
  → getIntentQuote({ sponsorAddress, taskTypeString, intentData })
  → solveIntent({ ..., quoteResult })
  → getIntentStatus(address, nonce)
```

**Default testnet route:** USDC on Ethereum Sepolia → PENGU on Base Sepolia.

| Command | Description |
|---------|-------------|
| `npm run quote` | Quote only (no transactions) |
| `npm run swap-and-bridge` | Full swap-and-bridge execution |

Best for: backend scripts, CI smoke tests, understanding the SDK flow before building a UI.

---

## compact-demo-epoch

**Type:** React + Vite + wagmi  
**Repo:** [github.com/Man-Jain/compact-demo-epoch](https://github.com/Man-Jain/compact-demo-epoch)  
**Branch:** `feat/gasless-7702` — [PR #10](https://github.com/Man-Jain/compact-demo-epoch/pull/10)

Full-featured web UI demonstrating swap, bridge, Compact deposits, balance queries, withdrawals, **gasless EIP-7702 deposits**, and a **local private-key signer** for testnet relay testing.

| File | Purpose |
|------|---------|
| `src/config/wagmi.ts` | Supported chains + RainbowKit |
| `src/config/web3.ts` | Token/chain discovery from SDK graphs |
| `src/config/api.ts` | `VITE_API_BASE_URL` helper |
| `src/hooks/useAllocatorAPI.ts` | Health check, allocator address |
| `src/hooks/useEffectiveWallet.ts` | Unified browser wallet + local signer |
| `src/hooks/useGaslessWallet.ts` | 7702 probe + `setupSmartAccount` |
| `src/context/LocalSignerContext.tsx` | Private-key wallet client (in-memory) |
| `src/components/GaslessEnableButton.tsx` | Gasless opt-in / smart-account setup UI |
| `src/components/WalletConnect.tsx` | Browser wallet + local signer tabs |
| `src/pages/BalancePage.tsx` | Quote → solve (`gasless: true`) → status |
| `src/components/UserBalancesList.tsx` | `getDepositedBalances` |
| `src/components/WalletWithdrawDialog.tsx` | Forced withdrawal flow |

**Gasless test flow:** connect via **Local signer** tab → switch to Epoch smart account → enable gasless → get quote → deposit + submit intent.

Best for: React apps with wallet connection, swap/bridge UI patterns, Compact balance management, and gasless testnet demos.

See [Gasless Deposits](integration-guides/gasless-deposits.md).

---

## Kismet (chance-chain)

**Type:** Production dApp — React + Vite + wagmi  
**App:** [app.kismet.today](https://app.kismet.today)  
**Repo:** [github.com/Abhimanyu121/chance-chain](https://github.com/Abhimanyu121/chance-chain)

Live on-chain raffles built on Base. Users fund and buy tickets from Polygon, Optimism, or Arbitrum using Epoch cross-chain intents.

**Integration pattern:**

- Raffles deployed on **Base** (mainnet) or **Base Sepolia** (testnet)
- Users connect on a **source chain** (Polygon, Optimism, Arbitrum)
- Fixed-price ticket purchases use **reverse quotes** (`tokenInAmount: "0"`, fixed `minTokenOut`)
- Quote-then-confirm flow before `solveIntent`

Best for: protocol interaction integrations, fixed-output purchases, production UX patterns.

See [Protocol Interaction Guide](integration-guides/protocol-interaction.md) for details.

---

## miden-integration-example

**Type:** React + Vite — EVM ⇄ Miden bridge  
**Repo:** [github.com/epochprotocol/miden-integration-example](https://github.com/epochprotocol/miden-integration-example)

Reference dapp for moving value between EVM (Sepolia) and Miden testnet via Epoch intents.

**Flows:**

| Flow | Direction | Description |
|------|-----------|-------------|
| Cross-chain | EVM → Miden | Pay USDC on Sepolia, receive asset on Miden |
| Withdraw | Miden → EVM | Burn Miden note, receive asset on Sepolia |

| File | Purpose |
|------|---------|
| `src/services/epoch-bridge.ts` | Epoch SDK wrapper (intent build / submit / poll) |
| `src/hooks/useEpochIntent.ts` | EVM→Miden intent submission |
| `src/hooks/useWithdrawIntent.ts` | Miden→EVM withdraw flow |
| `src/constants/chains.ts` | Sepolia + Miden virtual chain id (`999999999`) |

**Note:** `MIDEN_DESTINATION_CHAIN_ID = 999999999` is the virtual chain id for Miden as intent output — do not use a real EVM chain id.

Best for: non-EVM destination chains, Miden-specific integration patterns.

See also [Miden → EVM Lending Integration](integration-guides/miden-lending.md).

---

## SDK source

The SDK lives in [github.com/epochprotocol/smallocator](https://github.com/epochprotocol/smallocator/tree/dev/sdk). See [SDK Integration Guide](integration-guides/sdk-integration-guide.md) for the full integration checklist and code patterns.

---

## Next steps

- [Quickstart](integration-guides/quickstart.md) — get your first integration running
- [SDK Reference](integration-guides/sdk-reference.md) — method documentation
- [Supported Chains & Tokens](supported-chains-and-tokens.md)
