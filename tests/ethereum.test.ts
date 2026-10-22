import { describe, expect, it } from "vitest";
import { buildSnapshot, decodeTokenTransfers, formatUnits, hexToBigInt, scoreRules } from "../src/lib/ethereum";

describe("Ethereum RPC parsing", () => {
  it("parses hexadecimal quantities without losing integer precision", () => {
    expect(hexToBigInt("0xde0b6b3a7640000")).toBe(BigInt("1000000000000000000"));
    expect(formatUnits(BigInt("1234567890000000000"), 18)).toBe("1.234567");
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

describe("forensic analysis",()=>{
  it("decodes Transfer topics without inventing token decimals",()=>{const logs=[{address:"0x1111111111111111111111111111111111111111",topics:["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",`0x${"0".repeat(24)}${"2".repeat(40)}`,`0x${"0".repeat(24)}${"3".repeat(40)}`],data:"0x64",logIndex:"0x1"}];expect(decodeTokenTransfers(logs)[0].amountRaw).toBe("100")});
  it("keeps rule scoring explainable",()=>{const result=scoreRules({valueWei:"100000000000000000000",gasUsed:"600000",inputBytes:0,executionStatus:"success",contractCreation:false,tokenTransfers:[]});expect(result.score).toBe(55);expect(result.mode).toBe("deterministic-rules")});
});
