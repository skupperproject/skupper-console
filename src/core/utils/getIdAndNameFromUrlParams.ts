import { Protocols } from '../../API/REST.enum';
import { DEFAULT_COMPLEX_STRING_SEPARATOR } from '../../config/app';

export function getIdAndNameFromUrlParams(urlParams: string) {
  const params = urlParams.split(DEFAULT_COMPLEX_STRING_SEPARATOR);

  return { name: params[0], id: params[1], protocol: params[2] as Protocols };
}
