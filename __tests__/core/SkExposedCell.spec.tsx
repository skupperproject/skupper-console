import { render } from '@testing-library/react';

import { Binding } from '../../src/API/REST.enum';
import SkExposedCell from '../../src/core/components/SkExposedCell';
import { ProcessesLabels } from '../../src/pages/Processes/Processes.enum';

describe('SkExposedCell', () => {
  it('should renders "IsExposed" label when value is Binding.Exposed', () => {
    const { getByText } = render(<SkExposedCell value={Binding.Exposed} />);
    const label = getByText(ProcessesLabels.IsExposed);
    expect(label).toBeInTheDocument();
  });

  it('should renders "IsNotExposed" label when value is not Binding.Exposed', () => {
    const { getByText } = render(<SkExposedCell value={Binding.Unexposed} />);
    const label = getByText(ProcessesLabels.IsNotExposed);
    expect(label).toBeInTheDocument();
  });
});
