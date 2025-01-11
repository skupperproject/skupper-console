import connectorsData from '../mocks/data/CONNECTORS.json';
import listenersData from '../mocks/data/LISTENERS.json';
import { styles } from '../src/config/styles';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '../src/core/components/SKSanckeyChart/SkSankey.constants';
import { ServicesController, aggregateConnectorResponses } from '../src/pages/Services/services';
import { GraphElementNames, GraphIconKeys } from '../src/types/Graph.interfaces';
import { ConnectorResponse, ListenerResponse } from '../src/types/REST.interfaces';

const connectorResults = connectorsData.results as any[];
const listenerResults = listenersData.results as any[];

describe('ServicesController', () => {
  describe('convertPairsToSankeyChartData', () => {
    it('should convert pairs to sankey chart data', () => {
      const servicePairs = [
        { sourceName: 'source1', destinationName: 'destination1', bytes: 10, byteRate: 2 },
        { sourceName: 'source2', destinationName: 'destination2', bytes: 20, byteRate: 4 }
      ];
      const { nodes, links } = ServicesController.convertPairsToSankeyChartData(servicePairs);

      expect(nodes).toEqual([
        { id: 'source1.', nodeColor: styles.default.infoColor },
        { id: 'source2.', nodeColor: styles.default.infoColor },
        { id: 'destination1', nodeColor: styles.default.infoColor },
        { id: 'destination2', nodeColor: styles.default.infoColor }
      ]);
      expect(links).toEqual([
        { source: 'source1.', target: 'destination1', value: DEFAULT_SANKEY_CHART_FLOW_VALUE },
        { source: 'source2.', target: 'destination2', value: DEFAULT_SANKEY_CHART_FLOW_VALUE }
      ]);

      const { links: linksBytes } = ServicesController.convertPairsToSankeyChartData(servicePairs, 'bytes');
      expect(linksBytes).toEqual([
        { source: 'source1.', target: 'destination1', value: 10 },
        { source: 'source2.', target: 'destination2', value: 20 }
      ]);

      const { links: linksByteRate } = ServicesController.convertPairsToSankeyChartData(servicePairs, 'byteRate');
      expect(linksByteRate).toEqual([
        { source: 'source1.', target: 'destination1', value: 2 },
        { source: 'source2.', target: 'destination2', value: 4 }
      ]);
    });

    it('should convert pairs to sankey chart data with colors based on site', () => {
      const servicePairs = [
        {
          sourceName: 'source1',
          sourceSiteName: 'site1',
          destinationName: 'destination1',
          destinationSiteName: 'site2',
          bytes: 10,
          byteRate: 2
        }
      ];
      const { nodes, links } = ServicesController.convertPairsToSankeyChartData(servicePairs);

      expect(nodes).toEqual([
        { id: 'source1.', nodeColor: styles.default.darkBackgroundColor },
        { id: 'destination1', nodeColor: styles.default.darkBackgroundColor }
      ]);
      expect(links).toEqual([{ source: 'source1.', target: 'destination1', value: DEFAULT_SANKEY_CHART_FLOW_VALUE }]);
    });

    it('should handle empty service pairs', () => {
      const { nodes, links } = ServicesController.convertPairsToSankeyChartData([]);
      expect(nodes).toEqual([]);
      expect(links).toEqual([]);
    });
  });

  describe('mapListenersToRoutingKey', () => {
    it('should correctly map listeners to routing keys', () => {
      const listeners: ListenerResponse[] = [listenerResults[0], listenerResults[1]];

      const expected = [
        {
          destinationId: undefined,
          destinationName: undefined,
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-listener',
          siteName: 'dallas',
          sourceId: 'rrrpk:10',
          sourceName: 'adservice',
          type: 'SkEmptyNode',
          iconName: 'listener'
        },
        {
          destinationId: undefined,
          destinationName: undefined,
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-listener',
          siteName: 'dallas',
          sourceId: 'rrrpk:11',
          sourceName: 'cartservice',
          type: 'SkEmptyNode',
          iconName: 'listener'
        }
      ];
      expect(ServicesController.mapListenersToRoutingKey(listeners)).toEqual(expected);
    });

    it('should handle empty listeners array', () => {
      expect(ServicesController.mapListenersToRoutingKey([])).toEqual([]);
    });
  });

  describe('mapConnectorsToProcesses', () => {
    it('should map connectors to processes correctly', () => {
      const connectors: ConnectorResponse[] = [connectorResults[0], connectorResults[1]];

      const expected = [
        {
          type: 'SkEmptyNode',
          iconName: 'connector',
          destinationId: '8483cbc9-c1ba-41e2-8648-eac3dfccaea0',
          destinationName: 'shippingservice-5bb6d895cd-n6fzv',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
          siteName: 'dallas',
          sourceId: 'shippingservice-46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-50051',
          sourceName: 'shippingservice:50051'
        },
        {
          type: 'SkEmptyNode',
          iconName: 'connector',
          destinationId: '07ef190a-6167-4297-9ecd-ea0dcbf6c5a1',
          destinationName: 'paymentservice-69f99b8c87-kztsn',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
          siteName: 'dallas',
          sourceId: 'paymentservice-46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-50051',
          sourceName: 'paymentservice:50051'
        }
      ];

      expect(ServicesController.mapConnectorsToProcesses(connectors)).toEqual(expected);
    });

    it('should handle empty connectors array', () => {
      expect(ServicesController.mapConnectorsToProcesses([])).toEqual([]);
    });
  });

  describe('mapRoutingKeyToAggregatedConnectors', () => {
    it('should map routing keys to aggregated connectors correctly', () => {
      const connectors: ConnectorResponse[] = [connectorResults[0], connectorResults[1]];

      const expected = [
        {
          destinationId: 'shippingservice@172.17.27.114-46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-50051',
          destinationName: 'shippingservice@172.17.27.114:50051',
          iconName: 'routingKey',
          sourceId: undefined,
          sourceName: undefined,
          type: 'SkEmptyNode'
        },
        {
          destinationId: 'paymentservice@172.17.27.110-46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-50051',
          destinationName: 'paymentservice@172.17.27.110:50051',
          iconName: 'routingKey',
          sourceId: undefined,
          sourceName: undefined,
          type: 'SkEmptyNode'
        }
      ];

      expect(ServicesController.mapRoutingKeyToAggregatedConnectors(connectors, '_', '_')).toEqual(expected);
    });

    it('should handle empty connectors array', () => {
      const expected = [
        {
          sourceId: 'id',
          sourceName: 'name',
          destinationId: ``,
          destinationName: ``,
          type: 'SkEmptyNode',
          iconName: 'routingKey'
        }
      ];
      expect(ServicesController.mapRoutingKeyToAggregatedConnectors([], 'id', 'name')).toEqual(expected);
    });
  });

  describe('convertPairsTopologyData', () => {
    const servicePairs = [
      {
        sourceId: 'source1',
        sourceName: 'sourceName1',
        siteId: 'site1',
        siteName: 'site1',
        destinationId: 'destination1',
        destinationName: 'destinationName1',
        byteRate: 100,
        color: '#000000',
        iconName: 'component' as GraphIconKeys,
        type: 'SkNode' as GraphElementNames
      },
      {
        sourceId: 'source2',
        sourceName: 'sourceName2',
        siteId: 'site2',
        siteName: 'site2',
        destinationId: 'destination2',
        destinationName: 'destinationName2',
        byteRate: 200,
        color: '#FFFFFF',
        iconName: 'component' as GraphIconKeys,
        type: 'SkNode' as GraphElementNames
      }
    ];

    it('should convert pairs topology data correctly', () => {
      const { nodes, edges, combos } = ServicesController.convertPairsTopologyData(servicePairs);

      expect(nodes).toEqual([
        {
          type: 'SkNode',
          id: 'source1',
          name: 'sourceName1',
          label: 'sourceName1',
          iconName: 'component',
          combo: 'site1'
        },
        {
          type: 'SkNode',
          id: 'source2',
          name: 'sourceName2',
          label: 'sourceName2',
          iconName: 'component',
          combo: 'site2'
        },
        {
          type: 'SkEmptyNode',
          id: 'destination1',
          name: 'destinationName1',
          label: 'destinationName1',
          iconName: 'process',
          combo: 'site1'
        },
        {
          type: 'SkEmptyNode',
          id: 'destination2',
          name: 'destinationName2',
          label: 'destinationName2',
          iconName: 'process',
          combo: 'site2'
        }
      ]);

      expect(edges).toEqual([
        {
          type: 'SkListenerConnectorEdge',
          id: 'source1-destination1',
          source: 'source1',
          sourceName: 'sourceName1',
          target: 'destination1',
          targetName: 'destinationName1'
        },
        {
          type: 'SkListenerConnectorEdge',
          id: 'source2-destination2',
          source: 'source2',
          sourceName: 'sourceName2',
          target: 'destination2',
          targetName: 'destinationName2'
        }
      ]);

      expect(combos).toEqual([
        { type: 'SkCombo', id: 'site1', label: 'site1' },
        { type: 'SkCombo', id: 'site2', label: 'site2' }
      ]);
    });

    it('should handle empty pairs array', () => {
      const { nodes, edges, combos } = ServicesController.convertPairsTopologyData([]);
      expect(nodes).toEqual([]);
      expect(edges).toEqual([]);
      expect(combos).toEqual([]);
    });
  });

  describe('aggregateConnectorResponses', () => {
    it('should aggregate connector responses correctly', () => {
      const connectors: ConnectorResponse[] = [connectorResults[0], connectorResults[1], connectorResults[2]];
      const aggregated = aggregateConnectorResponses(connectors);

      expect(aggregated).toEqual([
        {
          address: 'shippingservice',
          addressId: 'adr-00ffe0b268c6eae4',
          count: 1,
          destHost: '172.17.27.114',
          destPort: '50051',
          endTime: 0,
          identity: 'rrrpk:13',
          name: 'shippingservice',
          parent: 'rrrpk:0',
          processId: '8483cbc9-c1ba-41e2-8648-eac3dfccaea0',
          processes: [
            {
              address: 'shippingservice',
              addressId: 'adr-00ffe0b268c6eae4',
              destHost: '172.17.27.114',
              endTime: 0,
              destPort: '50051',
              identity: 'rrrpk:13',
              name: 'shippingservice@172.17.27.114',
              parent: 'rrrpk:0',
              processId: '8483cbc9-c1ba-41e2-8648-eac3dfccaea0',
              protocol: 'tcp',
              siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
              siteName: 'dallas',
              startTime: 1733493802662433,
              target: 'shippingservice-5bb6d895cd-n6fzv'
            }
          ],
          protocol: 'tcp',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
          siteName: 'dallas',
          startTime: 1733493802662433,
          target: 'shippingservice-5bb6d895cd-n6fzv'
        },

        {
          address: 'paymentservice',
          addressId: 'adr-97d6f0970aa36488',
          count: 1,
          destHost: '172.17.27.110',
          destPort: '50051',
          endTime: 0,
          identity: 'rrrpk:14',
          name: 'paymentservice',
          parent: 'rrrpk:0',
          processId: '07ef190a-6167-4297-9ecd-ea0dcbf6c5a1',
          processes: [
            {
              address: 'paymentservice',
              addressId: 'adr-97d6f0970aa36488',
              destHost: '172.17.27.110',
              destPort: '50051',
              endTime: 0,
              identity: 'rrrpk:14',
              name: 'paymentservice@172.17.27.110',
              parent: 'rrrpk:0',
              processId: '07ef190a-6167-4297-9ecd-ea0dcbf6c5a1',
              protocol: 'tcp',
              siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
              siteName: 'dallas',
              startTime: 1733493802664920,
              target: 'paymentservice-69f99b8c87-kztsn'
            }
          ],
          protocol: 'tcp',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
          siteName: 'dallas',
          startTime: 1733493802664920,
          target: 'paymentservice-69f99b8c87-kztsn'
        },

        {
          address: 'emailservice',
          addressId: 'adr-5193d597cb3d8442',
          destHost: '172.17.27.116',
          destPort: '5000',
          endTime: 0,
          identity: 'rrrpk:15',
          name: 'emailservice',
          parent: 'rrrpk:0',
          processId: 'f814f84d-1a0b-44ae-9a3f-1777a866f498',
          count: 1,
          processes: [
            {
              address: 'emailservice',
              addressId: 'adr-5193d597cb3d8442',
              destHost: '172.17.27.116',
              destPort: '5000',
              endTime: 0,
              identity: 'rrrpk:15',
              name: 'emailservice@172.17.27.116',
              parent: 'rrrpk:0',
              protocol: 'tcp',
              processId: 'f814f84d-1a0b-44ae-9a3f-1777a866f498',
              siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
              siteName: 'dallas',
              startTime: 1733493802716782,
              target: 'emailservice-b6b65cc5b-b9bgq'
            }
          ],
          protocol: 'tcp',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6',
          siteName: 'dallas',
          startTime: 1733493802716782,
          target: 'emailservice-b6b65cc5b-b9bgq'
        }
      ]);
    });

    it('should handle empty array', () => {
      expect(aggregateConnectorResponses([])).toEqual([]);
    });
  });
});
