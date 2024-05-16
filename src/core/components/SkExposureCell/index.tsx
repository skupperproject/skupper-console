import { Label } from '@patternfly/react-core';

import { ProcessesLabels } from '@pages/Processes/Processes.enum';

const SkExposureCell = function ({ value }: { value: 'bound' | 'unbound' }) {
  if (value === 'bound') {
    return <Label color="blue">{ProcessesLabels.IsExposed}</Label>;
  }

  return <Label color="gold">{ProcessesLabels.IsNotExposed}</Label>;
};

export default SkExposureCell;
