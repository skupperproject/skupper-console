import { useState, MouseEvent as ReactMouseEvent, FC } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useParams, useSearchParams } from 'react-router-dom';

import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import Overview from '../components/Overview.';
import ProcessList from '../components/ProcessList';
import { ComponentLabels } from '../Components.enum';
import { useComponentData } from '../hooks/useComponentData';

interface ComponentProps {
  id: string;
  defaultTab: string;
}

const ComponentContent: FC<ComponentProps> = function ({ id, defaultTab }) {
  const {
    component,
    processes,
    summary: { processCount }
  } = useComponentData(id);

  const [tabSelected, setTabSelected] = useState(defaultTab);
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ComponentLabels);
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={ComponentLabels.Overview} title={<TabTitleText>{ComponentLabels.Overview}</TabTitleText>} />
        <Tab
          eventKey={ComponentLabels.Processes}
          title={<TabTitleText>{ComponentLabels.Processes}</TabTitleText>}
          disabled={!processCount}
        />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.componentView(id)}
      title={component.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Components}&${TopologyURLQueyParams.IdSelected}=${id}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ComponentLabels.Overview && <Overview component={component} processes={processes} />}
          {tabSelected === ComponentLabels.Processes && <ProcessList processes={processes} />}
        </>
      }
    />
  );
};

const Component = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || ComponentLabels.Overview;

  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <ComponentContent defaultTab={type} id={id} />;
};

export default Component;
