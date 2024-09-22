import { Protocols } from '@API/REST.enum';
import { ProcessPairsResponse, PairsResponse } from '@sk-types/REST.interfaces';

export const filterPairsByProtocols = (clients: ProcessPairsResponse[], servers: ProcessPairsResponse[]) => {
  const TCPClients = clients.filter(({ protocol }) => protocol === Protocols.Tcp);
  const TCPServers = servers.filter(({ protocol }) => protocol === Protocols.Tcp);

  const HTTPClients = clients.filter(({ protocol }) => [Protocols.Http, Protocols.Http2].includes(protocol));
  const HTTPServers = servers.filter(({ protocol }) => [Protocols.Http, Protocols.Http2].includes(protocol));

  const remoteClients = clients.filter(({ protocol }) => protocol === undefined);
  const remoteServers = servers.filter(({ protocol }) => protocol === undefined);

  return {
    TCPClients,
    TCPServers,
    HTTPClients,
    HTTPServers,
    remoteClients,
    remoteServers
  };
};

export function invertProcessPairsList<T extends PairsResponse>(processPairs: T[]): T[] {
  return processPairs.map((pair) => ({
    ...pair,
    sourceId: pair.destinationId,
    sourceName: pair.destinationName,
    destinationId: pair.sourceId,
    destinationName: pair.sourceName
  }));
}
