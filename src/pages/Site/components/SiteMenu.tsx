import React from 'react';

import { TextContent, Text, TextVariants, Flex } from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';

import { SitesServices } from '../services';
import { QuerySite } from '../site.enum';

const SiteMenu = function () {
  const navigate = useNavigate();

  const { data } = useQuery(QuerySite.GetSiteMenu, SitesServices.fetchSiteInfo, {
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;
    navigate(route);
  }

  return (
    <Flex className="pf-u-box-shadow-sm-bottom pf-u-py-md pf-u-px-xl">
      <TextContent>
        <Text component={TextVariants.h3}>{data?.siteName}</Text>
      </TextContent>
    </Flex>
  );
};

export default SiteMenu;
