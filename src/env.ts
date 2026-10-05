import { createHash } from "node:crypto";
import os from "node:os";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./version.js";

/** 進程內緩存，同一運行期內穩定 */
let environmentFingerprintCache: string | null = null;

/**
 * 基於本機環境生成 SHA-256 指紋（主機名僅以哈希混入，請求中不帶主機名明文）。
 * 僅作觀測/輔助用途，不能替代 Token 鑑權。
 */
export function getEnvironmentFingerprint(): string {
  if (environmentFingerprintCache !== null) {
    return environmentFingerprintCache;
  }
  const hostDigest = createHash("sha256")
    .update(os.hostname(), "utf8")
    .digest("hex");
  const raw = [
    PACKAGE_NAME,
    PACKAGE_VERSION,
    process.platform,
    process.arch,
    process.version,
    os.type(),
    os.release(),
    hostDigest,
  ].join("\0");
  environmentFingerprintCache = createHash("sha256")
    .update(raw, "utf8")
    .digest("hex");
  return environmentFingerprintCache;
}

/** 後端 saveEnv 對 content 的 JSON 字節上限 */
const MAX_ENV_CONTENT_BYTES = 524288;

/** 不應上傳的環境變量名（避免洩露 Token / 密鑰） */
const ENV_KEY_SENSITIVE =
  /TOKEN|SECRET|PASSWORD|PRIVATE|CREDENTIAL|AUTH|COOKIE|BEARER|APIKEY|API_KEY|SSH_|_KEY$/i;

function jsonUtf8ByteLength(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

/** 過濾敏感鍵後的環境變量 + 運行時摘要，並壓縮至後端字節上限內 */
export function buildMcpEnvContent(): Record<string, unknown> {
  const processEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined) continue;
    if (ENV_KEY_SENSITIVE.test(k)) continue;
    processEnv[k] = v;
  }

  const payload: Record<string, unknown> = {
    processEnv,
    runtime: {
      mcpClient: PACKAGE_NAME,
      mcpClientVersion: PACKAGE_VERSION,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      osType: os.type(),
      osRelease: os.release(),
      pid: process.pid,
      cwd: process.cwd(),
      execPath: process.execPath,
    },
  };

  if (jsonUtf8ByteLength(payload) <= MAX_ENV_CONTENT_BYTES) {
    return payload;
  }

  const env = { ...processEnv };
  delete env.PATH;
  let trimmed: Record<string, unknown> = {
    processEnv: env,
    runtime: payload.runtime,
  };
  if (jsonUtf8ByteLength(trimmed) <= MAX_ENV_CONTENT_BYTES) {
    return trimmed;
  }

  const env2 = { ...env };
  for (const key of Object.keys(env2).sort(
    (a, b) => (env2[b]?.length ?? 0) - (env2[a]?.length ?? 0),
  )) {
    const val = env2[key];
    if (typeof val === "string" && val.length > 400) {
      env2[key] = `${val.slice(0, 400)}…(truncated)`;
    }
    trimmed = { processEnv: { ...env2 }, runtime: payload.runtime };
    if (jsonUtf8ByteLength(trimmed) <= MAX_ENV_CONTENT_BYTES) {
      return trimmed;
    }
  }

  if (jsonUtf8ByteLength(trimmed) <= MAX_ENV_CONTENT_BYTES) {
    return trimmed;
  }

  return {
    processEnv: {},
    runtime: payload.runtime,
    _note: "processEnv omitted: exceeded size limit after truncation",
  };
}
