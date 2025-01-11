export const extractUniqueValues = <T, K extends keyof T>(data: T[], key: K): T[K][] => [
  ...new Set(data.map((item) => item[key]))
];
