import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import { PairsResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { SiteLabels, SitesRoutesPaths } from './Sites.enum';

export const SitesPaths = {
  path: SitesRoutesPaths.Sites,
  name: SiteLabels.Section
};

export const customSiteCells = {
  TimestampCell: SkEndTimeCell,
  LinkCell: (props: SkLinkCellProps<SiteResponse>) =>
    SkLinkCell({
      ...props,
      type: 'site',
      link: `${SitesRoutesPaths.Sites}/${props.data.name}@${props.data.identity}`
    })
};

export const siteColumns: SKTableColumn<SiteResponse>[] = [
  {
    name: SiteLabels.Name,
    prop: 'name' as keyof SiteResponse,
    customCellName: 'LinkCell'
  },

  {
    name: SiteLabels.Namespace,
    prop: 'nameSpace' as keyof SiteResponse
  },
  {
    name: SiteLabels.Platform,
    prop: 'platform' as keyof SiteResponse
  },
  {
    name: SiteLabels.SiteVersion,
    prop: 'siteVersion' as keyof SiteResponse,
    width: 15
  },
  {
    name: SiteLabels.Created,
    prop: 'startTime' as keyof SiteResponse,
    customCellName: 'TimestampCell',
    modifier: 'fitContent',
    width: 15
  }
];

export const paisColumns: SKTableColumn<PairsResponse>[] = [
  {
    name: ProcessesLabels.Process,
    prop: 'destinationName' as keyof PairsResponse,
    customCellName: 'ProcessConnectedLinkCell'
  },
  {
    name: ProcessesLabels.Bytes,
    prop: 'bytes' as keyof PairsResponse,
    customCellName: 'ByteFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.ByteRate,
    prop: 'byteRsate' as keyof PairsResponse,
    customCellName: 'ByteRateFormatCell',
    modifier: 'fitContent'
  },
  {
    name: ProcessesLabels.Latency,
    prop: 'latency' as keyof PairsResponse,
    customCellName: 'LatencyFormatCell',
    modifier: 'fitContent'
  },
  {
    name: '',
    customCellName: 'viewDetailsLinkCell',
    modifier: 'fitContent'
  }
];
