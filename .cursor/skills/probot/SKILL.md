---
name: probot
description: >-
  Guides calls to the Probot MCP server for herb-drug and drug-drug
  interactions (Probot HDI) and AITEP permitted daily exposure (PDE)
  reports. Use when the user asks about 药物相互作用, 中西药相互作用, 药食相互作用,
  herb-drug, drug-drug interaction, HDI, PDE, 每日允许暴露, 残留限度, 清洁验证,
  AITEP, Probot, or a named drug/herb pair. Routes among probot-hdi,
  probot-search-item, probot-hdi-by-id, and aitep_pde_report.
---

# Probot MCP

Call the tools on the connected `probot` MCP server. This skill only routes and interprets results. Do not shell out to `node`, and do not read token files.

Tool names are exact. The AITEP tool is `aitep_pde_report`.

If the server is not connected, say so and stop. Do not answer an interaction or PDE question from memory.

## Route

| Question | Tool |
| --- | --- |
| PDE, 每日允许暴露, residual / cleaning limit, AITEP report for one ingredient | `aitep_pde_report` |
| Does A interact with B, or what interacts with A | `probot-hdi` |
| Resolve a name to a catalog id, or the name match looks wrong | `probot-search-item` |
| Individual study rows after ids are known, or the name summary is too coarse | `probot-hdi-by-id` |

Start a named interaction question with `probot-hdi`. Use the two-step id flow when the user wants the underlying studies, when `probot-hdi` returns no usable summary, or when `matched_by` shows the wrong substance.

## Names

Build one alias string per substance before any name-based call. Join the English INN, Chinese name, and common synonyms with an ASCII `|`. For an herb, include the Latin binomial.

`aspirin|阿司匹林|乙酰水杨酸`

`ginkgo biloba|银杏叶|银杏`

Send that whole string as one argument. For AITEP, pass the English INN or common name alone (`Paracetamol`). One ingredient per call.

## Tools

### `probot-hdi`

| Arg | Required | Notes |
| --- | --- | --- |
| `drug1` | yes | Alias string |
| `drug2` | no | Second substance. Omit to list interactions for `drug1` only |
| `maxRows` | no | Positive integer. Default 10 |

```json
{ "drug1": "aspirin|阿司匹林|乙酰水杨酸", "drug2": "warfarin|华法林", "maxRows": 3 }
```

A pair query returns one synthesized record:

- `total_count`
- `items`: object with `drug1`, `drug2`, `title`, `source`, `url`, `article_link`
- `summary`: markdown write-up of the interaction
- `drug_ids`: catalog ids when present

Lead with `summary`. Cite `url` or `article_link`. Keep mechanisms inside that summary.

### `probot-search-item`

| Arg | Required | Notes |
| --- | --- | --- |
| `drug` | yes | Alias string |

Returns one object: `item_id`, `name`, `drug_name_cn`, `matched_by`.

Use `item_id` from this object only. If `name` or `matched_by` is a different substance than the user asked for, say what matched and do not continue to interactions for that id.

### `probot-hdi-by-id`

| Arg | Required | Notes |
| --- | --- | --- |
| `item_id1` | yes | From `probot-search-item` |
| `item_id2` | no | Second id. Omit to list interactions for `item_id1` only |
| `maxRows` | no | Positive integer. Default 10. This caps `items`, not `total_count` |

```json
{ "item_id1": "m5z8q0iywkt7walx9vt84e", "item_id2": "4ikssopkinsbf9obqd7aci", "maxRows": 3 }
```

Returns `total_count`, `summary` (may be empty), and `items` as an array of study rows:

`drug1`, `drug2`, `type` (`PK` or `PD`), `species` (`human` or `animal`), `source`, `interactions`, `title`, `article_link`, `url`.

Report `total_count` and how many rows came back. To see more rows, call again with a higher `maxRows`. Keep PK/PD and species attached to each row.

### `aitep_pde_report`

| Arg | Required | Notes |
| --- | --- | --- |
| `ingredient` | yes | English INN or common name |

```json
{ "ingredient": "Paracetamol" }
```

Returns a JSON array. Read each object for `ingredient`, `route`, `CAS_No`, `molecular_formula`, and `PDE_results[]` (`route`, `PDE_value`, `PDE_unit`, `PoD`, `PoD_source`, `source`).

State every route separately, with value and unit (`0.667 mg/day`, oral). PDE is a residual / cleaning exposure limit. `PoD` is the point of departure behind that limit, often a clinical dose, and is not the PDE.

## Failures

Surface `isError` text as returned.

- HDI tools need `PROBOT_MCP_TOKEN` (`pb-…`) on the `probot` server. A missing or non-`pb-` token fails those three tools only.
- `aitep_pde_report` needs `AITEP_API_KEY` on the same server. A missing key fails that tool only.
- Tell the user which variable to set in the MCP server config. Do not ask them to paste a token into the chat.

An unknown tool name means the running server is stale. Ask the user to reload the `probot` MCP server.
