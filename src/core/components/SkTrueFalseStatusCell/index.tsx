import { Icon, Text } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';

const statusMap: Record<
  string,
  {
    icon: JSX.Element;
    status?: 'success' | 'custom';
  }
> = {
  success: {
    icon: <CheckCircleIcon />,
    status: 'success'
  },
  custom: {
    icon: <span></span>
  }
};

interface SkTrueFalseStatusCellProps {
  value: boolean;
}

const SkTrueFalseStatusCell = function ({ value }: SkTrueFalseStatusCellProps) {
  const { icon, status } = value ? statusMap.success : statusMap.custom;

  return (
    <Text component="h4">
      <Icon isInline size="md" status={status}>
        {icon}
      </Icon>
    </Text>
  );
};

export default SkTrueFalseStatusCell;
