#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from '../server.js';

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    server.server.sendLoggingMessage({
      level: 'info',
      data: 'FiloDataBroker MCP aerver started successfully',
    });
  } catch (err) {
    server.server.sendLoggingMessage({
      level: 'critical',
      data: `FiloDataBroker MCP server failed to start: ${err}`,
    });
    process.exit(1);
  }
}

main();
