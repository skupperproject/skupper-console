import { FC, useCallback, useState } from 'react';

import { SearchInput } from '@patternfly/react-core';

import { TopologyLabels } from '../Topology.enum';

export interface ResourcesOptionsProps {
  name: string;
  identity: string;
}

interface DisplayResourcesProps {
  onSelect: (searchText: string) => void;
  placeholder?: string;
}

const DisplayResources: FC<DisplayResourcesProps> = function ({
  placeholder = TopologyLabels.DisplayResourcesDefaultLabel,
  onSelect
}) {
  const [searchText, setSearchText] = useState('');

  const handleClear = useCallback(() => {
    setSearchText('');
    onSelect?.('');
  }, [onSelect]);

  const handleTextInputChange = (selection: string) => {
    setSearchText(selection);
    onSelect?.(selection);
  };

  return (
    <SearchInput
      data-testid="sk-search-box"
      className="sk-search-filter"
      placeholder={placeholder}
      onChange={(_, selection) => handleTextInputChange(selection)}
      value={searchText}
      onClear={handleClear}
    />
  );
};

export default DisplayResources;
