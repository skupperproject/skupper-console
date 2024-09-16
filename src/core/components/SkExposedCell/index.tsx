import { Label } from '@patternfly/react-core';

import { Binding } from '@API/REST.enum';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';

const SkExposedCell = function ({ value }: { value: Binding }) {
  if (value === Binding.Exposed) {
    return <Label color="blue">{ProcessesLabels.IsExposed}</Label>;
  }

  return <Label color="gold">{ProcessesLabels.IsNotExposed}</Label>;
};

export default SkExposedCell;
