import { z } from 'zod';
import { NFTFactory } from '../contracts/NFTFactory.js';
import { getProvider, Network } from '../filecoin.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'purchase_dataset',
    'Purchase a dataset by preparing a transaction JSON for signing. Returns a partial transaction data that should be extended with necessary fields, signed and sent to the blockchain. Be sure to use the Filecoin Calibration network in the transaction.',
    {
      datasetId: z.string().describe('Dataset ID'),
      senderAddress: z.string().describe('Ethereum address of the requester'),
    },
    async ({ datasetId, senderAddress }) => {
      const factory = NFTFactory.getInstance();
      const hasAccess = await factory.hasDatasetAccess(
        datasetId,
        senderAddress
      );
      if (hasAccess) {
        return {
          content: [
            { type: 'text', text: 'Dataset has already been purchased' },
          ],
        };
      } else {
        const transaction = await factory.preparePurchase(
          datasetId,
          senderAddress
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { network: Network, transaction },
                (key, value) => {
                  // BigInt serialization
                  if (typeof value === 'bigint') {
                    return value.toString();
                  }
                  return value;
                }
              ),
            },
          ],
        };
      }
    }
  );
