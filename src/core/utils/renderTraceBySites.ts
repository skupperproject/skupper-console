export function renderTraceBySites(traces: string[]) {
  if (!traces.length) {
    return '';
  }

  return traces.join(' -> ');
}
