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
  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const handleSelected = useCallback((selected?: string[]) => {
    setIdsSelected(selected);
  }, []);

  const handleShowOnlyNeighbours = useCallback((checked: boolean) => {
    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
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

  const getDisplaySelectedFromLocalStorage = useCallback(() => {
    const storedOptions = localStorage.getItem(displayOptionsEnabledKey);

    if (storedOptions) {
      handleDisplaySelected(storedOptions !== 'undefined' ? JSON.parse(storedOptions) : undefined);
    }
  }, [displayOptionsEnabledKey, handleDisplaySelected]);

  return {
    idsSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    displayOptionsSelected,
    handleDisplaySelected,
    getDisplaySelectedFromLocalStorage,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked
  };
};

export default useTopologyState;
