#!/usr/bin/env node

import dotenv from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from '../server.js';

// Load environment variables
dotenv.config({ quiet: true });

// Start the server
async function main() {
  try {
    if (!process.env.ETHEREUM_PRIVATE_KEY) {
      throw new Error('ETHEREUM_PRIVATE_KEY environment variable is not set');
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
    server.server.sendLoggingMessage({
      level: 'info',
      data: 'FiloDataBroker MCP aerver started successfully',
    });
  } catch (err) {
    server.server.sendLoggingMessage({
      level: 'error',
      data: `FiloDataBroker MCP server failed to start: ${err}`,
    });
    process.exit(1);
  }
}

main();
