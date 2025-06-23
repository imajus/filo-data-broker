export function defineTool(server, tool) {
  server.registerTool(tool.name, tool.definition, tool.handler);
}

export function defineResource(server, resource) {
  if (resource.template) {
    server.registerResource(
      resource.name,
      resource.template,
      resource.definition,
      resource.handler
    );
  } else {
    server.registerResource(
      resource.name,
      resource.uri,
      resource.definition,
      resource.handler
    );
  }
}
