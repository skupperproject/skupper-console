import { FC } from 'react';

import { Protocols } from '../../../API/REST.enum';
import { extractUniqueValues } from '../../../core/utils/extractUniqueValues';
import { mapDataToMetricFilterOptions } from '../../../core/utils/getResourcesFromPairs';
import { removeDuplicatesFromArrayOfObjects } from '../../../core/utils/removeDuplicatesFromArrayOfObjects';
import { SiteResponse } from '../../../types/REST.interfaces';
import Metrics from '../../shared/Metrics';
import { useSiteOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  site: SiteResponse;
}

const Overview: FC<OverviewProps> = function ({ site: { identity: id, name } }) {
  const { pairsTx, pairsRx } = useSiteOverviewData(id);

  const sourceSites = [{ id, destinationName: name }];
  const destSites = removeDuplicatesFromArrayOfObjects([
    ...mapDataToMetricFilterOptions(pairsTx, 'destinationId', 'destinationName'),
    ...mapDataToMetricFilterOptions(pairsRx, 'sourceId', 'sourceName')
  ]);
  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];
  // Default destination site for Prometheus queries, representing the sum of all destination sites.
  // We explicitly set this prop to ensure the destination site is included in the Prometheus query; otherwise, the result will also include values from the source site itself.
  const destSite = destSites.map((site) => site.id).join('|');

  return (
    <Metrics
      key={id}
      sessionKey={id}
      sourceSites={sourceSites}
      destSites={destSites}
      availableProtocols={uniqueProtocolsAarray}
      defaultMetricFilterValues={{
        sourceSite: id, // prometheus read a site id as id. That's different compeare to processes and services
        destSite
      }}
      configFilters={{
        sourceSites: { disabled: true },
        destSites: { hide: !destSites.length },
        destinationProcesses: { hide: true },
        sourceProcesses: { hide: true }
      }}
    />
  );
};

export default Overview;
