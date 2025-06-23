export const addTool = {
  name: 'add',
  definition: {
    title: 'Addition Tool',
    description: 'Add two numbers together',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' },
      },
      required: ['a', 'b'],
    },
  },
  handler: async ({ a, b }) => ({
    content: [{ type: 'text', text: `The sum of ${a} and ${b} is ${a + b}` }],
  }),
};
