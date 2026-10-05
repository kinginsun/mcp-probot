import { z } from "zod";
import { queryPdeReport } from "./aitep.js";
import {
  queryHdiById,
  queryHdiByName,
  searchHdiItem,
} from "./hdi.js";
import {
  AitepPdeSchema,
  HdiByIdSchema,
  HdiByNameSchema,
  SearchItemSchema,
  textResult,
  type ToolResult,
} from "./types.js";

type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
};

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  schema: z.ZodTypeAny;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
};

function parseArgs(
  schema: z.ZodTypeAny,
  args: unknown,
): Record<string, unknown> {
  return schema.parse(args ?? {}) as Record<string, unknown>;
}

export const tools: ToolDefinition[] = [
  {
    name: "probot-hdi",
    description:
      "Search herb-drug or drug-drug interactions in the Probot HDI database by drug/herb names. " +
      "Each drug parameter accepts a single name or multiple aliases separated by '|' " +
      '(e.g. "aspirin|阿司匹林|乙酰水杨酸"). ' +
      "drug1 is required, drug2 is optional. When only drug1 is provided, returns all known interactions for that drug/herb. " +
      "Requires PROBOT_MCP_TOKEN (pb-… token from the Probot account center).",
    inputSchema: {
      type: "object",
      properties: {
        drug1: {
          type: "string",
          description:
            'First drug/herb name, or multiple aliases separated by "|" (e.g. "aspirin|阿司匹林")',
        },
        drug2: {
          type: "string",
          description:
            'Second drug/herb name, or multiple aliases separated by "|" (optional)',
        },
        maxRows: {
          type: "number",
          description:
            "Maximum number of interaction results to return (default: 10)",
        },
      },
      required: ["drug1"],
    },
    schema: HdiByNameSchema,
    handler: (args) => queryHdiByName(args),
  },
  {
    name: "probot-search-item",
    description:
      "Look up a drug or herb in the Probot HDI database by name and return its item_id. " +
      "Use this to resolve a drug/herb name to its unique identifier before querying interactions by ID. " +
      "Requires PROBOT_MCP_TOKEN (pb-… token from the Probot account center).",
    inputSchema: {
      type: "object",
      properties: {
        drug: {
          type: "string",
          description:
            'Drug or herb name to search for, or multiple aliases separated by "|" (e.g. "aspirin|阿司匹林")',
        },
      },
      required: ["drug"],
    },
    schema: SearchItemSchema,
    handler: (args) => searchHdiItem(args),
  },
  {
    name: "probot-hdi-by-id",
    description:
      "Search herb-drug or drug-drug interactions by item_id(s). " +
      "Use item_id obtained from probot-search-item. " +
      "item_id1 is required, item_id2 is optional. When only item_id1 is provided, returns all known interactions for that item. " +
      "Requires PROBOT_MCP_TOKEN (pb-… token from the Probot account center).",
    inputSchema: {
      type: "object",
      properties: {
        item_id1: {
          type: "string",
          description: "First item_id (obtained from probot-search-item)",
        },
        item_id2: {
          type: "string",
          description: "Second item_id (optional)",
        },
        maxRows: {
          type: "number",
          description:
            "Maximum number of interaction results to return (default: 10)",
        },
      },
      required: ["item_id1"],
    },
    schema: HdiByIdSchema,
    handler: (args) => queryHdiById(args),
  },
  {
    name: "aitep_pde_report",
    description:
      "Retrieves the PDE (Permitted Daily Exposure) report in JSON format for a given API " +
      "(Active Pharmaceutical Ingredient) from AITEP (aitep.probot.hk). " +
      "Requires AITEP_API_KEY (company certification and VIP authorization on the AITEP portal).",
    inputSchema: {
      type: "object",
      properties: {
        ingredient: {
          type: "string",
          description: "Name of active pharmaceutical ingredient (required)",
        },
      },
      required: ["ingredient"],
    },
    schema: AitepPdeSchema,
    handler: (args) => queryPdeReport(args),
  },
];

const toolsByName = new Map(tools.map((tool) => [tool.name, tool]));

export function listToolDescriptors() {
  return tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  }));
}

export async function callTool(
  name: string,
  args: unknown,
): Promise<ToolResult> {
  const tool = toolsByName.get(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  const validated = parseArgs(tool.schema, args);
  return tool.handler(validated);
}

export function toolError(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return textResult(message, true);
}
