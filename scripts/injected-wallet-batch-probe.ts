/**
 * Injected wallet batch probe — reference script for integrators.
 *
 * Demonstrates EIP-5792 batching for browser wallets (MetaMask, Rainbow, …).
 * Gasless SIO relay is NOT available for injected wallets — only local private-key
 * signers can use `allowGaslessSmartAccount: true` + `convertToSmartAccount`.
 *
 * Run inside a browser app with wagmi (see compact-demo-epoch). This file is
 * documentation reference; copy into your React hook or page component.
 *
 * Related: integration-guides/gasless-deposits.md
 *          integration-guides/transaction-batching-and-eip7702.md
 */

import {
  EpochIntentSDK,
  canBatchCalls,
  resolveWalletBatchStrategy,
  shouldUseGaslessRelay,
} from "@epoch-protocol/epoch-intents-sdk";
import type { PublicClient, WalletClient } from "viem";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://testnet-dev.epochprotocol.xyz";

export async function probeInjectedWalletBatching({
  walletClient,
  publicClient,
  chainId,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  chainId: number;
}) {
  const account = walletClient.account;
  if (!account) {
    throw new Error("walletClient.account is required");
  }

  const userAddress = account.address;

  // --- 1. Batch capability probe (EIP-5792 + on-chain 7702 delegation) ---
  const strategy = await resolveWalletBatchStrategy({
    walletClient,
    chainId,
    user: userAddress,
    publicClient,
  });

  const cap = await canBatchCalls(
    walletClient,
    chainId,
    userAddress,
    publicClient,
  );

  console.log("Batch strategy:", strategy.mode); // "atomic" | "sequential-tx"
  console.log("canBatchCalls:", cap);
  // cap.supported — wallet can batch at all
  // cap.atomic     — atomic wallet_sendCalls available
  // cap.mode       — mirrors strategy.mode

  // --- 2. Gasless probe — injected wallets must NOT expect relay ---
  const sdk = new EpochIntentSDK({
    apiBaseUrl: API_BASE_URL,
    walletClient,
  });

  const gaslessStatus = await sdk.getWalletGaslessStatus(chainId);

  console.log("Gasless status:", gaslessStatus);
  // accountType: "json-rpc" for injected wallets
  // canRelayDeposit: false — relay is local-signer only
  // canRelayEnable: false — convertToSmartAccount is not for browser wallets

  const wantsRelay = shouldUseGaslessRelay(walletClient);
  if (wantsRelay) {
    throw new Error(
      "Unexpected: shouldUseGaslessRelay returned true for injected wallet",
    );
  }

  return { strategy, cap, gaslessStatus, sdk };
}

export async function solveWithInjectedWalletBatching({
  walletClient,
  publicClient,
  chainId,
  sponsorAddress,
  taskTypeString,
  intentData,
  quoteResult,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  chainId: number;
  sponsorAddress: `0x${string}`;
  taskTypeString: string;
  intentData: Record<string, unknown>;
  quoteResult: Awaited<ReturnType<EpochIntentSDK["getIntentQuote"]>>;
}) {
  const { sdk } = await probeInjectedWalletBatching({
    walletClient,
    publicClient,
    chainId,
  });

  // Injected wallet: user pays gas. Batching happens inside depositToCompact /
  // solveIntent when strategy.mode === "atomic".
  //
  // Do NOT pass allowGaslessSmartAccount — that flag is local-signer only.
  // gasless: true without allowGaslessSmartAccount still uses wallet-paid execution.
  const result = await sdk.solveIntent({
    isNative: false,
    sponsorAddress,
    taskTypeString,
    intentData,
    quoteResult,
    gasless: false,
    onExecutionStatus: (status) => {
      if (status.phase === "batching") {
        console.log("Wallet batch in progress (wallet_sendCalls)…");
      }
      if (status.phase === "sending") {
        console.log("Sending transaction(s)…");
      }
    },
  });

  // result.gaslessUsed is undefined/false for injected wallets — relay never runs
  if (result.gaslessUsed) {
    console.warn(
      "Unexpected gaslessUsed=true on injected wallet — verify walletClient.account.type",
    );
  }

  return result;
}

/**
 * Edge cases to handle in UI (see gasless-deposits.md):
 *
 * 1. Plain EOA (no 7702 delegation, atomic unsupported)
 *    → strategy.mode === "sequential-tx"
 *    → approve + deposit = two wallet prompts; user pays gas twice.
 *
 * 2. Smart wallet already active (7702 delegated or atomic enabled)
 *    → strategy.mode === "atomic"
 *    → one wallet_sendCalls prompt; user still pays gas (not gasless relay).
 *
 * 3. User rejects atomic batch
 *    → SDK throws TransactionError; no automatic gasless fallback.
 *
 * 4. Batch RPC failure (non-user-reject)
 *    → SDK may fall back to sequential eth_sendTransaction per call.
 *
 * 5. USDT-style tokens (approve must reset to 0 first)
 *    → SDK may build [approve(0), approve(N), deposit] — batching depends on wallet.
 *
 * 6. gasless: true + allowGaslessSmartAccount on injected wallet
 *    → Relay still not used (account.type !== "local"); user pays gas.
 *    → Do not show "gasless" UX for browser wallets unless wallet vendor sponsors gas.
 *
 * 7. delegation === "other"
 *    → Unsupported delegate bytecode; batch may work but gasless relay will fail on local EOA too.
 *
 * 8. Multi-leg intent execution (resourceLockRequired: false)
 *    → Contiguous same-chain txs grouped via executeWalletBatch when atomic.
 *    → onExecutionStatus phase "batching" before per-leg "sending".
 */
