type ToolAnnotations =
  import('@modelcontextprotocol/sdk/types').ToolAnnotations;
type ZodRawShape = import('zod').ZodRawShape;

interface ToolDefinition {
  name: string;
  definition: {
    title?: string;
    description?: string;
    inputSchema?: ZodRawShape;
    outputSchema?: ZodRawShape;
    annotations?: ToolAnnotations;
  };
  handler: ToolCallback<ZodRawShape>;
}

interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  publicColumns: string[];
  privateColumns: string[];
  price: string;
}

type Dataset = DatasetMetadata & {
  query: (sql: string) => Promise<any[]>;
};

interface DatasetFactory {
  get: (id: string) => Promise<Dataset>;
  list: () => Promise<DatasetMetadata[]>;
}
