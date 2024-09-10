// TODO: We don't expect trace = undefined. Remove when BE TCP flowpair API is stabilized
export function formatTraceBySites(traces: string[]) {
  return traces.join(' -> ');
}
