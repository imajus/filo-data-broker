import { z } from 'zod';
import { FilecoinDatasetFactory } from '../dataset/FilecoinDatasetFactory.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'query_dataset',
    'Query a specific dataset using SQL',
    {
      datasetId: z.string().describe('Dataset ID'),
      sql: z
        .string()
        .describe('SQL query to execute (use ? instead of table name)'),
    },
    async ({ datasetId, sql }) => {
      // Create Dataset instance and fetch data
      const factory = new FilecoinDatasetFactory();
      const dataset = await factory.get(datasetId);
      const results = await dataset.query(sql);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );
