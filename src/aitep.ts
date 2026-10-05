import { jsonResult, textResult, type ToolResult } from "./types.js";

const DEFAULT_AITEP_URL = "https://aitep.probot.hk/api/hkpma/mcp_api_detail";
const REQUEST_TIMEOUT_MS = 30_000;

function getAitepUrl(): string {
  return (process.env.AITEP_API_BASE || DEFAULT_AITEP_URL).replace(/\/$/, "");
}

function getAitepApiKey(): string {
  const apiKey = process.env.AITEP_API_KEY || "";
  if (!apiKey) {
    throw new Error("AITEP_API_KEY environment variable is not set");
  }
  return apiKey;
}

type AitepApiResponse = {
  code?: number;
  data?: unknown;
  msg?: string;
};

export async function queryPdeReport(
  body: Record<string, unknown>,
): Promise<ToolResult> {
  let apiKey: string;
  try {
    apiKey = getAitepApiKey();
  } catch (err) {
    return textResult(err instanceof Error ? err.message : String(err), true);
  }

  const response = await fetch(getAitepUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    return textResult(
      `AITEP API request failed: ${response.status} ${response.statusText}`,
      true,
    );
  }

  const result = (await response.json()) as AitepApiResponse;
  const { code, data, msg } = result;
  if (code != 1) {
    return textResult(msg || "AITEP API returned an error", true);
  }

  return jsonResult(data);
}
