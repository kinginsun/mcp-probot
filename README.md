# mcp-probot

Unified [MCP](https://modelcontextprotocol.io) (Model Context Protocol) server for **Probot-series** databases. One stdio process exposes all of the following:

| Database | Tools | Backend |
| --- | --- | --- |
| [Probot HDI](https://www.probot.hk) | `probot-hdi`, `probot-search-item`, `probot-hdi-by-id` | Herb-drug / drug-drug interactions |
| [AITEP](https://aitep.probot.hk) | `aitep_pde_report` | Permitted Daily Exposure (PDE) reports |

This package merges `@kinginsun/mcp-probot-hdi` and `@kinginsun/mcp-aitep`. HDI tool names and request payloads stay the same. The AITEP tool is `aitep_pde_report`.

## Installation

```bash
npm install -g @kinginsun/mcp-probot
```

Or run without a global install:

```bash
npx -y @kinginsun/mcp-probot
```

## Configuration

Set the environment variables for the databases you use. Missing credentials only fail the tools that need them; the rest still work.

### Probot HDI — `PROBOT_MCP_TOKEN`

Create a personal API token in the Probot account center. The plaintext value starts with `pb-` and is shown only once.

```bash
export PROBOT_MCP_TOKEN=pb-your_token_here
```

Optional API base (no trailing slash; default `https://www.probot.hk/probot_api/mcp`):

```bash
export PROBOT_HDI_API_BASE=https://www.probot.hk/probot_api/mcp
```

### AITEP PDE — `AITEP_API_KEY`

Obtaining an `AITEP_API_KEY` requires **company certification** and **VIP authorization** on AITEP.

1. Open [https://aitep.probot.hk](https://aitep.probot.hk)
2. [Register](https://aitep.probot.hk/en/login/register) / [sign in](https://aitep.probot.hk/en/login)
3. Apply for or generate an API key, then:

```bash
export AITEP_API_KEY=your_api_key_here
```

Optional URL override (default `https://aitep.probot.hk/api/hkpma/mcp_api_detail`):

```bash
export AITEP_API_BASE=https://aitep.probot.hk/api/hkpma/mcp_api_detail
```

### Cursor / Claude Desktop

```json
{
  "mcpServers": {
    "probot": {
      "command": "npx",
      "args": ["-y", "@kinginsun/mcp-probot"],
      "env": {
        "PROBOT_MCP_TOKEN": "pb-your_token_here",
        "AITEP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Local checkout (after `npm install && npm run build`):

```json
{
  "mcpServers": {
    "probot": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-probot/dist/index.js"],
      "env": {
        "PROBOT_MCP_TOKEN": "pb-your_token_here",
        "AITEP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Tools

### `probot-hdi`

Search herb-drug or drug-drug interactions by drug/herb names.

| Parameter | Type   | Required | Description                                                                                   |
| --------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `drug1`   | string | Yes      | Drug/herb name, or multiple aliases in one string separated by ASCII `\|`                     |
| `drug2`   | string | No       | Second drug/herb; same pipe-separated alias convention                                        |
| `maxRows` | number | No       | Maximum results to return (default: 10)                                                       |

When only `drug1` is provided, the API returns all known interactions involving that item (up to `maxRows`).

```json
{
  "name": "probot-hdi",
  "arguments": {
    "drug1": "aspirin|阿司匹林|乙酰水杨酸",
    "drug2": "ginkgo biloba"
  }
}
```

### `probot-search-item`

Look up a drug or herb by name and return its `item_id`.

| Parameter | Type   | Required | Description                                           |
| --------- | ------ | -------- | ----------------------------------------------------- |
| `drug`    | string | Yes      | Drug/herb name, or multiple aliases separated by `\|` |

```json
{
  "name": "probot-search-item",
  "arguments": {
    "drug": "aspirin|阿司匹林"
  }
}
```

### `probot-hdi-by-id`

Search interactions by `item_id`(s) from `probot-search-item`.

| Parameter  | Type   | Required | Description                             |
| ---------- | ------ | -------- | --------------------------------------- |
| `item_id1` | string | Yes      | First item_id                           |
| `item_id2` | string | No       | Second item_id                          |
| `maxRows`  | number | No       | Maximum results to return (default: 10) |

```json
{
  "name": "probot-hdi-by-id",
  "arguments": {
    "item_id1": "123",
    "item_id2": "456"
  }
}
```

Typical HDI workflow:

1. **Direct query** — `probot-hdi` with drug names.
2. **Two-step query** — `probot-search-item` to resolve names, then `probot-hdi-by-id`.

### `aitep_pde_report`

Retrieves the PDE (Permitted Daily Exposure) report for an active pharmaceutical ingredient.

| Parameter     | Type   | Required | Description                          |
| ------------- | ------ | -------- | ------------------------------------ |
| `ingredient`  | string | Yes      | Name of the active pharmaceutical ingredient |

```json
{
  "name": "aitep_pde_report",
  "arguments": {
    "ingredient": "Paracetamol"
  }
}
```

## Adding another Probot database

Each backend lives in its own module (`src/hdi.ts`, `src/aitep.ts`). Register a new tool in `src/tools.ts` with `name`, `description`, `inputSchema`, Zod `schema`, and `handler`. The stdio server in `src/index.ts` does not need to change.

## Requirements

- Node.js >= 18.0.0
- `PROBOT_MCP_TOKEN` for HDI tools
- `AITEP_API_KEY` for AITEP tools

## License

MIT
