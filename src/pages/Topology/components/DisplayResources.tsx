import { ChangeEvent, FC, MouseEvent, useCallback, useMemo, useState } from 'react';

import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';

import { TopologyLabels } from '../Topology.enum';

interface DisplayResourcesProps {
  id?: string;
  options: { name: string; identity: string }[];
  onSelect: Function;
  placeholder?: string;
}

const FILTER_BY_SERVICE_MAX_HEIGHT = 400;
const FILTER_BY_SERVICE_MIN_WIDTH = 150;

const DisplayResources: FC<DisplayResourcesProps> = function ({
  id,
  placeholder = TopologyLabels.DisplayResourcesDefaultLabel,
  onSelect,
  options
}) {
  const [isSelectMenuOpen, setIsServiceSelectMenuOpen] = useState(false);

  function handleToggleMenu(openServiceMenu: boolean) {
    setIsServiceSelectMenuOpen(openServiceMenu);
  }

  function handleClear() {
    if (onSelect) {
      onSelect(undefined);
    }
  }

  function handleSelect(_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) {
    const currentSelected = selection as string;

    setIsServiceSelectMenuOpen(false);

    if (onSelect) {
      onSelect(currentSelected);
    }
  }

  const getOptions = useMemo(
    () =>
      (options || []).map(({ name, identity }, index) => (
        <SelectOption key={index + 1} value={identity}>
          {name}
        </SelectOption>
      )),
    [options]
  );

  const handleFind = useCallback(
    (_: ChangeEvent<HTMLInputElement> | null, value: string) =>
      getOptions
        .filter((element) => !value || element.props.children.toString().toLowerCase().includes(value.toLowerCase()))
        .filter(Boolean),
    [getOptions]
  );

  return (
    <Select
      role="resource-select"
      isOpen={isSelectMenuOpen}
      placeholderText={placeholder}
      onSelect={handleSelect}
      onToggle={(_, isOpen) => handleToggleMenu(isOpen)}
      selections={id}
      hasInlineFilter
      inlineFilterPlaceholderText={TopologyLabels.ProcessFilterPlaceholderText}
      onFilter={handleFind}
      style={{
        minWidth: `${FILTER_BY_SERVICE_MIN_WIDTH}px`,
        maxHeight: `${FILTER_BY_SERVICE_MAX_HEIGHT}px`,
        overflow: 'auto'
      }}
      onClear={handleClear}
    >
      {getOptions}
    </Select>
  );
};

export default DisplayResources;
