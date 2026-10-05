import { buildMcpEnvContent, getEnvironmentFingerprint } from "./env.js";
import { jsonResult, type ToolResult } from "./types.js";
import { PACKAGE_VERSION } from "./version.js";

/** 默認指向 Probot HDI；可設 PROBOT_HDI_API_BASE 覆蓋（勿尾隨斜杠） */
const API_BASE = (
  process.env.PROBOT_HDI_API_BASE || "https://www.probot.hk/probot_api/mcp"
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 30_000;
const ENV_REPORT_TIMEOUT_MS = 20_000;

/** 個人中心生成的 pb-… Token，與後端 Authorization: Bearer 一致 */
function getBearerToken(): string {
  const token = process.env.PROBOT_MCP_TOKEN || "";
  if (!token) {
    throw new Error(
      "Set PROBOT_MCP_TOKEN to your pb-… token from the Probot account center",
    );
  }
  if (!token.startsWith("pb-")) {
    throw new Error(
      "MCP token must start with pb- (create one in your personal center)",
    );
  }
  return token;
}

export function hasValidHdiToken(): boolean {
  const token = process.env.PROBOT_MCP_TOKEN || "";
  return token.startsWith("pb-");
}

function getApiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getBearerToken()}`,
    "X-Probot-Env-Fingerprint": getEnvironmentFingerprint(),
    "X-Probot-Client-Version": PACKAGE_VERSION,
  };
}

type HdiApiResponse = {
  api_status?: unknown;
  content?: unknown;
};

async function callApi(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<HdiApiResponse> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(
      `HDI API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as HdiApiResponse;
}

function toToolResult(data: HdiApiResponse): ToolResult {
  if (!data.api_status) {
    return jsonResult(data, true);
  }
  return jsonResult(data.content);
}

export async function queryHdiByName(
  body: Record<string, unknown>,
): Promise<ToolResult> {
  return toToolResult(await callApi("probot", body));
}

export async function searchHdiItem(
  body: Record<string, unknown>,
): Promise<ToolResult> {
  return toToolResult(await callApi("probot/search", body));
}

export async function queryHdiById(
  body: Record<string, unknown>,
): Promise<ToolResult> {
  return toToolResult(await callApi("probot/id", body));
}

/** MCP 連上後上報一次環境；失敗不影響服務 */
export async function reportHdiEnvironmentOnce(): Promise<void> {
  if (!hasValidHdiToken()) {
    return;
  }
  const content = buildMcpEnvContent();
  try {
    const response = await fetch(`${API_BASE}/env`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(ENV_REPORT_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(
        `MCP env report failed: ${response.status} ${response.statusText}`,
      );
      return;
    }
    const data = (await response.json()) as { api_status?: string };
    if (data.api_status !== "success") {
      console.error("MCP env report rejected:", JSON.stringify(data));
    }
  } catch (err) {
    console.error(
      "MCP env report error:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
