import { z } from 'zod';
import { getDatasetFactory } from '../dataset/factory.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'query_dataset',
    'Query a specific dataset using SQL. You must retrieve and sign the authentication message with your Ethereum wallet first to be able to query the dataset. Datasets access must be purchased before querying.',
    {
      datasetId: z.string().describe('Dataset ID'),
      signerAddress: z.string().describe('Ethereum address of the signer'),
      signedMessage: z
        .string()
        .describe('Signature of the authentication message'),
      sql: z
        .string()
        .describe(
          'SQL query to execute. You can fetch private columns data but query only by public columns.'
        ),
    },
    async ({ datasetId, signerAddress, signedMessage, sql }) => {
      // Create Dataset instance and fetch data
      const factory = getDatasetFactory();
      const dataset = await factory.get(datasetId);
      const results = await dataset.query(sql, signerAddress, signedMessage);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results),
          },
        ],
      };
    }
  );
