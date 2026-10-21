export type RpcTransaction = {
  hash: string;
  blockNumber: string | null;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  nonce: string;
  input: string;
};

export type RpcReceipt = {
  status: string | null;
  gasUsed: string;
  effectiveGasPrice?: string;
  contractAddress: string | null;
  logs: unknown[];
};

export function hexToBigInt(value: string | null | undefined) {
  if (!value || !/^0x[0-9a-f]+$/i.test(value)) return 0n;
  return BigInt(value);
}

export function formatUnits(value: bigint, decimals: number, precision = 6) {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const remainder = (value % base).toString().padStart(decimals, "0").slice(0, precision).replace(/0+$/, "");
  return remainder ? `${whole}.${remainder}` : whole.toString();
}

export function buildSnapshot(transaction: RpcTransaction, receipt: RpcReceipt | null, blockTimestamp: string | null, source: string) {
  const gasUsed = hexToBigInt(receipt?.gasUsed);
  const effectiveGasPrice = hexToBigInt(receipt?.effectiveGasPrice ?? transaction.gasPrice ?? transaction.maxFeePerGas);
  const inputBytes = transaction.input === "0x" ? 0 : Math.max(0, (transaction.input.length - 2) / 2);
  return {
    hash: transaction.hash.toLowerCase(),
    blockNumber: transaction.blockNumber ? hexToBigInt(transaction.blockNumber).toString() : null,
    blockTimestamp,
    from: transaction.from.toLowerCase(),
    to: transaction.to?.toLowerCase() ?? null,
    valueWei: hexToBigInt(transaction.value).toString(),
    valueEth: formatUnits(hexToBigInt(transaction.value), 18),
    nonce: hexToBigInt(transaction.nonce).toString(),
    gasLimit: hexToBigInt(transaction.gas).toString(),
    gasUsed: receipt ? gasUsed.toString() : null,
    effectiveGasPriceWei: receipt ? effectiveGasPrice.toString() : null,
    effectiveGasPriceGwei: receipt ? formatUnits(effectiveGasPrice, 9, 4) : null,
    transactionFeeEth: receipt ? formatUnits(gasUsed * effectiveGasPrice, 18, 8) : null,
    executionStatus: receipt?.status === "0x1" ? "success" : receipt?.status === "0x0" ? "reverted" : "pending",
    inputBytes,
    contractInteraction: Boolean(transaction.to && inputBytes > 0),
    contractCreation: transaction.to === null,
    createdContract: receipt?.contractAddress?.toLowerCase() ?? null,
    logCount: receipt?.logs.length ?? 0,
    source,
    observedAt: new Date().toISOString(),
    limitation: "This is a point-in-time RPC observation, not a fraud determination or complete wallet history.",
  };
}
