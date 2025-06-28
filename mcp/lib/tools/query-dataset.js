import { z } from 'zod';
import { getDatasetFactory } from '../dataset/factory.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'query_dataset',
    'Query a specific dataset using SQL.',
    {
      datasetId: z.string().describe('Dataset ID'),
      sql: z
        .string()
        .describe(
          'SQL query to execute. You can fetch private columns data but query only by public columns.'
        ),
    },
    async ({ datasetId, sql }) => {
      // Create Dataset instance and fetch data
      const factory = getDatasetFactory();
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
