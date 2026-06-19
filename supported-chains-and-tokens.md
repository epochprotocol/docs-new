# Supported Chains & Tokens

Chains and tokens available for Epoch cross-chain intents. Use the SDK's `testnetGraph` and `mainnetGraph` exports for programmatic discovery, or reference the tables below.

Contact the Epoch team to confirm availability for your environment or to request new chains and tokens.

---

## Testnet environment

| Item | Value |
|------|-------|
| SDK `apiBaseUrl` (testnet) | `https://testnet-dev.epochprotocol.xyz` |
| The Compact (all chains) | `0x00000000000000171ede64904551eeDF3C6C9788` |

### Testnet chains

| Graph name | Network | Chain ID |
|------------|---------|----------|
| Mainnet | Ethereum Sepolia | 11155111 |
| Base | Base Sepolia | 84532 |
| Optimism | Optimism Sepolia | 11155420 |
| Polygon | Polygon Amoy | 80002 |

Additional testnet source chains:

| Chain | Chain ID |
|-------|----------|
| Arbitrum Sepolia | 421614 |

### Testnet tokens

These tokens use **18 decimals** and share the same contract address on Base Sepolia, Optimism Sepolia, Sepolia, and Polygon Amoy:

| Symbol | Address |
|--------|---------|
| USDC | `0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69` |
| DAI | `0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a` |
| USDT | `0xc04d2869665Be874881133943523723Be5782720` |
| WETH | `0x7946dd86eE310D0aC16804A37787289Fa5b88A8A` |
| WBTC | `0x9b2a2754a9182fD65360E23afCDf3BeFF51796E9` |
| PENGU | `0xEA7dC9849206Ce73b11c465d37b85eC06B11Cf2C` |
| OSWALD | `0xB588418c0f90F07Bc9587d0050845a90C23C7502` |
| KICK | `0x512Ee6Bd7A4be5Ba4796F15Df080c4D0F89a38eD` |
| FERB | `0x145e03A80c19ad1b9d0429d06b6d52707de724A0` |

### Arbitrum Sepolia tokens

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |
| WETH | 18 | `0x980B62Da83eFf3D4576C647993B0c1D7faf17c73` |

---

## Mainnet environment

| Item | Value |
|------|-------|
| SDK `apiBaseUrl` (mainnet) | `https://epochintents.epochprotocol.xyz` |

### Source chains (user funds)

These are chains where users hold input tokens and connect their wallet to sign.

| Chain | Chain ID |
|-------|----------|
| Polygon | 137 |
| Optimism | 10 |
| Arbitrum One | 42161 |

### Destination chains (protocol / output)

| Chain | Chain ID | Example use |
|-------|----------|-------------|
| Base | 8453 | Mainnet raffles, protocol actions |
| Base Sepolia | 84532 | Testnet raffles |

### Mainnet tokens — Optimism (10)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` |
| USDT | 6 | `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58` |
| DAI | 18 | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |
| WETH | 18 | `0x4200000000000000000000000000000000000006` |

### Mainnet tokens — Polygon (137)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| USDT | 6 | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| DAI | 18 | `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063` |
| WETH | 18 | `0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619` |

### Mainnet tokens — Arbitrum One (42161)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| USDT | 6 | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| DAI | 18 | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |

---

## Discovering chains and tokens in code

```typescript
import { mainnetGraph, testnetGraph } from "@epoch-protocol/epoch-intents-sdk";

// Pick graph by chainId (mainnet vs testnet)
// getTokensForChain(chainId) → { symbol, address, decimals }[]
// getChainsFromGraph(chainId) → destination chain options
```

See [SDK Integration Guide](integration-guides/sdk-integration-guide.md) and [compact-demo-epoch](integration-examples.md#compact-demo-epoch) for full patterns.

---

## Requesting new chains or tokens

Contact the Epoch team with:

- Chain name and chain ID
- Token contract addresses and decimals
- Use case (swap, bridge, protocol interaction)

New entries are added to Epoch's routing graph after validation.

---

## Next steps

- [Quickstart](integration-guides/quickstart.md)
- [Integration Examples](integration-examples.md)
- [SDK Reference](integration-guides/sdk-reference.md)
