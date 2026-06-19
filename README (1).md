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
| Build an integration                  | [Quickstart](integration-guides/quickstart.md) → [SDK Reference](integration-guides/sdk-reference.md) → [API Reference](05-api-reference.md) |

***

## Documentation map

```
epoch-docs/
├── README.md                          ← You are here
├── DOCUMENTATION_PLAN.md                ← Internal planning notes
├── 01-overview.md
├── 02-core-concepts.md
├── 03-architecture.md
├── 04-integration-guides/
│   ├── quickstart.md
│   ├── sdk-reference.md
│   ├── swap-and-bridge.md
│   ├── protocol-interaction.md
│   └── error-handling.md
├── 05-api-reference.md
└── 06-appendices/
    ├── chains-and-tokens.md
    ├── public-contracts.md
    ├── protocol-identifiers.md
    ├── faq.md
    └── changelog.md
```

***

## What Epoch provides vs what you build

| Epoch provides                           | Your app provides                      |
| ---------------------------------------- | -------------------------------------- |
| Cross-chain routing and quoting          | UI, wallet connection, user flows      |
| Intent execution orchestration           | Task definition (what the user wants)  |
| SDK for task building, quotes, and solve | Chain/token selection, confirmation UX |
| Status polling API                       | Progress display and error handling    |

***

## Reference integration

[**Kismet**](https://app.kismet.today) — on-chain raffles on Base. Users fund and buy tickets from Polygon, Optimism, or Arbitrum via Epoch. See [Protocol Interaction](integration-guides/protocol-interaction.md).

***

## Support

Contact the Epoch team for API access, production endpoints, and protocol partner onboarding.

**Last updated:** 2026-06-08
