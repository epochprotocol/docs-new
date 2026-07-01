---
hidden: true
---

# Epoch Protocol — External Documentation

Epoch Protocol lets applications execute **cross-chain intents**: a user signs once, and Epoch routes, quotes, and executes swaps, bridges, and on-chain protocol actions across supported networks.

**Audience:** Integrators, protocol partners, and investors.

***

## Reading paths

| If you want to…                       | Start here                                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand what Epoch is in 5 minutes | [Overview](./)                                                                                                                               |
| Learn concepts before integrating     | [Core Concepts](02-core-concepts.md) → [Architecture](03-architecture.md)                                                                    |
| Build an integration                  | [Quickstart](integration-guides/quickstart.md) → [SDK Integration Guide](integration-guides/sdk-integration-guide.md) → [SDK Reference](integration-guides/sdk-reference.md) |

***

## Documentation map

```
docs-new/
├── README.md
├── 02-core-concepts.md
├── 03-architecture.md
├── supported-chains-and-tokens.md
├── integration-examples.md
├── use-cases.md
├── integration-guides/
│   ├── quickstart.md
│   ├── sdk-integration-guide.md
│   ├── sdk-reference.md
│   ├── swap-and-bridge.md
│   ├── protocol-interaction.md
│   └── error-handling.md
├── appendices/
│   ├── faq.md
│   ├── public-contracts.md
│   └── protocol-identifiers.md
├── ai-agent-contexts/
├── litepaper.md
├── blog.md
└── links.md
```

***

## What Epoch provides vs what you build

| Epoch provides                           | Your app provides                      |
| ---------------------------------------- | -------------------------------------- |
| Cross-chain routing and quoting          | UI, wallet connection, user flows      |
| Intent execution orchestration           | Task definition (what the user wants)  |
| SDK for task building, quotes, and solve | Chain/token selection, confirmation UX |
| Status polling via SDK                   | Progress display and error handling    |

***

## Reference integrations

| Project | Description |
|---------|-------------|
| [Kismet](https://app.kismet.today) | Production raffles — cross-chain ticket purchases |
| [compact-demo-epoch](integration-examples.md#compact-demo-epoch) | React swap/bridge UI + gasless testnet demo |
| [epoch-integration-demo](integration-examples.md#epoch-integration-demo) | Node.js CLI script |
| [miden-integration-example](integration-examples.md#miden-integration-example) | EVM ⇄ Miden bridge |

See [Integration Examples](integration-examples.md) for details.

***

## Protocol products

| Product | Description |
|---------|-------------|
| [User Dashboard](https://userdashboard.epochprotocol.xyz/) | Compact overview, testnet faucets, forced withdrawals — [source](https://github.com/epochprotocol/epoch-user-dashboard) |

See [Links](links.md) for all official URLs.

***

## Support

Contact the Epoch team for production SDK access and protocol partner onboarding. See [Links](links.md).

**Last updated:** 2026-06-19
