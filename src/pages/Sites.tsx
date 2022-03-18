import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { UPDATE_INTERVAL } from '../App.constant';
import { ErrorTypes } from '../App.enum';
import { useConnectionErrType, useIsLoadingData } from '../contexts/Data';
import { RESTServices } from '../models/services/REST';
import { DataVAN } from '../models/services/REST.interfaces';

const Sites = memo(() => {
  const fetchDataTimerId = useRef(-1);
  const prevDataVan = useRef({});

  const [dataVAN, setDataVAN] = useState<DataVAN | null>();
  const { setConnectionErrType } = useConnectionErrType();
  const { setIsLoadingData } = useIsLoadingData();

  const handleFetchData = useCallback(async () => {
    try {
      const { data: dataVan } = await RESTServices.fetchData();

      if (dataVan && JSON.stringify(dataVan) !== JSON.stringify(prevDataVan.current)) {
        prevDataVan.current = dataVan;
        setDataVAN(dataVan);
      }
    } catch ({ httpStatus, message }) {
      const type = httpStatus ? ErrorTypes.Server : ErrorTypes.Connection;

      setConnectionErrType(type);
      clearInterval(fetchDataTimerId.current);
    }
  }, [setConnectionErrType]);

  const loadingData = useCallback(async () => {
    setIsLoadingData(true);
    await handleFetchData();
    setIsLoadingData(false);
  }, [handleFetchData, setIsLoadingData]);

  useEffect(() => {
    loadingData();
    fetchDataTimerId.current = window.setInterval(handleFetchData, UPDATE_INTERVAL);

    return () => clearInterval(fetchDataTimerId.current);
  }, [handleFetchData, loadingData]);

  return <pre>{JSON.stringify(dataVAN?.sites, null, 2)}</pre>;
});

export default Sites;
