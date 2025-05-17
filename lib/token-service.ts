import { parseUnits } from "viem";
import { usdcAbi, usdcAddress } from "./usdc-abi";

// Export USDC information for use with Wagmi hooks
export const usdcContractConfig = {
  address: usdcAddress as `0x${string}`,
  abi: usdcAbi,
};

// Helper to format USDC amount with proper decimals (6)
export function formatUsdcAmount(amount: string): bigint {
  return parseUnits(amount, 6);
}

// Generate the transfer function args for the UI
export function getTransferArgs(recipient: string, amount: string): [string, bigint] {
  return [recipient, formatUsdcAmount(amount)];
} 