import { useState, useCallback, startTransition } from 'react';

import { TopologyController } from '../services';

const useTopologyState = ({
  ids,
  initDisplayOptionsEnabled = [],
  displayOptionsEnabledKey = ''
}: {
  ids?: string[];
  initDisplayOptionsEnabled?: string[];
  displayOptionsEnabledKey?: string;
}) => {
  const configuration =
    TopologyController.loadDisplayOptionsFromLocalStorage(displayOptionsEnabledKey) || initDisplayOptionsEnabled;

  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(configuration);
  const [idsSelected, setIdsSelected] = useState<string[] | undefined>(ids);

  const [searchText, setSearchText] = useState('');

  const handleSelected = useCallback((selected?: string[]) => {
    setIdsSelected(selected);
  }, []);

  const handleSearchText = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleDisplaySelected = useCallback(
    (options: string[]) => {
      // To prevent the UI from being replaced by a fallback during an update of React query,
      // TWe need to wrap updates that change the QueryKey into startTransition
      startTransition(() => {
        setDisplayOptions(options);
      });

      localStorage.setItem(displayOptionsEnabledKey, JSON.stringify(options));
    },
    [displayOptionsEnabledKey]
  );

  return {
    idsSelected,
    searchText,
    displayOptionsSelected,
    handleDisplaySelected,
    handleSearchText,
    handleSelected
  };
};

export default useTopologyState;
