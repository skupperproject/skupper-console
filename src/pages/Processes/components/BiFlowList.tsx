import { FC, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Card, CardBody, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ResourcesEmptyIcon } from '@patternfly/react-icons';

import { SMALL_PAGINATION_SIZE } from '../../../config/app';
import { Labels } from '../../../config/labels';
import BiFlowLogs from '../../../core/components/BiFlowLogs';
import { httpBiFlowColumns, tcpBiFlowColumns } from '../../../core/components/SkBiFlowList/BiFlowList.constants';
import SKEmptyData from '../../../core/components/SkEmptyData';
import { setColumnVisibility } from '../../../core/components/SkTable/SkTable.utils';
import useUpdateQueryStringValueWithoutNavigation from '../../../hooks/useUpdateQueryStringValueWithoutNavigation';
import {
  initActiveConnectionsQueryParams,
  initRequestsQueryParams,
  initTerminatedConnectionsQueryParams
} from '../../Services/Services.constants';
import { TopologyURLQueyParams } from '../../Topology/Topology.enum';
import { useBiflowListData } from '../hooks/useBiflowListData';

const TAB_KEYS = {
  OPEN: Labels.OpenConnections,
  TERMINATED: Labels.TerminatedConnections,
  REQUESTS: Labels.Requests
};

interface ProcessBiFlowListProps {
  sourceProcessId: string;
  destProcessId: string;
}

const BiFlowList: FC<ProcessBiFlowListProps> = function ({ sourceProcessId, destProcessId }) {
  const [tabSelected, setTabSelected] = useState<string>();
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected || '', true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
  }

  const {
    summary: { activeConnectionCount, terminatedConnectionCount, requestCount }
  } = useBiflowListData(sourceProcessId, destProcessId);

  const determineActiveTab = () => {
    if (tabSelected) {
      return tabSelected;
    }

    if (activeConnectionCount) {
      return TAB_KEYS.OPEN;
    }

    if (terminatedConnectionCount) {
      return TAB_KEYS.TERMINATED;
    }

    return '';
  };

  const tabConfigs = [
    {
      key: TAB_KEYS.OPEN,
      label: Labels.OpenConnections,
      isDisabled: !activeConnectionCount,
      columns: setColumnVisibility(tcpBiFlowColumns, {
        duration: false,
        endTime: false,
        sourceProcessName: false,
        destProcessName: false,
        sourceSiteName: false,
        destSiteName: false
      }),
      filters: { ...initActiveConnectionsQueryParams, limit: SMALL_PAGINATION_SIZE, sourceProcessId, destProcessId }
    },
    {
      key: TAB_KEYS.TERMINATED,
      label: Labels.TerminatedConnections,
      isDisabled: !terminatedConnectionCount,
      columns: setColumnVisibility(tcpBiFlowColumns, {
        sourceProcessName: false,
        destProcessName: false,
        sourceSiteName: false,
        destSiteName: false
      }),
      filters: { ...initTerminatedConnectionsQueryParams, limit: SMALL_PAGINATION_SIZE, sourceProcessId, destProcessId }
    },
    {
      key: TAB_KEYS.REQUESTS,
      label: Labels.Requests,
      isDisabled: !requestCount,
      columns: setColumnVisibility(httpBiFlowColumns, {
        sourceProcessName: false,
        destProcessName: false,
        sourceSiteName: false,
        destSiteName: false
      }),
      filters: { ...initRequestsQueryParams, limit: SMALL_PAGINATION_SIZE, sourceProcessId, destProcessId },
      additionalProps: { showAppplicationFlows: true, pagination: SMALL_PAGINATION_SIZE }
    }
  ];

  if (!activeConnectionCount && !terminatedConnectionCount && !requestCount) {
    return (
      <Card isFullHeight>
        <CardBody>
          <SKEmptyData
            message={Labels.NoBiflowFound}
            description={Labels.NoBiflowFoundDescription}
            icon={ResourcesEmptyIcon}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Tabs activeKey={determineActiveTab()} onSelect={handleTabClick} component="nav">
      {tabConfigs
        .filter(({ key, isDisabled }) => !(key === TAB_KEYS.REQUESTS && isDisabled))
        .map(({ key, label, isDisabled, columns, filters, additionalProps }) => (
          <Tab key={key} eventKey={key} title={<TabTitleText>{label}</TabTitleText>} isDisabled={isDisabled}>
            {!isDisabled && (
              <Card isFullHeight isPlain data-testid={key}>
                <CardBody>
                  <BiFlowLogs columns={columns} filters={filters} {...additionalProps} />
                </CardBody>
              </Card>
            )}
          </Tab>
        ))}
    </Tabs>
  );
};

export default BiFlowList;
