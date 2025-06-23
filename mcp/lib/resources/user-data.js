import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

export const userDataResource = {
  name: 'user-data',
  template: new ResourceTemplate('user://{userId}', { list: undefined }),
  definition: {
    title: 'User Data',
    description: 'Dynamic user data resource',
  },
  handler: async (uri, { userId }) => ({
    contents: [
      {
        uri: uri.href,
        text: `User data for user ID: ${userId}\nStatus: Active\nCreated: ${new Date().toISOString()}`,
      },
    ],
  }),
};
