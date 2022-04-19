/**
 * Capitalize a text.
 */
export function capitalizeFirstLetter(text: string): string {
    return text.trim().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Capitalize all first letters of a text.
 */
export function capitalizeAllFirstLetters(text: string): string {
    return text.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}
