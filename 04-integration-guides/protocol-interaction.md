# Protocol Interaction Integration

Use **`TaskType.ProtocolInteraction`** when Epoch should execute an **on-chain protocol action** on the destination chain after routing user funds cross-chain.

Live example: [Kismet](https://app.kismet.today) — buy raffle tickets on Base using funds from Polygon, Optimism, or Arbitrum.

---

## Supported protocol: raffles

| Action | Description |
|--------|-------------|
| `buyTicket` | Approve payment token and call `buyTickets(n, recipient)` on a raffle contract |
| `createRaffle` | Approve asset token and call `createRaffle(...)` on the raffle factory |

Contact Epoch to add new protocols or actions.

---

## Protocol identifiers

Protocol and action are identified by **keccak256 hashes** of their string names:

| Name | Hash |
|------|------|
| `raffles` (protocol) | `0x4dbce8120d8053ee8aea0d3534f8f5019eb971dfc14c0686f6422b40ac39337c` |
| `buyTicket` (action) | `0xa373ddddfee8d2b488aaa8d0eb111c537a84f43f82a2fd27cc3375908a96708e` |
| `createRaffle` (action) | `0x0a35c5f95cd6d0a0b20afc747b32027a1fe1395dca1e7a797211b17f00f4b020` |

See [Protocol Identifiers](../06-appendices/protocol-identifiers.md) for the full table.

Compute in TypeScript:

```typescript
import { keccak256, toBytes } from "viem";

keccak256(toBytes("raffles"));      // protocol hash
keccak256(toBytes("buyTicket"));    // action hash
```

Set `protocolHashIdentifier` in `intentData` to the protocol hash.

---

## Buy tickets (reverse quote flow)

Recommended pattern for fixed-price ticket purchases:

```typescript
import { TaskType } from "@epoch-protocol/epoch-commons-sdk";
import { keccak256, toBytes, parseUnits } from "viem";

const destinationChainId = isTestnet ? "84532" : "8453";
const ticketCost = parseUnits(
  (ticketPrice * numberOfTickets).toString(),
  paymentTokenDecimals,
).toString();

const { taskTypeString, intentData } = await sdk.getTaskData({
  taskType: TaskType.ProtocolInteraction,
  intentData: {
    isNative: false,
    depositTokenAddress: selectedSourceToken,
    tokenInAmount: "0",                    // reverse quote
    outputTokenAddress: paymentTokenOnBase,
    minTokenOut: ticketCost,
    destinationChainId,
    protocolHashIdentifier:
      "0x4dbce8120d8053ee8aea0d3534f8f5019eb971dfc14c0686f6422b40ac39337c",
    recipient: sponsorAddress,
  },
  extraDataTypestring:
    "bytes32 protocol,bytes32 action,address raffleAddress,uint256 numberOfTickets",
  extraData: {
    protocol: keccak256(toBytes("raffles")),
    action: keccak256(toBytes("buyTicket")),
    raffleAddress: raffleContractAddress,
    numberOfTickets: numberOfTickets.toString(),
  },
});

// Step 1: Quote
const quote = await sdk.getIntentQuote({
  sponsorAddress,
  taskTypeString,
  intentData,
  isNative: false,
});

// Step 2: User confirms, then solve
const result = await sdk.solveIntent({
  isNative: false,
  sponsorAddress,
  taskTypeString,
  intentData,
  quoteResult: quote,
  onExecutionStatus: (status) => console.log(status.phase),
});

// Step 3: Poll status
const nonce = result?.allocationResponse?.nonce ?? result?.intentNonce;
if (nonce) {
  const interval = setInterval(async () => {
    const status = await sdk.getIntentStatus(sponsorAddress, nonce.toString());
    if (allComplete(status)) clearInterval(interval);
  }, 3000);
}
```

---

## Create raffle (fund asset token)

When a seller needs to fund a raffle's asset token from another chain:

```typescript
extraData: {
  protocol: keccak256(toBytes("raffles")),
  action: keccak256(toBytes("createRaffle")),
},
extraDataTypestring: "bytes32 protocol,bytes32 action",
```

Use forward or reverse quote depending on whether the input or output amount is fixed.

---

## Two-chain UI model

| Layer | Chain | Your UI responsibility |
|-------|-------|------------------------|
| Source | Polygon, Optimism, Arbitrum, testnets | Token picker, balance display, wallet on source chain |
| Destination | Base / Base Sepolia | Raffle/protocol state reads, post-action UX |

Users sign on the **source chain**. The protocol action executes on the **destination chain** automatically.

---

## Fixed-outcome fields (optional)

For fixed-price ticket buys, you may include additional `extraData` fields:

```typescript
extraDataTypestring:
  "... ,bool fixedOutcome,address fixedOutcomeToken,uint256 fixedOutcomeAmount",
extraData: {
  // ... protocol, action, raffleAddress, numberOfTickets
  fixedOutcome: true,
  fixedOutcomeToken: paymentTokenAddress,
  fixedOutcomeAmount: requiredAmount.toString(),
},
```

Contact Epoch if you need guidance on when these fields are required.

---

## Partner onboarding

To add a new protocol:

1. Define protocol name and action names (used for keccak256 identifiers).
2. Document the `extraData` schema (field names and types).
3. Provide destination-chain contract addresses integrators call.
4. Contact Epoch to register the protocol in Epoch's routing graph.

---

## Public contracts

Raffle factory addresses: [Public Contracts](../06-appendices/public-contracts.md)

---

## Next steps

- [Error Handling](./error-handling.md)
- [FAQ](../06-appendices/faq.md)
