import { useState, useCallback, startTransition } from 'react';

import { TopologyController } from '../services';
import { SHOW_ROUTER_LINKS } from '../Topology.constants';

const DISPLAY_OPTIONS = 'display-site-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_ROUTER_LINKS];

const useTopologyState = ({ id }: { id?: string }) => {
  const configuration =
    TopologyController.loadDisplayOptionsFromLocalStorage(DISPLAY_OPTIONS) || DEFAULT_DISPLAY_OPTIONS_ENABLED;

  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(configuration);
  const [idSelected, setIdSelected] = useState<string | undefined>(id);
  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const handleSelected = useCallback((selected?: string) => {
    setIdSelected(selected);
  }, []);

  const handleShowOnlyNeighbours = useCallback((checked: boolean) => {
    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  const handleDisplaySelect = useCallback((options: string[]) => {
    // To prevent the UI from being replaced by a fallback during an update of React query,
    // TWe need to wrap updates that change the QueryKey into startTransition
    startTransition(() => {
      setDisplayOptions(options);
    });

    localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(options));
  }, []);

  return {
    idSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    displayOptionsSelected,
    handleDisplaySelect,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked
  };
};

export default useTopologyState;
