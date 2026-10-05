# MCP Probot — unified tool usage

## Setup

```bash
npm install -g @kinginsun/mcp-probot

export PROBOT_MCP_TOKEN=pb-your_token_here
export AITEP_API_KEY=your_api_key_here
```

## Cursor (`mcpServers.json`)

```json
{
  "mcpServers": {
    "probot": {
      "command": "npx",
      "args": ["-y", "@kinginsun/mcp-probot"],
      "env": {
        "PROBOT_MCP_TOKEN": "${PROBOT_MCP_TOKEN}",
        "AITEP_API_KEY": "${AITEP_API_KEY}"
      }
    }
  }
}
```

## List tools

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

## Call HDI

```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"probot-hdi","arguments":{"drug1":"aspirin","drug2":"warfarin"}}}' | PROBOT_MCP_TOKEN=pb-your_token_here node dist/index.js
```

## Call AITEP PDE

```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"aitep_pde_report","arguments":{"ingredient":"Paracetamol"}}}' | AITEP_API_KEY=your_api_key_here node dist/index.js
```
