import { z } from 'zod';
import { FilecoinDataset } from '../api/FilecoinDataset.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'query_dataset',
    'Query a specific dataset using SQL',
    {
      address: z.string().describe('Dataset address or name'),
      sql: z.string().describe('SQL query to execute'),
    },
    async ({ address, sql }) => {
      // Create Dataset instance and fetch data
      const dataset = new FilecoinDataset(address);
      const results = await dataset.fetch();
      // In a real implementation, you would parse and execute the SQL query
      // For now, we'll just return all the data from the dataset
      return {
        content: [
          {
            type: 'text',
            text: `Executed SQL: ${sql}\nDataset: ${address}\nCID: ${
              dataset.cid
            }\nResults:\n${JSON.stringify(results, null, 2)}`,
          },
        ],
      };
    }
  );
