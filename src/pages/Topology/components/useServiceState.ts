import { useState, useCallback } from 'react';

const SERVICE_OPTIONS = 'service-options';

const useServiceState = (serviceIds?: string[]) => {
  const [serviceIdsSelected, setServiceIdsSelected] = useState<string[] | undefined>(serviceIds);

  const handleServiceSelected = useCallback((ids: string[] | undefined) => {
    setServiceIdsSelected(ids);
  }, []);

  const saveServiceIdsToLocalStorage = useCallback(() => {
    localStorage.setItem(SERVICE_OPTIONS, JSON.stringify(serviceIdsSelected));
  }, [serviceIdsSelected]);

  const getServiceIdsFromLocalStorage = useCallback(() => {
    const storedServiceIds = localStorage.getItem(SERVICE_OPTIONS);

    if (storedServiceIds) {
      setServiceIdsSelected(JSON.parse(storedServiceIds));
    }
  }, []);

  return {
    serviceIdsSelected,
    handleServiceSelected,
    saveServiceIdsToLocalStorage,
    getServiceIdsFromLocalStorage
  };
};

export default useServiceState;
