#!/usr/bin/env node

import dotenv from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { mcp } from '../server.js';

// Load environment variables
dotenv.config({ quiet: true });

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await mcp.connect(transport);
    if (!process.env.ETHEREUM_PRIVATE_KEY) {
      throw new Error('ETHEREUM_PRIVATE_KEY environment variable is not set');
    }
    await mcp.server.sendLoggingMessage({
      level: 'info',
      data: `FiloDataBroker MCP server started successfully (${process.env.ETHEREUM_PRIVATE_KEY})`,
    });
  } catch (err) {
    if (mcp.isConnected) {
      await mcp.server.sendLoggingMessage({
        level: 'critical',
        data: `Failed to start: ${err.message}`,
      });
      await mcp.close();
    } else {
      console.error(err);
    }
  }
}

main();
