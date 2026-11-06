import { describe, expect, it } from 'vitest';

import connectorsData from '../mocks/data/CONNECTORS.json';
import listenersData from '../mocks/data/LISTENERS.json';
import { ListenerRoutingModel, ListenerStrategy } from '../src/API/REST.enum';
import { SUMMARY_SEPARATOR } from '../src/config/app';
import { styles } from '../src/config/styles';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '../src/core/components/SkCharts/SKSanckeyChart/SkSankey.constants';
import {
  ServicesController,
  aggregateConnectorResponses,
  getListenerNodeDetails
} from '../src/pages/Services/services';
import { GraphElementNames, GraphIconKeys } from '../src/types/Graph.interfaces';
import { ConnectorResponse, ListenerResponse } from '../src/types/REST.interfaces';

const connectorResults = connectorsData.results;
const listenerResults = listenersData.results as ListenerResponse[];

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
          destinationId: 'adr-7375c1d0dcc0c921',
          destinationName: 'adservice',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-listener',
          siteName: 'dallas',
          sourceId: 'rrrpk:10',
          sourceName: 'adservice',
          details: ['Single-key listener'],
          type: 'SkListenerNode',
          iconName: 'listener'
        },
        {
          destinationId: 'adr-28bab4448f1c9a48',
          destinationName: 'cartservice',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-listener',
          siteName: 'dallas',
          sourceId: 'rrrpk:11',
          sourceName: 'cartservice',
          details: ['Single-key listener'],
          type: 'SkListenerNode',
          iconName: 'listener'
        }
      ];
      expect(ServicesController.mapListenersToRoutingKey(listeners)).toEqual(expected);
    });

    it('should map a weighted multi-key listener with the weight as edge label', () => {
      const listeners: ListenerResponse[] = [
        {
          ...listenerResults[0],
          routingModel: ListenerRoutingModel.MultiKey,
          routingKeyCount: 2,
          strategy: ListenerStrategy.Weighted,
          strategyValue: 3
        }
      ];

      const expected = [
        {
          destinationId: 'adr-7375c1d0dcc0c921',
          destinationName: 'adservice',
          siteId: '46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-listener',
          siteName: 'dallas',
          sourceId: 'rrrpk:10',
          sourceName: 'adservice',
          details: ['Multi-key listener', `Weighted ${SUMMARY_SEPARATOR} 2 routing keys`],
          edgeLabel: 'Weight: 3',
          type: 'SkListenerNode',
          iconName: 'listener'
        }
      ];
      expect(ServicesController.mapListenersToRoutingKey(listeners)).toEqual(expected);
    });

    it('should use the strategy name as edge label when the weight is missing', () => {
      const listeners: ListenerResponse[] = [
        {
          ...listenerResults[0],
          routingModel: ListenerRoutingModel.MultiKey,
          routingKeyCount: 2,
          strategy: ListenerStrategy.Weighted,
          strategyValue: undefined
        }
      ];

      expect(ServicesController.mapListenersToRoutingKey(listeners)[0].edgeLabel).toBe('Weighted');
    });

    it('should use the strategy name as edge label for a priority multi-key listener', () => {
      const listeners: ListenerResponse[] = [
        {
          ...listenerResults[0],
          routingModel: ListenerRoutingModel.MultiKey,
          routingKeyCount: 2,
          strategy: ListenerStrategy.Priority,
          strategyValue: 1
        }
      ];

      expect(ServicesController.mapListenersToRoutingKey(listeners)[0].edgeLabel).toBe('Priority');
    });

    it('should use the weight 1 as edge label', () => {
      const listeners: ListenerResponse[] = [
        {
          ...listenerResults[0],
          routingModel: ListenerRoutingModel.MultiKey,
          routingKeyCount: 2,
          strategy: ListenerStrategy.Weighted,
          strategyValue: 1
        }
      ];

      expect(ServicesController.mapListenersToRoutingKey(listeners)[0].edgeLabel).toBe('Weight: 1');
    });

    it('should not show the raw priority value in the edge label', () => {
      const listeners: ListenerResponse[] = [
        {
          ...listenerResults[0],
          routingModel: ListenerRoutingModel.MultiKey,
          routingKeyCount: 2,
          strategy: ListenerStrategy.Priority,
          strategyValue: 0
        }
      ];

      expect(ServicesController.mapListenersToRoutingKey(listeners)[0].edgeLabel).toBe('Priority');
    });

    it('should not set an edge label for a single-key listener', () => {
      expect(ServicesController.mapListenersToRoutingKey([listenerResults[0]])[0].edgeLabel).toBeUndefined();
    });

    it('should handle empty listeners array', () => {
      expect(ServicesController.mapListenersToRoutingKey([])).toEqual([]);
    });
  });

  describe('getListenerNodeDetails', () => {
    const multiKeyListener: ListenerResponse = {
      ...listenerResults[0],
      routingModel: ListenerRoutingModel.MultiKey,
      routingKeyCount: 2,
      strategy: ListenerStrategy.Weighted,
      strategyValue: 3
    };

    it('should show the type, the strategy and the routing keys count for a weighted multi-key listener', () => {
      const expected = ['Multi-key listener', `Weighted ${SUMMARY_SEPARATOR} 2 routing keys`];

      expect(getListenerNodeDetails(multiKeyListener)).toEqual(expected);
    });

    it('should not show the routing keys count when there is only one routing key', () => {
      const expected = ['Multi-key listener', 'Weighted'];

      expect(getListenerNodeDetails({ ...multiKeyListener, routingKeyCount: 1 })).toEqual(expected);
    });

    it('should show the strategy name and the count for a priority multi-key listener without the raw value', () => {
      const expected = ['Multi-key listener', `Priority ${SUMMARY_SEPARATOR} 4 routing keys`];

      expect(
        getListenerNodeDetails({
          ...multiKeyListener,
          routingKeyCount: 4,
          strategy: ListenerStrategy.Priority,
          strategyValue: 1
        })
      ).toEqual(expected);
    });

    it('should show only the type for a single-key listener', () => {
      expect(getListenerNodeDetails(listenerResults[0])).toEqual(['Single-key listener']);
    });

    it('should return valid details when the strategy value is missing', () => {
      const expected = ['Multi-key listener', `Weighted ${SUMMARY_SEPARATOR} 2 routing keys`];

      expect(getListenerNodeDetails({ ...multiKeyListener, strategyValue: undefined })).toEqual(expected);
    });

    it('should treat a strategy value of 0 as a present value', () => {
      const expected = ['Multi-key listener', `Weighted ${SUMMARY_SEPARATOR} 2 routing keys`];

      expect(getListenerNodeDetails({ ...multiKeyListener, strategyValue: 0 })).toEqual(expected);
      expect(
        ServicesController.mapListenersToRoutingKey([{ ...multiKeyListener, strategyValue: 0 }])[0].edgeLabel
      ).toBe('Weight: 0');
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
          sourceId: 'adr-00ffe0b268c6eae4',
          sourceName: 'shippingservice',
          type: 'SkEmptyNode'
        },
        {
          destinationId: 'paymentservice@172.17.27.110-46c2efa0-5fbc-4fe4-bba8-530e775aa2f6-50051',
          destinationName: 'paymentservice@172.17.27.110:50051',
          iconName: 'routingKey',
          sourceId: 'adr-97d6f0970aa36488',
          sourceName: 'paymentservice',
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

    it('should set the edge label from the pair edgeLabel', () => {
      const { edges } = ServicesController.convertPairsTopologyData([{ ...servicePairs[0], edgeLabel: 'Weight: 3' }]);

      expect(edges[0].label).toBe('Weight: 3');
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
          routingKey: 'shippingservice',
          serviceId: 'adr-00ffe0b268c6eae4',
          count: 1,
          destHost: '172.17.27.114',
          destPort: '50051',
          endTime: 0,
          identity: 'rrrpk:13',
          name: 'shippingservice',
          routerId: 'rrrpk:0',
          processId: '8483cbc9-c1ba-41e2-8648-eac3dfccaea0',
          processes: [
            {
              routingKey: 'shippingservice',
              serviceId: 'adr-00ffe0b268c6eae4',
              destHost: '172.17.27.114',
              endTime: 0,
              destPort: '50051',
              identity: 'rrrpk:13',
              name: 'shippingservice@172.17.27.114',
              routerId: 'rrrpk:0',
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
          routingKey: 'paymentservice',
          serviceId: 'adr-97d6f0970aa36488',
          count: 1,
          destHost: '172.17.27.110',
          destPort: '50051',
          endTime: 0,
          identity: 'rrrpk:14',
          name: 'paymentservice',
          routerId: 'rrrpk:0',
          processId: '07ef190a-6167-4297-9ecd-ea0dcbf6c5a1',
          processes: [
            {
              routingKey: 'paymentservice',
              serviceId: 'adr-97d6f0970aa36488',
              destHost: '172.17.27.110',
              destPort: '50051',
              endTime: 0,
              identity: 'rrrpk:14',
              name: 'paymentservice@172.17.27.110',
              routerId: 'rrrpk:0',
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
          routingKey: 'emailservice',
          serviceId: 'adr-5193d597cb3d8442',
          destHost: '172.17.27.116',
          destPort: '5000',
          endTime: 0,
          identity: 'rrrpk:15',
          name: 'emailservice',
          routerId: 'rrrpk:0',
          processId: 'f814f84d-1a0b-44ae-9a3f-1777a866f498',
          count: 1,
          processes: [
            {
              routingKey: 'emailservice',
              serviceId: 'adr-5193d597cb3d8442',
              destHost: '172.17.27.116',
              destPort: '5000',
              endTime: 0,
              identity: 'rrrpk:15',
              name: 'emailservice@172.17.27.116',
              routerId: 'rrrpk:0',
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
