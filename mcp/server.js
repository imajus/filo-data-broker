import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { addTool } from './lib/tools/add.js';
import { greetTool } from './lib/tools/greet.js';
import { serverInfoResource } from './lib/resources/server-info.js';
import { userDataResource } from './lib/resources/user-data.js';
import { defineTool, defineResource } from './lib/utils.js';

const server = new McpServer({
  name: 'filo-data-broker-mcp-server',
  version: '0.1.0',
});

defineTool(server, addTool);
defineTool(server, greetTool);
defineResource(server, serverInfoResource);
defineResource(server, userDataResource);

export { server }; 