import { EMPTY_VALUE_PLACEHOLDER } from '@config/config';

export function renderTraceBySites(traces: string[]) {
  if (!traces.length) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return traces.join(' -> ');
}
