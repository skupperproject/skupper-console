export function capitalizeFirstLetter(string: string) {
  return string.trim().replace(/^\w/, (c) => c.toUpperCase());
}

export function capitalizeAllFirstLetters(string: string) {
  return string.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}
