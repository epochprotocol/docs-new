# Public Contract Addresses

Integration-facing contracts that partners and integrators interact with directly.

**Not listed here:** treasury Safe addresses, executor EOAs, and internal deployer addresses.

---

## Raffle Factory (Kismet / raffles protocol)

Deploys and registers on-chain raffles on Base.

| Network | Chain ID | Address | Explorer |
|---------|----------|---------|----------|
| Base Mainnet | 8453 | `0x841dEbAF53BbEeA6031A3733B38f0ed992343DC3` | [basescan.org](https://basescan.org/address/0x841dEbAF53BbEeA6031A3733B38f0ed992343DC3) |
| Base Sepolia | 84532 | `0x841dEbAF53BbEeA6031A3733B38f0ed992343DC3` | [sepolia.basescan.org](https://sepolia.basescan.org/address/0x841dEbAF53BbEeA6031A3733B38f0ed992343DC3) |

### Factory functions (integrator-relevant)

| Function | Description |
|----------|-------------|
| `createRaffle(...)` | Deploy a new raffle contract |
| `getAllRaffles()` | List all raffle addresses |
| `getRaffle(index)` | Get raffle by index |
| `isRaffle(address)` | Check if address is a registered raffle |

Individual **raffle contracts** are deployed per raffle and referenced by address in `extraData.raffleAddress` for `buyTicket` actions.

---

## Raffle contract (per-raffle)

Each raffle is a separate contract instance. Key functions:

| Function | Description |
|----------|-------------|
| `buyTickets(n, recipient)` | Purchase tickets |
| `finalize()` | Finalize after end time |
| `claimPrize()` | Winners claim prizes |
| `claimRefund()` | Refund if raffle failed |

Raffle addresses are dynamic — read them from the factory or your app's state.

---

## Adding new public contracts

When Epoch onboards a new protocol partner, integration-facing contract addresses will be added to this page. Contact Epoch for updates.
