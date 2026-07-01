# Use Cases

> Detailed, segment-by-segment companion to [`AI CONTEXT`](ai-agent-contexts/ai-context.md). Start with [`ONE PAGER`](one-pager.md) for a quick segment overview, then read [`AI CONTEXT`](ai-agent-contexts/ai-context.md) for identity, capabilities, SDK integration, and status. This document expands the use-case catalog (UC-01 … UC-27) into full write-ups.

**Epoch in one line:** a single coordination layer that gives any user access to any financial outcome in one click — from _any source of funds_ (fiat or any token on any chain) to _any destination_ (a position, an RWA, a vault, a stablecoin, a payment) — without the user managing chains, bridges, or protocols. Funds stay non-custodial in the user's smart wallet; the owner signs.

***

## How to read each use case

Every use case follows the same schema:

* **Persona** — who acts.
* **Goal** — the outcome they want.
* **Coordination problem** — the multi-chain / multi-protocol / multi-rail friction today.
* **Epoch path** — how Epoch fulfills it.
* **Integration surface** — `widget` · `flows-sdk` · `intents-sdk` · `solver`.
* **Partner fit** — who should build this.
* **Maturity** — see legend.

### Maturity legend

| Tag                 | Meaning                                                                   |
| ------------------- | ------------------------------------------------------------------------- |
| **Live**            | Shipped / usable on mainnet today (mind phased per-intent limits)         |
| **Active**          | In production with a partner or in active integration                     |
| **Roadmap**         | Designed / planned; not GA                                                |
| **Partner-powered** | Depends on a third-party partner (e.g. fiat ramp, privacy chain)          |
| **Vision**          | Direction from partner conversations; represent as where Epoch is heading |

> **Honesty rule for AI:** never present Roadmap / Vision / Partner-powered items as turnkey GA. Frame them as direction + open partnership, and tell the user to confirm specifics against the current deployment.

***

## 1. Wallets & consumer apps

### UC-01 — One-click yield / earn (Live)

* **Persona:** wallet user with idle stablecoins.
* **Goal:** earn yield without choosing a chain or protocol.
* **Coordination problem:** comparing vaults, bridging to the right chain, approvals.
* **Epoch path:** Earn flow → solver picks venue → deposit intent → signed → executed.
* **Integration surface:** `widget` / `flows-sdk`.
* **Partner fit:** wallets, consumer DeFi apps.
* **Example:** Phantom, Metamask, Base wallet, EtherFi

### UC-02 — Pay an invoice from any token/chain (Live)

* **Persona:** user holding mixed assets.
* **Goal:** pay a fixed-currency invoice (e.g. merchant wants USDC on Base).
* **Coordination problem:** swap + bridge + send across signatures.
* **Epoch path:** Pay flow with fixed receive token/chain; payer source is flexible; conversion + settlement in one intent.
* **Integration surface:** `widget` / `flows-sdk`.
* **Partner fit:** wallets, checkout/commerce.
* **Example:** OKx wallet, Base wallet, Trustlinq, DashX

### UC-03 — In-wallet swap (Live)

* **Persona:** wallet user.
* **Goal:** best-execution swap inside the wallet.
* **Epoch path:** Swap flow over competing DEX solvers/routes.
* **Integration surface:** `widget`.
* **Partner fit:** wallets.
* **Example:** Metamask, Base wallet, Raby, Exodus, Safe wallet

### UC-04 — Locked-source subscription (Live)

* **Persona:** user paying recurring fees.
* **Goal:** always pay in USDC-on-Base regardless of held assets.
* **Epoch path:** Pay flow with locked source token/chain.
* **Integration surface:** `flows-sdk`.
* **Partner fit:** subscriptions, SaaS, consumer apps.
* **Example:** Ai agents, Netflix, Prime

### UC-23 — Accept any chain/token despite a single-chain license (Vision)

* **Persona:** wallet / neobank licensed to custody on one chain.
* **Goal:** let users and businesses pay them on _any_ chain/token while the provider only operates on its licensed chain.
* **Coordination problem:** provider can't legally/operationally hold value on other chains.
* **Epoch path:** accept inbound on any chain/token; convert + bridge on the fly so value lands on the provider's licensed chain in their required token.
* **Integration surface:** `flows-sdk`.
* **Partner fit:** neobanks, wallet providers, card programs.
* **Example:** Privy, OpenFort, Crossmint, Fun

***

## 2. dApps — cross-chain onboarding into positions

### UC-12 — Cross-chain onboarding (Active — Kismet reference)

