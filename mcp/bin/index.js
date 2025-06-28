#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { mcp } from '../server.js';

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await mcp.connect(transport);
    await mcp.server.sendLoggingMessage({
      level: 'info',
      data: `FiloDataBroker MCP server started successfully`,
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
