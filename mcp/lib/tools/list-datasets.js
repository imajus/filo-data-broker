import { LocalDatasetFactory } from '../api/mock/LocalDatasetFactory.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool('list_datasets', 'List all available datasets', {}, async () => {
    // Use DatasetFactory to list all datasets
    const factory = new LocalDatasetFactory();
    const datasets = await factory.list();
    // Convert Dataset instances to plain objects for JSON response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(datasets, null, 2),
        },
      ],
    };
  });
