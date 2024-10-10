import { Button, Icon, Popover, Text } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InfoCircleIcon } from '@patternfly/react-icons';

const WarningMessage =
  'The sites are connected, but not all the links are active. For example, this situation can occur when one of the sites is in High Availability (HA).';

const statusMap: Record<
  string,
  {
    icon: JSX.Element;
    status: 'success' | 'danger' | 'warning' | undefined;
    text: 'up' | 'down';
  }
> = {
  success: {
    icon: <CheckCircleIcon />,
    status: 'success',
    text: 'up'
  },
  danger: {
    icon: <ExclamationCircleIcon />,
    status: 'danger',
    text: 'down'
  },
  warning: {
    icon: <CheckCircleIcon />,
    status: 'warning',
    text: 'up'
  }
};

interface SkLinkStatusCellProps {
  data: { destinationSiteId: string; status: 'down' | 'up' | 'partially_up' };
}

const SkLinkStatusCell = function ({ data }: SkLinkStatusCellProps) {
  let linkStatus = 'default';

  if (data.destinationSiteId) {
    if (data.status === 'down') {
      linkStatus = 'danger';
    }

    if (data.status === 'up') {
      linkStatus = 'success';
    }

    if (data.status === 'partially_up') {
      linkStatus = 'warning';
    }
  }

  const { icon, status, text } = statusMap[linkStatus];

  return (
    <Text component="h4">
      <Icon isInline size="md" status={status}>
        {icon}
      </Icon>{' '}
      {text}
      {status === 'warning' && (
        <Popover position={'right'} bodyContent={WarningMessage}>
          <Button variant="plain">
            <Icon>
              <InfoCircleIcon />
            </Icon>
          </Button>
        </Popover>
      )}
    </Text>
  );
};

export default SkLinkStatusCell;
