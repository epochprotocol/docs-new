# Supported Chains & Tokens

Chains and tokens available for Epoch cross-chain intents in the reference integration (Kismet). Contact Epoch to confirm the full canonical list for your environment.

---

## Source chains (user funds)

These are chains where users hold input tokens and connect their wallet to sign.

### Mainnet

| Chain | Chain ID |
|-------|----------|
| Polygon | 137 |
| Optimism | 10 |
| Arbitrum One | 42161 |

### Testnet

| Chain | Chain ID |
|-------|----------|
| Ethereum Sepolia | 11155111 |
| Arbitrum Sepolia | 421614 |

---

## Destination chains (protocol / output)

For the raffles protocol integration:

| Chain | Chain ID | Use |
|-------|----------|-----|
| Base | 8453 | Mainnet raffles |
| Base Sepolia | 84532 | Testnet raffles |

---

## Supported tokens (mainnet)

### Optimism (10)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` |
| USDT | 6 | `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58` |
| DAI | 18 | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |
| WETH | 18 | `0x4200000000000000000000000000000000000006` |

### Polygon (137)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| USDT | 6 | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| DAI | 18 | `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063` |
| WETH | 18 | `0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619` |

### Arbitrum One (42161)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| USDT | 6 | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| DAI | 18 | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |

---

## Supported tokens (testnet)

### Ethereum Sepolia (11155111)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 18 | `0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69` |
| USDT | 18 | `0xc04d2869665Be874881133943523723Be5782720` |
| DAI | 18 | `0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a` |

### Arbitrum Sepolia (421614)

| Symbol | Decimals | Address |
|--------|----------|---------|
| USDC | 6 | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |
| WETH | 18 | `0x980B62Da83eFf3D4576C647993B0c1D7faf17c73` |

---

## Requesting new chains or tokens

Contact the Epoch team with:

- Chain name and chain ID
- Token contract addresses and decimals
- Use case (swap, bridge, protocol interaction)

New entries are added to Epoch's routing graph after validation.
