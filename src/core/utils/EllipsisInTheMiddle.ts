export function ellipsisInTheMiddle(
  str: string,
  options?: { maxLength?: number; leftPartLenth?: number; rightPartLength?: number }
) {
  const maxLength = options?.maxLength || 20;
  const leftPartLength = options?.leftPartLenth || 15;
  const rightPartLength = options?.rightPartLength || 5;

  if (str.length <= maxLength) {
    return str;
  }

  const leftPart = str.substring(0, leftPartLength);
  const rightPart = str.substring(str.length - rightPartLength);

  return `${leftPart}...${rightPart}`;
}
