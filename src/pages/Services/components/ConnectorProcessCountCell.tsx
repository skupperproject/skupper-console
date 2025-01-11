import { Button, List, ListItem, Popover } from '@patternfly/react-core';
import { ConnectorResponse } from 'types/REST.interfaces';

import { Labels } from '../../../config/labels';
import SkLinkCell, { SkLinkCellProps } from '../../../core/components/SkLinkCell';
import { ProcessesRoutesPaths } from '../../Processes/Processes.enum';

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
                link: `${ProcessesRoutesPaths.Processes}/${process.target}@${props.data.processId}?type=${Labels.Details}`
              })}
            </ListItem>
          ))}
        </List>
      }
    >
      <Button variant="link">{props.value}</Button>
    </Popover>
  );
};

export default ConnectorProcessCountCell;
