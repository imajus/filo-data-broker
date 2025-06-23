export const greetTool = {
  name: 'greet',
  definition: {
    title: 'Greeting Tool',
    description: 'Generate a personalized greeting',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name to greet' },
      },
      required: ['name'],
    },
  },
  handler: async ({ name }) => ({
    content: [
      { type: 'text', text: `Hello, ${name}! Welcome to the MCP server.` },
    ],
  }),
};
