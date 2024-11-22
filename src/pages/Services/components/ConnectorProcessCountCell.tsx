import { Button, List, ListItem, Popover } from '@patternfly/react-core';

import { ConnectorResponse } from 'types/REST.interfaces';

import SkLinkCell, { SkLinkCellProps } from '../../../core/components/SkLinkCell';
import { ProcessesLabels, ProcessesRoutesPaths } from '../../Processes/Processes.enum';

const ConnectorProcessCountCell = function (props: SkLinkCellProps<ConnectorResponse>) {
  return (
    <Popover
      bodyContent={
        <List isPlain>
          {props.data.processes?.map((process) => (
            <ListItem key={process.identity}>
              {SkLinkCell({
                ...props,
                value: process.target,
                type: 'process',
                link: `${ProcessesRoutesPaths.Processes}/${process.target}@${props.data.processId}?type=${ProcessesLabels.Details}`
              })}
            </ListItem>
          ))}
        </List>
      }
    >
      <Button variant="link" className="pf-v5-u-p-0">
        {props.value}
      </Button>
    </Popover>
  );
};

export default ConnectorProcessCountCell;
