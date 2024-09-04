import { FC } from 'react';

import { Badge, Tab, TabTitleText, Tabs } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';
import { TopologyURLQueyParams } from '@pages/Topology/Topology.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY } from '../Services.constants';
import { ServicesLabels } from '../Services.enum';

interface NavigationMenuProps {
  protocol: AvailableProtocols | undefined;
  serverCount: number;
  //requestsCount: number;
  tcpActiveConnectionCount: number;
  tcpTerminatedConnectionCount: number;
  menuSelected: string;
  onMenuSelected?: (index: string) => void;
}
const NavigationMenu: FC<NavigationMenuProps> = function ({
  serverCount,
  //requestsCount,
  tcpActiveConnectionCount,
  tcpTerminatedConnectionCount,
  protocol,
  menuSelected,
  onMenuSelected
}) {
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, menuSelected, true);

  const handleMenuClick = (tabIndex: string | number) => {
    onMenuSelected?.(tabIndex as string);
  };

  return (
    <Tabs activeKey={menuSelected} onSelect={(_, index) => handleMenuClick(index)} component="nav">
      <Tab eventKey={TAB_0_KEY} title={<TabTitleText>{`${ServicesLabels.Overview}`}</TabTitleText>} />
      <Tab
        isDisabled={!serverCount}
        eventKey={TAB_1_KEY}
        title={
          <TabTitleText>
            {`${ServicesLabels.Servers} `}
            {!!serverCount && (
              <Badge isRead key={1}>
                {serverCount}
              </Badge>
            )}
          </TabTitleText>
        }
      />
      {/* {protocol !== AvailableProtocols.Tcp && (
        <Tab
          isDisabled={!requestsCount}
          eventKey={TAB_2_KEY}
          title={<TabTitleText>{ServicesLabels.Requests}</TabTitleText>}
        />
      )} */}
      {protocol === AvailableProtocols.Tcp && (
        <Tab
          isDisabled={!tcpActiveConnectionCount}
          eventKey={TAB_2_KEY}
          title={<TabTitleText>{ServicesLabels.ActiveConnections}</TabTitleText>}
        />
      )}

      {protocol === AvailableProtocols.Tcp && (
        <Tab
          isDisabled={!tcpTerminatedConnectionCount}
          eventKey={TAB_3_KEY}
          title={<TabTitleText>{ServicesLabels.OldConnections}</TabTitleText>}
        />
      )}
    </Tabs>
  );
};

export default NavigationMenu;
