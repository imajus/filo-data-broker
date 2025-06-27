import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import listDatasetsTool from './lib/tools/list-datasets.js';
import queryDatasetTool from './lib/tools/query-dataset.js';

const mcp = new McpServer(
  {
    name: 'filo-data-broker-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      logging: {},
    },
  }
);

// Register dataset tools
listDatasetsTool(mcp);
queryDatasetTool(mcp);

export { mcp };