* **Persona:** user on chain A; dApp lives on chain B.
* **Goal:** join the dApp without a bridge tutorial.
* **Epoch path:** single intent moves value A → B and enters the app. See [**Kismet.today**](https://kismet.today/) on mainnet.
* **Integration surface:** `widget` / `intents-sdk`.
* **Partner fit:** any mainnet dApp.
* **Example:** Hyperliquid, Polymarket, Morpho

### UC-17 — Any token (incl. meme coin) → direct entry into a pool/perp (Vision)

* **Persona:** user holding an arbitrary token on an arbitrary chain.
* **Goal:** land directly in a Polymarket prediction pool or a Hyperliquid perp in one click.
* **Coordination problem:** swap → bridge → onboard → deposit → open position, across many apps and signatures.
* **Epoch path:** one intent: normalize the source asset, route to the target chain, and enter the position.
* **Integration surface:** `intents-sdk` (dApp embeds), `widget` (drop-in).
* **Partner fit:** high-volume dApps — Polymarket, Hyperliquid class.
* **Example:** Hyperliquid, Polymarket

### UC-16 — Fiat → position in one click (Partner-powered / Vision)

* **Persona:** web2 user with a card or bank account, no crypto.
* **Goal:** go from fiat to a live onchain position with one flow.
* **Coordination problem:** KYC + on-ramp + custody + swap + bridge + deposit are normally separate products.
* **Epoch path:** licensed on/off-ramp partner handles fiat-in (card, bank transfer, SWIFT, CEX like Coinbase/Binance); Epoch coordinates the onchain leg into the destination outcome.
* **Integration surface:** `widget` (onboarding) + `flows-sdk`.
* **Partner fit:** dApps, RWA issuers, wallets wanting web2 onboarding.

***

## 3. RWA issuers & tokenized finance

### UC-14 — Outcome access to a tokenized treasury / RWA (Roadmap)

* **Persona:** user who wants exposure to a tokenized treasury or RWA.
* **Goal:** hold the asset without learning settlement mechanics.
* **Epoch path:** intent abstracts mint/route/settle into the RWA.
* **Integration surface:** `intents-sdk`.
* **Partner fit:** RWA issuers.
* **Example:** Midas, Superstate, securitize, Ondo

### UC-18 — Outcome stacking on RWAs (Vision)

* **Persona:** RWA holder (e.g. minted RWA gold).
* **Goal:** make the RWA productive, not just held.
* **Coordination problem:** issuing a stable against the RWA, finding yield, and looping into a position spans many protocols.

{% stepper %}
{% step %}
## 1. Mint RWA asset

Mint RWA asset (e.g. RWA gold) — fiat or crypto funded.
{% endstep %}

{% step %}
## 2. Issue RWA-USD

Issue RWA-USD against it as collateral.
{% endstep %}

{% step %}
## 3. Deploy into lending/yield

Deploy RWA-USD into lending/yield (vault holds collateral).
{% endstep %}

{% step %}
## 4. Optionally borrow and open a position

Optionally borrow (e.g. USDT) and open a position on Polymarket/Hyperliquid.
{% endstep %}
{% endstepper %}

* **Why it matters:** turns "buy and hold" into volume + utility for the RWA token → more usage, more liquidity, more issuer revenue.
* **Integration surface:** `intents-sdk`, multiprotocol + earn solvers.
* **Partner fit:** RWA issuers, "Yield for RWA" projects.
* **Example:** Multipli, R2, Refi2, RWA issuer those who need secondary yield and more Token utility

### UC-25 — Deepen fragmented RWA liquidity (Vision)

* **Persona:** RWA issuer whose token's liquidity lives off-platform / is thin.
* **Goal:** more liquidity and easier swap/bridge/custody of the asset.
* **Epoch path:** stand up LP-backed liquidity pools (with Epoch liquidity partners) pairing the RWA with other tokens, so users can swap/bridge/custody through Epoch; pair with UC-18 to drive utility.
* **Integration surface:** `solver` + liquidity pools.
* **Partner fit:** RWA issuers + liquidity providers.
* **Example:** Midas, Securitize, Ondo

***

## 4. Payments & near-banks

### UC-13 — Stablecoin settlement without path UX (Roadmap)

* **Persona:** payer/payee in different assets/chains.
* **Goal:** settle a stablecoin payment with no manual routing.
* **Epoch path:** Pay flow normalizes source and delivers the agreed token/chain.
* **Integration surface:** `flows-sdk`.
* **Partner fit:** payments apps.
* **Example:** Stripe, Bitpay, BVNK

### UC-20 — Token-preference receive (Vision)

* **Persona:** business that only wants USDC on Base.
* **Goal:** never touch other tokens, but let anyone pay in anything.
* **Coordination problem:** customers hold many tokens across many chains.
* **Epoch path:** business pins receive token/chain; payer sends any asset (via Stripe/Tempo-style rails or direct); Epoch converts on the fly so the business account always lands in its chosen token.
* **Integration surface:** `flows-sdk`.
* **Partner fit:** merchants, payment processors, treasuries.
* **Example:** Stripe, Paypal, BVNK

### UC-21 — Auto-savings sweep of idle balances (Vision)

* **Persona:** business or near-bank with idle receivables.
* **Goal:** earn APY on funds until they're spent.
* **Coordination problem:** moving idle balances into and out of vaults is manual and fragmented.
* **Epoch path:** received funds auto-route into a chosen vault (Morpho, Aave, …); pulled back out on spend — single SDK integration, single signature pattern.
* **Integration surface:** `flows-sdk` (Earn + Pay composed).
* **Partner fit:** payments apps, near-banks, business accounts.
* **Example:** Revoult, Bleap, Tria, Superform, infini, Moon

### UC-22 — Near-bank: one SDK for savings + DeFi + payments (Roadmap / Vision)

* **Persona:** near-bank or payments app.
* **Goal:** offer customers a savings account, DeFi access, and 1:1-backed multi-chain stablecoin payments — without users juggling 2–3 signatures to swap+send.
* **Coordination problem:** each capability is normally a separate integration; cross-chain payments leak value to slippage.
* **Epoch path:** one integration provides (a) savings sweep (UC-21), (b) DeFi access, (c) **1:1-backed stablecoin mobility** (UC-19) — collapsed into a single transaction/signature for the user.
* **Integration surface:** `flows-sdk` + `solver`.
* **Partner fit:** near-banks, neo-banks, card programs, stablecoin wallets.
* **Example:** Bleap, Superform, Gnosis pay, Zoth

***

## 5. Stablecoin issuers & cross-institution settlement

### UC-19 — Cross-institution / 1:1-backed stablecoin settlement (Roadmap / Solver-based)

* **Persona:** institutions on different stablecoins/chains (e.g. JPMUSD vs BofA USD), or a near-bank licensed on one chain.
* **Goal:** a business that "only works with JPMorgan" still receives funds from Bank-of-America users at the same address/token; or a user moves USDC between Base ↔ Polygon/Arbitrum/Optimism/Ethereum with **no slippage** ($1 always = $1 at payment).
* **Coordination problem:** cross-stablecoin and cross-chain transfers incur swap/bridge slippage and multiple steps; institutions can't realistically integrate every counterpart.
* **Epoch path:** specialized solvers present **1:1-backed** value across chains and stablecoins; on-the-fly conversion lands the receiver's required token at their fixed address. Slippage is absorbed at the service layer; the bank/issuer covers it and Epoch charges a small subscription/fee.
* **Integration surface:** + `solver`.
* **Partner fit:** stablecoin issuers (JPMUSD/BofA-style), payment infra, near-banks, e.g. **Koala Pay**.
* **Example:** JPM, Agant, Brale, Circle, Anchorage Digital

***

## 6. Privacy chains & institutions

### UC-10 — Private execution via a privacy-chain stack (Active — MOU / testnet)

* **Persona:** privacy-chain user or institution.
* **Goal:** keep balances/transactions private while still using EVM DeFi.
* **Epoch path:** onboard/offboard to the privacy chain; route DeFi actions on EVM chains so activity is unlinkable to the private account.
* **Integration surface:** / native wallet integration.
* **Partner fit:** privacy chains — **Miden** (active), **Canton**.

### UC-27 — On-demand privacy with pre-transaction compliance (Partner-powered / Vision)

* **Persona:** institution that onboards with Epoch and requires privacy _and_ compliance.
* **Goal:** transact privately on demand while still satisfying compliance obligations.
* **Coordination problem:** privacy and compliance are usually treated as opposites — going private forfeits compliance checks, and compliance usually means full transparency.
* **Epoch path:** through the privacy partner, Epoch provides private transactions / private custody **on demand** (toggled per institution or per transaction), with optional **compliance checks run before any transaction executes**.
* **Integration surface:** + privacy-chain integration.
* **Partner fit:** institutions, banks, asset managers; via privacy partners (Miden / Canton / Newton).

### UC-24 — Institutional private cross-chain DeFi + liquidity rebalancing (Vision)

* **Persona:** bank / asset manager / prop fund (e.g. JPMorgan, BlackRock-style).
* **Goal:** transact on Web3 privately — use Hyperliquid, Polymarket, yield vaults — without revealing holdings or linking activity to their on-chain identity, and keep liquidity pools rebalanced at best rates.
* **Coordination problem:** institutions want privacy _and_ full DeFi access _and_ liquidity management, normally requiring many integrations and exposing positions.
* **Epoch path:** funds stay private on a partner privacy chain (e.g. Miden); for EVM activity, Epoch executes via fresh/segregated wallets so transactions never link back to the private account; privacy is available **on demand** with optional **pre-transaction compliance checks** (see UC-27); coordinates DeFi access and liquidity-pool rebalancing at best rate; pair with onboarding widgets for web2/web3 entry (fiat, card, CEX, DEX).
* **Integration surface:** + privacy-chain integration + Safe module.
* **Partner fit:** institutions, banks, asset managers, OTC desks; via privacy partners.

### UC-11 — Safe multisig intent batch (Live)

* **Persona:** DAO / enterprise treasury on Safe.
* **Goal:** approved multi-chain action with an audit trail.
* **Epoch path:** Safe + Epoch Module (ERC-7579); batch intent; intent hash + solver path + tx hash for audit.
* **Integration surface:** `intents-sdk` + Safe module.
* **Partner fit:** DAOs, enterprise treasuries.

***

## 7. AI agents

### UC-05 — Treasury rebalance with human sign-off (Live)

* **Persona:** agent managing a treasury under policy.
* **Goal:** propose rebalances; never hold keys.
* **Epoch path:** agent builds intents; owner signs; Epoch executes.
* **Integration surface:** `intents-sdk` (+ MCP, roadmap).
* **Partner fit:** agent / automation teams.

### UC-06 — Organic swap/bridge under an agent (Active — observed)

* **Persona:** agent needing just-in-time liquidity.
* **Goal:** get the right token on the right chain at good rates.
* **Coordination problem:** agents are great at strategy, poor at on-chain execution; raw aggregators (e.g. 1inch) don't always give best rates or multi-action flows.
* **Epoch path:** agent calls Epoch for swap/bridge with competitive solver routing.
* **Integration surface:** `intents-sdk`.
* **Partner fit:** DeFi agents (EVM; Solana later).

### UC-26 — Agent opens positions across apps via one SDK (Vision)

* **Persona:** strategy/research agent.
* **Goal:** not just swap/bridge — also _open positions_ (yield, prediction markets, perps) for the user through one SDK integration.
* **Coordination problem:** executing a recommended strategy spans many protocols and signatures.
* **Epoch path:** agent submits the desired outcome; Epoch handles token + chain + entry into the target app; user signs.
* **Integration surface:** `intents-sdk` (+ MCP, roadmap).
* **Partner fit:** agentic finance teams.

***

## 8. Liquidity providers

### LP — Provide liquidity for RWA / stablecoin pools (Vision)

* **Persona:** liquidity provider.
* **Goal:** earn on flow as Epoch's mainnet limits scale.
* **Epoch path:** LP into Epoch-coordinated pools (RWA pairs, stablecoin routes); earn from swap/bridge volume routed through Epoch (supports UC-19, UC-25).
* **Integration surface:** liquidity pools + `solver`.
* **Partner fit:** market makers, liquidity networks; phased with mainnet scaling.

***

## Other catalog items

| ID    | Category | Summary                           | Maturity |
| ----- | -------- | --------------------------------- | -------- |
| UC-07 | Trading  | Cross-chain collateral move       | Live     |
| UC-08 | DeFi     | Cross-chain vault deposit         | Live     |
| UC-09 | DeFi     | Bridge-only intent                | Live     |
| UC-15 | x402     | Intent flows on the x402 standard | Research |

***

## Segment → use case map

| Segment                        | Use cases                         |
| ------------------------------ | --------------------------------- |
| Wallets & consumer             | UC-01, UC-02, UC-03, UC-04, UC-23 |
| dApps onboarding               | UC-12, UC-16, UC-17               |
| RWA & tokenized finance        | UC-14, UC-18, UC-25               |
| Payments & near-banks          | UC-13, UC-20, UC-21, UC-22        |
| Stablecoin / cross-institution | UC-19                             |
| Privacy & institutions         | UC-10, UC-11, UC-24, UC-27        |
| AI agents                      | UC-05, UC-06, UC-26               |
| Liquidity providers            | LP                                |

***

## References

* Quick segment overview: [`ONE PAGER`](one-pager.md)
* Canonical context: [`AI CONTEXT`](ai-agent-contexts/ai-context.md)
* Production dApp example: [Kismet.today](https://kismet.today/)
* Docs: [docs.epochprotocol.xyz](https://docs.epochprotocol.xyz/)
* Mainnet announcement: [X](https://x.com/0xEpochProtocol/status/2046221555219435983)

