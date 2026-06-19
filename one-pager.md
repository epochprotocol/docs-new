# One Pager

> **One click to any financial outcome.** Epoch is the coordination layer between your product and the chains, protocols, and payment rails underneath. Users start from anywhere — fiat, any token, any chain — and land in the outcome your product needs. They sign once; Epoch handles the path. You don't custody funds.

**Live on mainnet** (phased limits). Reference app: [Kismet.today](https://kismet.today/) · Docs: [docs.epochprotocol.xyz](https://docs.epochprotocol.xyz/)

## Who can plug Epoch in?

| If you are…                                        | What Epoch gives you                                                                                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **dApp** (prediction markets, perps, DeFi, gaming) | Onboard users from **any chain, any token, or fiat** straight into your app or position — one click, no bridge tutorial. Example: meme coin on Arbitrum → Polymarket pool.                           |
| **Wallet / neobank**                               | Swap, pay, earn, and accept inbound from **any chain/token** even if you're licensed on one chain only. One API instead of many integrations.                                                        |
| **RWA issuer**                                     | Fiat + crypto onboarding, deeper liquidity for your token, and **outcome stacking** — mint RWA → borrow against it → earn yield → open a trading position. More utility, more volume.                |
| **Payments / near-bank / card app**                | Accept any token, deliver what you want (e.g. USDC on Base). **1:1-backed** cross-chain stablecoin payments ($1 stays $1). Auto-sweep idle balances into yield. One API, one signature.              |
| **Stablecoin issuer** (JPMUSD, BofA USD, etc.)     | Cross-institution settlement — receive counterpart stablecoins at your address, converted on the fly. Cross-border and cross-chain without slippage at the user layer.                               |
| **Institution / bank / asset manager**             | Cross-chain payments, DeFi access, liquidity rebalancing — without building every integration yourself. **On-demand privacy** + optional **pre-transaction compliance checks** via privacy partners. |
| **Privacy chain**                                  | Onboard/offboard, swap/bridge widget, and private access to EVM DeFi — user funds stay private; EVM activity stays unlinkable.                                                                       |
| **AI agent**                                       | Just-in-time swap/bridge **and** open positions (yield, perps, prediction markets) through one API. Agent finds the strategy; Epoch executes after the user signs.                                   |

## The pattern (same for every segment)

```
User has X  →  wants outcome Y on your product  →  one click / one signature  →  done
     ↑                                                    ↑
  fiat · card · bank · CEX · any token · any chain       swap · bridge · deposit · pay · yield · position
```

Epoch is **not** a wallet, exchange, or custodian. It coordinates solvers and routes so your users get the outcome without managing chains, bridges, or protocols.

## Good fit if your product…

* Lives on **one chain** but users arrive from many
* Loses users at **bridge / swap / on-ramp** steps
* Needs users to **pay in anything** but **receive one token**
* Has **idle balances** that should earn yield automatically
* Issues **RWAs or stablecoins** and wants more liquidity + utility
* Serves **institutions** that need privacy _and_ compliance
* Is an **agent** that can recommend strategies but can't execute on-chain well

## How to integrate

| Surface               | Best for                                             |
| --------------------- | ---------------------------------------------------- |
| **Widget**            | Fastest embed — swap, bridge, pay, earn, onboarding  |
| **Flows SDK**         | Custom UI, headless Pay / Swap / Earn                |
| **Intents SDK** | dApps, agents, backends — full control over outcomes |

## Partners we're actively looking for

High-volume mainnet dApps · RWA issuers · payments & near-banks · stablecoin apps · privacy chains · wallets · AI agents · liquidity providers · NYC-based teams

## Learn more

* Full use cases: [`USE CASES`](use-cases.md)
* Technical context for AI/builders: [`AI CONTEXT`](ai-agent-contexts/ai-context.md)
