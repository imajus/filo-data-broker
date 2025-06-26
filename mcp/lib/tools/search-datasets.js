import { z } from 'zod';
import { LocalDatasetFactory } from '../api/mock/LocalDatasetFactory.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'search_datasets',
    'Search for datasets by term',
    {
      term: z.string().describe('Search term to find datasets'),
    },
    async ({ term }) => {
      // Use DatasetFactory to search datasets
      const factory = new LocalDatasetFactory();
      const datasets = await factory.search(term);
      // Convert Dataset instances to plain objects for JSON response
      // const datasetInfo = matchingDatasets.map(dataset => ({
      //   id: dataset.id,
      //   name: dataset.name,
      //   description: dataset.description,
      //   columns: dataset.columns
      // }));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(datasets, null, 2),
          },
        ],
      };
    }
  );
