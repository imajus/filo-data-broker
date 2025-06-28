import { z } from 'zod';
import { getDatasetFactory } from '../dataset/factory.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'list_datasets',
    'List all available datasets. Each dataset has private & public columns. Public columns can be used for querying the dataset and private columns can be included in the output. Datasets access is NFT gated on Filecoin Calibration network and priced in FIL.',
    {},
    async () => {
      // Use DatasetFactory to list all datasets
      const factory = getDatasetFactory();
      const datasets = await factory.list();
      // Convert Dataset instances to plain objects for JSON response
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(datasets),
          },
        ],
      };
    }
  );
