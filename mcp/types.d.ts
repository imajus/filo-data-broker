type ToolAnnotations = import("@modelcontextprotocol/sdk/types").ToolAnnotations;
type ZodRawShape = import("zod").ZodRawShape;

interface ToolDefinition {
  name: string;
  definition: {
    title?: string;
    description?: string;
    inputSchema?: ZodRawShape;
    outputSchema?: ZodRawShape;
    annotations?: ToolAnnotations;
  },
  handler: ToolCallback<ZodRawShape>,
};

interface Dataset {
  id: string;
  name: string;
  description: string;
  columns: string[];
  query: (sql: string) => Promise<any[]>;
}

interface DatasetFactory {
  list: () => Promise<Dataset[]>;
  search: (query: string) => Promise<Dataset[]>;
}
