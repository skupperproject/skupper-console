export function formatToDecimalPlacesIfCents(amount: number, decimal = 2) {
  return amount % 1 !== 0 ? Number(amount.toFixed(decimal)) : amount;
}
