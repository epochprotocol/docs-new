# Protocol Identifiers

Protocol-interaction tasks identify protocols and actions using **keccak256 hashes** of UTF-8 string names.

Compute with viem:

```typescript
import { keccak256, toBytes } from "viem";

keccak256(toBytes("raffles"));
keccak256(toBytes("buyTicket"));
```

***

## Registered protocols

### `raffles`

| Field              | Value                                                                |
| ------------------ | -------------------------------------------------------------------- |
| Protocol name      | `raffles`                                                            |
| Protocol hash      | `0x4dbce8120d8053ee8aea0d3534f8f5019eb971dfc14c0686f6422b40ac39337c` |
| Destination chains | Base (8453), Base Sepolia (84532)                                    |

#### Actions

| Action name    | Action hash                                                          | Description                  |
| -------------- | -------------------------------------------------------------------- | ---------------------------- |
| `buyTicket`    | `0xa373ddddfee8d2b488aaa8d0eb111c537a84f43f82a2fd27cc3375908a96708e` | Purchase raffle tickets      |
| `createRaffle` | `0x0a35c5f95cd6d0a0b20afc747b32027a1fe1395dca1e7a797211b17f00f4b020` | Fund and create a new raffle |

***

## `extraData` schemas

### `buyTicket`

**Type string:**

```
bytes32 protocol,bytes32 action,address raffleAddress,uint256 numberOfTickets
```

**Example:**

```json
{
  "protocol": "0x4dbce8120d8053ee8aea0d3534f8f5019eb971dfc14c0686f6422b40ac39337c",
  "action": "0xa373ddddfee8d2b488aaa8d0eb111c537a84f43f82a2fd27cc3375908a96708e",
  "raffleAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "numberOfTickets": "2"
}
```

### `createRaffle`

**Type string:**

```
bytes32 protocol,bytes32 action
```

**Example:**

```json
{
  "protocol": "0x4dbce8120d8053ee8aea0d3534f8f5019eb971dfc14c0686f6422b40ac39337c",
  "action": "0x0a35c5f95cd6d0a0b20afc747b32027a1fe1395dca1e7a797211b17f00f4b020"
}
```

***

## Task type identifiers

Task types use the first 4 bytes of `keccak256(taskTypeString)`:

| Task type string       | Enum value                     |
| ---------------------- | ------------------------------ |
| `gettokenout`          | `TaskType.GetTokenOut`         |
| `deposit`              | `TaskType.Deposit`             |
| `protocol-interaction` | `TaskType.ProtocolInteraction` |

***

## Adding a new protocol

Contact Epoch with:

1. Protocol name (string) → will be hashed
2. Action names (strings) → will be hashed
3. `extraData` field schema (ABI type string + JSON example)
4. Destination chain(s) and contract addresses

See [Protocol Interaction Guide](../integration-guides/protocol-interaction.md).
