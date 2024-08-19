import { useState, useCallback } from 'react';

const SERVICE_OPTIONS = 'service-options';

const useServiceState = (serviceIds?: string[]) => {
  const [serviceIdsSelected, setServiceIdsSelected] = useState<string[] | undefined>(serviceIds);

  const handleServiceSelected = useCallback((ids: string[] | undefined) => {
    setServiceIdsSelected(ids?.sort());
  }, []);

  const saveServiceIdsToLocalStorage = useCallback(() => {
    localStorage.setItem(SERVICE_OPTIONS, JSON.stringify(serviceIdsSelected));
  }, [serviceIdsSelected]);

  const getServiceIdsFromLocalStorage = useCallback(() => {
    const storedServiceIds = localStorage.getItem(SERVICE_OPTIONS);

    //TODO: storedServiceIds !== 'undefined' only for jest unit tests.
    if (storedServiceIds && storedServiceIds !== 'undefined') {
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
