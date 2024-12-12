import { BIG_PAGINATION_SIZE } from '../../../config/app';
import { Labels } from '../../../config/labels';
import { getTestsIds } from '../../../config/testIds';
import SkTable from '../../../core/components/SkTable';
import SkSearchFilter from '../../../core/components/SkTable/SkSearchFilter';
import MainContainer from '../../../layout/MainContainer';
import useServicesData from '../hooks/useServicesData';
import { ServiceColumns, customServiceCells, servicesSelectOptions } from '../Services.constants';

const Services = function () {
  const {
    services,
    summary: { serviceCount },
    handleSetServiceFilters
  } = useServicesData({ limit: BIG_PAGINATION_SIZE });

  return (
    <MainContainer
      dataTestId={getTestsIds.servicesView()}
      title={Labels.Services}
      description={Labels.ServicesDescription}
      mainContentChildren={
        <>
          <SkSearchFilter onSearch={handleSetServiceFilters} selectOptions={servicesSelectOptions} />

          <SkTable
            rows={services}
            columns={ServiceColumns}
            pagination={true}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleSetServiceFilters}
            paginationTotalRows={serviceCount}
            customCells={customServiceCells}
          />
        </>
      }
    />
  );
};

export default Services;
