import { Protocols, SortDirection } from './REST.enum';
import { QueryParams, QueryFilters, PairsResponse, RouterLinkResponse } from '../types/REST.interfaces';

export function mapQueryFiltersToQueryParams({
  filter,
  offset,
  limit,
  sortDirection,
  sortName,
  timeRangeEnd,
  timeRangeStart,
  ...queryParams
}: QueryFilters): QueryParams {
  return {
    filter,
    offset,
    limit,
    timeRangeEnd,
    timeRangeStart,
    sortBy: sortName ? `${sortName}.${sortDirection || SortDirection.ASC}` : null,
    ...queryParams
  };
}

// Composes a path from an array of elements.
export function composePath(elements: string[]): string {
  return elements.join('/');
}

// Backend -> Frontend props mapper
export const responsePropNameMapper = {
  identity: 'identity',
  startTime: 'startTime',
  endTime: 'endTime',
  username: 'username',
  authType: 'authType',
  name: 'name',
  nameSpace: 'nameSpace',
  siteVersion: 'siteVersion',
  platform: 'platform',
  routerCount: 'routerCount',
  parent: 'parent',
  namespace: 'namespace',
  hostName: 'hostName',
  buildVersion: 'buildVersion',
  imageName: 'imageName',
  imageVersion: 'imageVersion',
  mode: 'mode',
  cost: 'cost',
  routerAccessId: 'routerAccessId',
  destinationRouterId: 'destinationRouterId',
  destinationRouterName: 'destinationRouterName',
  destinationSiteId: 'destinationSiteId',
  destinationSiteName: 'destinationSiteName',
  routerId: 'routerId',
  routerName: 'routerName',
  sourceSiteId: 'sourceSiteId',
  sourceSiteName: 'sourceSiteName',
  role: 'role',
  status: 'status',
  octets: 'octets',
  octetsReverse: 'octetsReverse',
  sourceId: 'sourceId',
  sourceName: 'sourceName',
  destinationId: 'destinationId',
  destinationName: 'destinationName',
  processGroupRole: 'processGroupRole',
  processCount: 'processCount',
  parentName: 'parentName',
  groupIdentity: 'groupIdentity',
  groupName: 'groupName',
  sourceHost: 'sourceHost',
  processBinding: 'processBinding',
  processRole: 'processRole',
  addresses: 'addresses',
  processPairs: 'processPairs',
  prometheusKey: 'prometheusKey',
  processPairsKey: 'processPairsKey',
  metrics: 'metrics',
  bytes: 'bytes',
  byteRate: 'byteRate',
  latency: 'latency',
  connectionId: 'connectionId',
  method: 'method',
  traceRouters: 'traceRouters',
  traceSites: 'traceSites',
  routingKey: 'routingKey',
  duration: 'duration',
  listenerId: 'listenerId',
  connectorId: 'connectorId',
  listenerError: 'listenerError',
  proxyHost: 'proxyHost',
  proxyPort: 'proxyPort',
  destHost: 'destHost',
  destPort: 'destPort',
  sourcePort: 'sourcePort'
};

// Function to aggregate the pairs by sourceId and destinationId, updating only the protocol
export const aggregateDistinctPairs = <T extends PairsResponse>(pairs: T[]): T[] => {
  const map = new Map<string, T>();

  pairs
    .filter(({ sourceId, destinationId }) => sourceId !== destinationId)
    // We assure that the transport protocols are the first to be iterated during the following forEach/
    // At the moment we support only TCP as a transport protocol
    .sort((a, b) =>
      a.protocol === Protocols.Tcp ? -1 : b.protocol === Protocols.Tcp ? 1 : a.protocol.localeCompare(b.protocol)
    )
    .forEach((pair) => {
      const { sourceId, destinationId, protocol } = pair;

      const key = `${sourceId}-${destinationId}`;
      const entry = map.get(key);

      if (entry) {
        // always catch application protocols
        entry.observedApplicationProtocols = [entry.observedApplicationProtocols, protocol].filter(Boolean).join(', ');
      } else {
        const observedApplicationProtocols = protocol !== Protocols.Tcp ? protocol : '';
        // protocol always TCP because the pairs are sorted by the transport protocol
        map.set(key, { ...pair, observedApplicationProtocols });
      }
    });

  return Array.from(map.values());
};

export const aggregateLinksBySite = (linksData: RouterLinkResponse[]): RouterLinkResponse[] =>
  linksData.length === 0
    ? []
    : Object.values(
        linksData.reduce(
          (acc, link) => {
            const key = `${link.sourceSiteId}-${link.destinationSiteId}`;
            acc[key] = acc[key] || [];
            acc[key].push(link);

            return acc;
          },
          {} as { [key: string]: RouterLinkResponse[] }
        )
      ).map((links) => {
        const referenceLink = { ...links[0] };
        const allStatuses = links.map(({ status }) => status);
        referenceLink.status = allStatuses.every((s) => s === 'up')
          ? 'up'
          : allStatuses.every((s) => s === 'down')
            ? 'down'
            : 'partially_up';

        return referenceLink;
      });
