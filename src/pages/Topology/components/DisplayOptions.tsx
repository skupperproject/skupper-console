import { FC } from 'react';

import SkSelect, { SkSelectGroupedOptions } from '@core/components/SkSelect';

import { DisplayUseOptionsStateProps, useDisplayOptionsState } from '../hooks/useDisplayOptionsState';
import { TopologyLabels } from '../Topology.enum';

interface DisplayOptionsProps extends DisplayUseOptionsStateProps {
  options: SkSelectGroupedOptions[];
  optionsDisabled?: Record<string, boolean>;
}

const DisplayOptions: FC<DisplayOptionsProps> = function ({
  defaultSelected,
  options,
  onSelected,
  optionsDisabled = {}
}) {
  const { displayOptionsSelected, selectDisplayOptions } = useDisplayOptionsState({
    defaultSelected,
    onSelected
  });

  return (
    <SkSelect
      selected={displayOptionsSelected}
      items={options}
      isGrouped={true}
      onSelect={selectDisplayOptions}
      optionsDisabled={optionsDisabled}
      placeholder={TopologyLabels.DisplayPlaceholderText}
      hasCheckbox={true}
      forceClose={false}
      forcePlaceholder={true}
    />
  );
};

export default DisplayOptions;
