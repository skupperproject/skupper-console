import { useState, MouseEvent as ReactMouseEvent } from 'react';

import { PageSection, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { useParams, useSearchParams } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Fade';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import { ConnectionLabels, FlowPairsLabels, RequestLabels } from '../Addresses.enum';
import ConnectionsByAddress from '../components/ConnectionsByAddress';
import RequestsByAddress from '../components/RequestsByAddress';

const TAB_0_KEY = '0';
const TAB_1_KEY = '1';
const TAB_2_KEY = '2';
const TAB_3_KEY = '3';

const FlowsPairs = function () {
  const { service } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const addressName = service?.split('@')[0];
  const addressId = service?.split('@')[1];
  const protocol = service?.split('@')[2];

  const type = searchParams.get('type') || TAB_0_KEY;
  const [tabSelected, setTabSelected] = useState(type);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  const tabTitle2 =
    protocol === AvailableProtocols.Tcp
      ? `${ConnectionLabels.ActiveConnections} (${0})`
      : `${RequestLabels.Requests} (${0})`;

  return (
    <TransitionPage>
      <>
        <SkTitle
          isPlain
          title={addressName || ''}
          link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
        >
          <Tabs activeKey={tabSelected} onSelect={handleTabClick}>
            <Tab eventKey={TAB_0_KEY} title={<TabTitleText>{`${FlowPairsLabels.Overview}`}</TabTitleText>} />
            <Tab eventKey={TAB_1_KEY} title={<TabTitleText>{`${FlowPairsLabels.Servers} (${0})`}</TabTitleText>} />
            <Tab eventKey={TAB_2_KEY} title={<TabTitleText>{tabTitle2}</TabTitleText>} />
            {protocol === AvailableProtocols.Tcp && (
              <Tab
                eventKey={TAB_3_KEY}
                title={<TabTitleText>{`${ConnectionLabels.OldConnections} (${0})`}</TabTitleText>}
              />
            )}
          </Tabs>
        </SkTitle>

        <PageSection>
          {protocol === AvailableProtocols.Tcp && (
            <ConnectionsByAddress
              addressName={addressName || ''}
              addressId={addressId || ''}
              protocol={protocol}
              viewSelected={tabSelected}
            />
          )}
          {(protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2) && (
            <RequestsByAddress
              addressName={addressName || ''}
              addressId={addressId || ''}
              protocol={protocol}
              viewSelected={tabSelected}
            />
          )}
        </PageSection>
      </>
    </TransitionPage>
  );
};
export default FlowsPairs;
