import { Protocols } from '../../API/REST.enum';

export function getIdAndNameFromUrlParams(urlParams: string) {
  const params = urlParams.split('@');

  return { name: params[0], id: params[1], protocol: params[2] as Protocols };
}
