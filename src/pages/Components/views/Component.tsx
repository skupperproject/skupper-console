import { useState, MouseEvent as ReactMouseEvent, FC } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useParams, useSearchParams } from 'react-router-dom';

import { Labels } from '../../../config/labels';
import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../../core/utils/getIdAndNameFromUrlParams';
import useUpdateQueryStringValueWithoutNavigation from '../../../hooks/useUpdateQueryStringValueWithoutNavigation';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '../../Topology/Topology.enum';
import Overview from '../components/Overview.';
import PairsList from '../components/PairList';
import ProcessList from '../components/ProcessList';
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
    setTabSelected(tabIndex as string);
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={Labels.Overview} title={<TabTitleText>{Labels.Overview}</TabTitleText>} />
        <Tab eventKey={Labels.Pairs} title={<TabTitleText>{Labels.Pairs}</TabTitleText>} />
        <Tab
          eventKey={Labels.Processes}
          title={<TabTitleText>{Labels.Processes}</TabTitleText>}
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
          {tabSelected === Labels.Overview && <Overview component={component} processes={processes} />}
          {tabSelected === Labels.Pairs && <PairsList component={component} />}
          {tabSelected === Labels.Processes && <ProcessList processes={processes} />}
        </>
      }
    />
  );
};

const Component = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || Labels.Overview;

  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <ComponentContent defaultTab={type} id={id} />;
};

export default Component;
