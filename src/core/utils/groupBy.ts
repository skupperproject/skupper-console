/**
 * Transform an array to an abject grouped by some conditions.
 */
export function groupBy<K extends keyof V, V>(array: V[], grouper: (item: V) => K) {
    return array.reduce((acc, item) => {
        const key = grouper(item);
        (acc[key] = acc[key] || []).push(item);

        return acc;
    }, {} as Record<K, V[]>);
}
