import { useState, MouseEvent as ReactMouseEvent, FC } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useParams, useSearchParams } from 'react-router-dom';

import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../../core/utils/getIdAndNameFromUrlParams';
import useUpdateQueryStringValueWithoutNavigation from '../../../hooks/useUpdateQueryStringValueWithoutNavigation';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '../../Topology/Topology.enum';
import Details from '../components/Details';
import Overview from '../components/Overview';
import PairsList from '../components/PairsList';
import { useProcessData } from '../hooks/useProcessData';
import { ProcessesLabels } from '../Processes.enum';

interface ProcessProps {
  id: string;
  defaultTab: string;
}

const ProcessContent: FC<ProcessProps> = function ({ id, defaultTab }) {
  const {
    process,
    summary: { processPairsCount }
  } = useProcessData(id);

  const [tabSelected, setTabSelected] = useState(defaultTab);
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ProcessesLabels);
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={ProcessesLabels.Overview} title={<TabTitleText>{ProcessesLabels.Overview}</TabTitleText>} />
        <Tab eventKey={ProcessesLabels.Details} title={<TabTitleText>{ProcessesLabels.Details}</TabTitleText>} />
        <Tab
          disabled={!processPairsCount}
          eventKey={ProcessesLabels.ProcessPairs}
          title={<TabTitleText>{ProcessesLabels.ProcessPairs}</TabTitleText>}
        />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.processView(id)}
      title={process.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${id}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ProcessesLabels.Overview && <Overview process={process} />}
          {tabSelected === ProcessesLabels.Details && <Details process={process} />}
          {tabSelected === ProcessesLabels.ProcessPairs && <PairsList process={process} />}
        </>
      }
    />
  );
};

const Process = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || ProcessesLabels.Overview;

  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <ProcessContent defaultTab={type} id={id} />;
};

export default Process;
