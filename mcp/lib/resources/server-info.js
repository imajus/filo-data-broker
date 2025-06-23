export const serverInfoResource = {
  name: 'server-info',
  uri: 'info://server',
  definition: {
    title: 'Server Information',
    description: 'Information about this MCP server',
    mimeType: 'text/plain',
  },
  handler: async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: 'This is a basic MCP server implementation using Node.js and JavaScript.',
      },
    ],
  }),
};
