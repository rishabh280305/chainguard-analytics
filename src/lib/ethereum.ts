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
  logs: Array<{address:string;topics:string[];data:string;logIndex?:string}>;
};

const TRANSFER_TOPIC="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
function topicAddress(value:string){return value.length===66?`0x${value.slice(-40)}`.toLowerCase():null}
export function decodeTokenTransfers(logs:RpcReceipt["logs"]){return logs.filter(log=>log.topics[0]?.toLowerCase()===TRANSFER_TOPIC&&log.topics.length>=3).map(log=>({token:log.address.toLowerCase(),from:topicAddress(log.topics[1]),to:topicAddress(log.topics[2]),amountRaw:hexToBigInt(log.data).toString(),logIndex:hexToBigInt(log.logIndex).toString(),standard:"ERC-20-like Transfer topic; token decimals and symbol are not inferred"}))}

export function hexToBigInt(value: string | null | undefined) {
  if (!value || !/^0x[0-9a-f]+$/i.test(value)) return BigInt(0);
  return BigInt(value);
}

export function formatUnits(value: bigint, decimals: number, precision = 6) {
  const base = BigInt(10) ** BigInt(decimals);
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
    tokenTransfers:decodeTokenTransfers(receipt?.logs??[]),
    source,
    observedAt: new Date().toISOString(),
    limitation: "This is a point-in-time RPC observation, not a fraud determination or complete wallet history.",
  };
}

export type RuleConfig={highValueEth:number;highGasUsed:number;largeInputBytes:number};
export function scoreRules(snapshot:{valueWei:string;gasUsed:string|null;inputBytes:number;executionStatus:string;contractCreation:boolean;tokenTransfers?:unknown[]},config:RuleConfig={highValueEth:100,highGasUsed:500000,largeInputBytes:4096}){const reasons:Array<{rule:string;weight:number;observed:string}>=[];const valueWei=BigInt(snapshot.valueWei);const threshold=BigInt(Math.round(config.highValueEth*1e6))*BigInt(10)**BigInt(12);if(valueWei>=threshold)reasons.push({rule:"high_native_value",weight:35,observed:`>= ${config.highValueEth} ETH`});if(snapshot.gasUsed&&BigInt(snapshot.gasUsed)>=BigInt(config.highGasUsed))reasons.push({rule:"high_gas_usage",weight:20,observed:snapshot.gasUsed});if(snapshot.inputBytes>=config.largeInputBytes)reasons.push({rule:"large_calldata",weight:15,observed:`${snapshot.inputBytes} bytes`});if(snapshot.executionStatus==="reverted")reasons.push({rule:"reverted_execution",weight:10,observed:"reverted"});if(snapshot.contractCreation)reasons.push({rule:"contract_creation",weight:5,observed:"to=null"});if((snapshot.tokenTransfers?.length??0)>=10)reasons.push({rule:"many_token_transfers",weight:15,observed:String(snapshot.tokenTransfers?.length)});return{score:Math.min(100,reasons.reduce((sum,item)=>sum+item.weight,0)),reasons,mode:"deterministic-rules",limitation:"A high score means configured observable conditions matched. It is not a fraud probability or model prediction."}}
