import { z } from "zod";

export const HdiByNameSchema = z.object({
  drug1: z.string(),
  drug2: z.string().optional(),
  maxRows: z.number().int().positive().optional(),
});

export const SearchItemSchema = z.object({
  drug: z.string(),
});

export const HdiByIdSchema = z.object({
  item_id1: z.string(),
  item_id2: z.string().optional(),
  maxRows: z.number().int().positive().optional(),
});

export const AitepPdeSchema = z.object({
  ingredient: z.string(),
});

export type HdiByNamePayload = z.infer<typeof HdiByNameSchema>;
export type SearchItemPayload = z.infer<typeof SearchItemSchema>;
export type HdiByIdPayload = z.infer<typeof HdiByIdSchema>;
export type AitepPdePayload = z.infer<typeof AitepPdeSchema>;

export type ToolContent = { type: "text"; text: string };

export type ToolResult = {
  content: ToolContent[];
  isError: boolean;
};

export function textResult(text: string, isError = false): ToolResult {
  return {
    content: [{ type: "text", text }],
    isError,
  };
}

export function jsonResult(data: unknown, isError = false): ToolResult {
  return textResult(JSON.stringify(data), isError);
}
