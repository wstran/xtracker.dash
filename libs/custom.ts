import Decimal from "decimal.js";

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(36, 42)}`
}

export function roundDown(value: number | string, decimals: number, DOWN?: boolean) {
  let result = new Decimal(value).toFixed(decimals, Decimal.ROUND_DOWN);
  if (DOWN) {
    let adjustment = new Decimal(1).dividedBy(new Decimal(10).pow(decimals));
    result = new Decimal(result).minus(adjustment).toFixed(decimals, Decimal.ROUND_DOWN);
  }
  return result;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))