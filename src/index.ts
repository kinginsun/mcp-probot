#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { reportHdiEnvironmentOnce } from "./hdi.js";
import { callTool, listToolDescriptors, toolError } from "./tools.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./version.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const server = new Server(
  {
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: listToolDescriptors() };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    return await callTool(name, args);
  } catch (error) {
    return toolError(error);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  await reportHdiEnvironmentOnce();
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
