# Supported Chains & Tokens

Chains and tokens available for Epoch cross-chain intents. Use the SDK's `testnetGraph` and `mainnetGraph` exports for programmatic discovery, or reference the tables below.

Contact the Epoch team to confirm availability for your environment or to request new chains and tokens.

***

## Testnet environment

<table><thead><tr><th width="258.84765625">Item</th><th>Value</th></tr></thead><tbody><tr><td>SDK <code>apiBaseUrl</code> (testnet)</td><td><code>https://testnet-dev.epochprotocol.xyz</code></td></tr><tr><td>The Compact (all chains)</td><td><code>0x00000000000000171ede64904551eeDF3C6C9788</code></td></tr></tbody></table>

### Testnet chains

<table><thead><tr><th width="222.22265625">Network</th><th>Chain ID</th></tr></thead><tbody><tr><td>Ethereum Sepolia</td><td>11155111</td></tr><tr><td>Base Sepolia</td><td>84532</td></tr><tr><td>Optimism Sepolia</td><td>11155420</td></tr><tr><td>Polygon Amoy</td><td>80002</td></tr></tbody></table>

Additional testnet source chains:

<table><thead><tr><th width="223.70703125">Chain</th><th>Chain ID</th></tr></thead><tbody><tr><td>Miden</td><td>999999999</td></tr></tbody></table>

### Testnet tokens

These tokens use **18 decimals** and share the same contract address on Base Sepolia, Optimism Sepolia, Sepolia, and Polygon Amoy:

<table><thead><tr><th width="148.71484375">Symbol</th><th>Address</th></tr></thead><tbody><tr><td>USDC</td><td><code>0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69</code></td></tr><tr><td>DAI</td><td><code>0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a</code></td></tr><tr><td>USDT</td><td><code>0xc04d2869665Be874881133943523723Be5782720</code></td></tr><tr><td>WETH</td><td><code>0x7946dd86eE310D0aC16804A37787289Fa5b88A8A</code></td></tr><tr><td>WBTC</td><td><code>0x9b2a2754a9182fD65360E23afCDf3BeFF51796E9</code></td></tr><tr><td>PENGU</td><td><code>0xEA7dC9849206Ce73b11c465d37b85eC06B11Cf2C</code></td></tr><tr><td>OSWALD</td><td><code>0xB588418c0f90F07Bc9587d0050845a90C23C7502</code></td></tr><tr><td>KICK</td><td><code>0x512Ee6Bd7A4be5Ba4796F15Df080c4D0F89a38eD</code></td></tr><tr><td>FERB</td><td><code>0x145e03A80c19ad1b9d0429d06b6d52707de724A0</code></td></tr></tbody></table>

***

## Mainnet environment

| Item                       | Value                            |
| -------------------------- | -------------------------------- |
| SDK `apiBaseUrl` (mainnet) | `https://api.epochprotocol.xyz/` |

### Mainnet Chains

| Chain        | Chain ID |
| ------------ | -------- |
| Polygon      | 137      |
| Optimism     | 10       |
| Arbitrum One | 42161    |
| Base         | 8453     |

***

## Discovering chains and tokens in code

```typescript
import { mainnetGraph, testnetGraph } from "@epoch-protocol/epoch-intents-sdk";

// Pick graph by chainId (mainnet vs testnet)
// getTokensForChain(chainId) → { symbol, address, decimals }[]
// getChainsFromGraph(chainId) → destination chain options
```

See [SDK Integration Guide](integration-guides/sdk-integration-guide.md) and [compact-demo-epoch](integration-examples.md#compact-demo-epoch) for full patterns.

***

## Requesting new chains or tokens

Contact the Epoch team with:

* Chain name and chain ID
* Token contract addresses and decimals
* Use case (swap, bridge, protocol interaction)

New entries are added to Epoch's routing graph after validation.

***

## Next steps

* [Quickstart](integration-guides/quickstart.md)
* [Integration Examples](integration-examples.md)
* [SDK Reference](integration-guides/sdk-reference.md)
