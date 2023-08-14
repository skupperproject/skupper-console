export function getIdAndNameFromUrlParams(urlParams: string) {
  const params = urlParams.split('@');

  return { id: params[1], name: params[0], protocol: params[2] };
}
