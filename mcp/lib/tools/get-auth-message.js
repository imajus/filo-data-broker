import { z } from 'zod';
import { getAuthMessage } from '../lighthouse.js';

/**
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcp
 */
export default (mcp) =>
  mcp.tool(
    'get_auth_message',
    'Get the authentication message that needs to be signed with the provided Ethereum address. This message must be signed before you can query datasets.',
    {
      signerAddress: z
        .string()
        .describe('Ethereum address that will sign the authentication message'),
    },
    async ({ signerAddress }) => {
      const authMessage = await getAuthMessage(signerAddress);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ authMessage }),
          },
        ],
      };
    }
  );
