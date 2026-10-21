import { describe, expect, it } from "vitest";
import { buildSnapshot, formatUnits, hexToBigInt } from "../src/lib/ethereum";

describe("Ethereum RPC parsing", () => {
  it("parses hexadecimal quantities without losing integer precision", () => {
    expect(hexToBigInt("0xde0b6b3a7640000")).toBe(1_000_000_000_000_000_000n);
    expect(formatUnits(1_234_567_890_000_000_000n, 18)).toBe("1.234567");
  });

  it("derives transparent transaction features", () => {
    const snapshot = buildSnapshot({ hash:`0x${"a".repeat(64)}`,blockNumber:"0x10",from:`0x${"1".repeat(40)}`,to:`0x${"2".repeat(40)}`,value:"0xde0b6b3a7640000",gas:"0x5208",gasPrice:"0x3b9aca00",nonce:"0x2",input:"0x1234" }, { status:"0x1",gasUsed:"0x5208",effectiveGasPrice:"0x3b9aca00",contractAddress:null,logs:[] }, "2026-01-01T00:00:00.000Z", "example-rpc.invalid");
    expect(snapshot.valueEth).toBe("1");
    expect(snapshot.gasUsed).toBe("21000");
    expect(snapshot.transactionFeeEth).toBe("0.000021");
    expect(snapshot.contractInteraction).toBe(true);
    expect(snapshot.executionStatus).toBe("success");
  });
});
