# Evaluation Set: 40 Questions (English)

**Supporting material — AAPS PharmSci 360 2026**  
Submission 2478909 · Poster W0930-07-41 (confirm against schedule)  
**Probot Agent 2.0:** conversational retrieval from the Probot Herb–Drug Interaction (HDI) Database

English evaluation set for handouts, QR-linked supplements, and methods appendices. Prompts below are the English wording of all 40 items.

## Study arms

| Arm | Code | Description |
|---|---|---|
| Static tool registration | `static` | Fixed tool schemas; no dynamic skill loading |
| Agent 2.0 (dynamic skills) | `agent2` | Runtime `SKILL.md` discovery (`use_skill`) |
| No tools (optional) | `notools` | Qwen LLM only; no database or skill tools |

## Design

| Stratum | *n* | Focus | Prompt language in scored run |
|---|---:|---|---|
| **A** Simple co-use | 10 | Single herb–drug pair | Chinese (English below) |
| **B** Multi-pair summary | 10 | 2–3 pairs in one turn | Chinese (English below) |
| **C** Name resolution / no record | 10 | Synonyms, formulations, negatives | Mixed (English below) |
| **D** Long-horizon report + viz | 10 | PDF + HTML + Apache ECharts in one session | English |

**Protocol.** One new session per question per arm. Paste the prompt verbatim. Multi-pair items fail a primary score if any gold pair is mishandled. Fill `gold_*` from Probot before scoring; C09, C10, and the no-record legs of D10 remain `no`.

## Primary scores (all strata)

| Column | Score 1 when |
|---|---|
| `score_entity` | Every gold pair’s catalog items are hit. For no-record items, stating no catalog entry/record counts. Near-name lookup is allowed if the asked name is stated to have no result and the neighbor’s interaction is not presented as the asked one. |
| `score_fields` | The answer covers what the user asked. Unrequested slots are not deducted. For stratum D, the report body must cover the requested pairs/sections. |
| `score_citation` | The answer rests on evidence retrieved for that question. Printed document IDs are not required. No-record items pass if they state no direct literature. |
| `score_no_invention` | No unretrieved result is written as a database record; no fake citation. Reasonable inference after a clear no-record statement still scores 1. |

## Report / visualization scores (stratum D only)

| Column | Score 1 when |
|---|---|
| `score_pdf` | Downloadable `.pdf` delivered (DOCX-only intermediate does not count). |
| `score_html` | Downloadable `.html` page delivered. |
| `score_echarts` | The HTML (or a linked `.html`) contains a live Apache ECharts instance (`echarts.init` / `setOption`, or the skill’s chart generator output) of the required chart family. A static PNG alone does not count. |

Leave PDF/HTML/ECharts blank on A–C. Typical Agent 2.0 path: `use_skill(probot)` → multi-pair HDI → `use_skill(report-gen)` + `use_skill(echarts)` (+ `pdf` as needed) → deliver `.pdf` / `.html` in chat.

### Required ECharts families (D)

| ID | Chart family |
|---|---|
| D01 | Grouped bar |
| D02 | Heatmap |
| D03 | Radar |
| D04 | Sankey or chord |
| D05 | Horizontal bar + pie/rose (two charts) |
| D06 | Graph / force-directed network |
| D07 | Sunburst or treemap |
| D08 | Parallel coordinates or dual-axis |
| D09 | Timeline or step-line |
| D10 | Stacked or pictorial bar |

---

## A. Simple co-use (*n* = 10)

Single-pair questions: co-administration safety, mechanism, evidence grade, and/or risk as asked.

| ID | Intended pair | English prompt |
|---|---|---|
| A01 | Pueraria (葛根)–danshen (丹参) | Can I take Pueraria (kudzu root, 葛根) together with danshen (*Salvia miltiorrhiza*, 丹参)? |
| A02 | Danshen–aspirin | Can danshen be used together with aspirin? Please describe the mechanism, evidence grade, and risk. |
| A03 | Danshen–warfarin | Can danshen be used while taking warfarin? |
| A04 | Ginkgo–aspirin | Is there an interaction between ginkgo leaf and aspirin? |
| A05 | St. John’s wort–docetaxel | Can St. John’s wort be used together with docetaxel? |
| A06 | Grapefruit–doxorubicin | What interaction exists between grapefruit and doxorubicin? |
| A07 | Grapefruit–etoposide | Can grapefruit be consumed while using etoposide? |
| A08 | Licorice–digoxin | What should be noted when licorice is combined with digoxin? |
| A09 | Ginseng–warfarin | Can ginseng be used together with warfarin? |
| A10 | Garlic–warfarin | Can garlic be taken together with warfarin? |

---

## B. Multi-pair summary (*n* = 10)

One turn must address every listed pair (mechanism / evidence / risk as requested).

| ID | Intended pairs | English prompt |
|---|---|---|
| B01 | Danshen–aspirin; danshen–fluorouracil | Please research and summarize the interactions of danshen with aspirin and with fluorouracil. |
| B02 | Grapefruit–docetaxel; grapefruit–doxorubicin; grapefruit–etoposide | Separately describe the interactions of grapefruit with docetaxel, doxorubicin, and etoposide, and for each give mechanism, evidence grade, and risk. |
| B03 | Danshen–warfarin; ginkgo–warfarin; garlic–warfarin | For a patient on warfarin who also uses danshen, ginkgo, and garlic, give mechanism, evidence grade, and risk **per pair**. |
| B04 | St. John’s wort–cyclosporine; St. John’s wort–indinavir; St. John’s wort–docetaxel | Separately describe the interactions of St. John’s wort with cyclosporine, indinavir, and docetaxel. |
| B05 | Ginseng–warfarin; ginseng–digoxin | Summarize the interactions of ginseng with warfarin and with digoxin. |
| B06 | Licorice–hydrochlorothiazide; licorice–digoxin | When licorice is combined with hydrochlorothiazide versus digoxin, how do the mechanisms and risks differ? |
| B07 | Ginkgo–aspirin; ginkgo–clopidogrel; ginkgo–warfarin | Compare the evidence for ginkgo with aspirin, clopidogrel, and warfarin. |
| B08 | Grapefruit–cyclosporine; grapefruit–tacrolimus; grapefruit–simvastatin | For grapefruit juice combined with cyclosporine, tacrolimus, and simvastatin, give mechanism and evidence grade for each pair. |
| B09 | Green tea–bortezomib; turmeric–tacrolimus | Separately query the interactions of green tea with bortezomib and of turmeric with tacrolimus. |
| B10 | Danshen–fluorouracil; *Ganoderma*–fluorouracil | A patient on fluorouracil chemotherapy is also self-medicating with danshen tablets and *Ganoderma lucidum* spore powder. Separately query danshen–fluorouracil and *Ganoderma*–fluorouracil interactions. |

---

## C. Name resolution or no record (*n* = 10)

Tests catalog binding, synonym/language variants, formulation stripping, and constructed negatives.

| ID | Intended pair / outcome | Resolution rule | English prompt |
|---|---|---|---|
| C01 | Compound Danshen Dripping Pills–aspirin (fallback: danshen–aspirin if the formula is absent) | First query the finished formula and enteric-coated aspirin. If the catalog has no formula entry, strip dosage form, bind to danshen–aspirin, and state the fallback. Inventing a formula-level interaction scores 0. | Can Compound Danshen Dripping Pills (复方丹参滴丸) be taken together with enteric-coated aspirin? |
| C02 | Danshen–aspirin (same canonical gold as A02) | English / Latin name must bind to the same catalog items as A02. Binding to a different *Salvia* species scores 0. | Can I take *Salvia miltiorrhiza* with aspirin? Give the mechanism, evidence grade, and risk. |
| C03 | Danshen–aspirin (same canonical gold as A02) | Traditional Chinese 「丹參」 must bind to the same danshen item as A02. | Is there an interaction between 丹參 (danshen) and aspirin? |
| C04 | St. John’s wort–docetaxel (same canonical gold as A05) | 贯叶连翘 → St. John’s wort; 多烯紫杉醇 → docetaxel; same items as A05. | What is the interaction between Hypericum / 贯叶连翘 and docetaxel (多烯紫杉醇)? Give mechanism, evidence grade, and risk. |
| C05 | St. John’s wort–docetaxel (same canonical gold as A05) | English names must bind to the same items as A05. | What is the interaction between St. John's wort and docetaxel? |
| C06 | Xinkeshu–aspirin (fallback to danshen or *Panax notoginseng* constituents if needed) | First query Xinkeshu (心可舒). If no formula entry, state that the name was checked, then whether danshen or notoginseng was queried instead. Giving an interaction without documenting the tried path scores 0. | Can aspirin be added while taking Xinkeshu (心可舒)? |
| C07 | Grapefruit–doxorubicin (same canonical gold as A06) | Adriamycin → doxorubicin; grapefruit juice → grapefruit. | Is there an interaction between grapefruit juice and Adriamycin? |
| C08 | Danshen–warfarin (same canonical gold as A03) | Strip strength “2.5 mg” and dosage forms (“sodium tablets” / “tea”); bind to the same items as A03 and state what was stripped. | I am taking warfarin sodium 2.5 mg tablets; can I also drink danshen tea? |
| C09 | No such herb (constructed negative) | “Yueqiu cao” / 月球草 is not a real herb. Stating no catalog entry is correct. Near-name lookup is allowed only if the asked name is reported as empty and the neighbor’s interaction is not presented as Yueqiu cao’s. Inventing mechanism, evidence, risk, or literature scores 0. | Does Yueqiu cao (月球草) interact with aspirin? Answer only from the database. |
| C10 | No such drug (constructed negative) | XYZ-404 is not a real product. State no catalog entry and list search attempts. Do not treat a hit on zanubrutinib as a successful match for XYZ-404. | Is there literature for danshen with the zanubrutinib generic powder XYZ-404? |

**Shared gold.** C02/C03 share gold with A02; C04/C05 with A05; C07 with A06; C08 with A03.

---

## D. Long-horizon PDF + HTML + ECharts (*n* = 10)

Each prompt, in **one session**, must deliver a downloadable **PDF**, a downloadable **HTML** page, and at least one interactive **Apache ECharts** chart of the required family.

| ID | Intended pairs | *n* | English prompt |
|---|---|---:|---|
| D01 | Danshen–warfarin; ginkgo–warfarin; garlic–warfarin; ginseng–warfarin | 4 | A patient is on long-term warfarin. Query the interactions of danshen (*Salvia miltiorrhiza*), ginkgo, garlic, and ginseng each with warfarin. For every pair, summarize mechanism, evidence grade, risk, and management advice. Deliver: (1) a downloadable PDF clinical risk briefing with References (clickable links); (2) an HTML page that embeds an Apache ECharts grouped bar chart comparing risk level (or evidence grade coded as a numeric score) across the four herbs. |
| D02 | Grapefruit–docetaxel; grapefruit–doxorubicin; grapefruit–etoposide; grapefruit–cyclosporine; grapefruit–tacrolimus; grapefruit–simvastatin | 6 | Systematically query grapefruit (including grapefruit juice) with docetaxel, doxorubicin, etoposide, cyclosporine, tacrolimus, and simvastatin. For each pair give mechanism, evidence grade, and risk. Deliver: (1) a full PDF report; (2) an HTML risk matrix driven by an Apache ECharts heatmap (pairs on one axis, risk/evidence on the other, or a 2D category heatmap). |
| D03 | Danshen–fluorouracil; *Ganoderma*–fluorouracil; green tea–bortezomib; turmeric–tacrolimus | 4 | Oncology case: a patient on fluorouracil chemotherapy also self-medicates with danshen tablets and *Ganoderma lucidum* spore powder, drinks green tea often, and takes curcumin capsules. Query danshen–fluorouracil, *Ganoderma*–fluorouracil, green tea–bortezomib, and turmeric–tacrolimus. Lead with the two fluorouracil pairs. Deliver: (1) a PDF consult memo; (2) an HTML page with an Apache ECharts radar chart comparing the four pairs on axes such as evidence strength, clinical risk, and relevance to fluorouracil (you may score axes from the retrieved summaries). |
| D04 | St. John’s wort–cyclosporine; St. John’s wort–indinavir; St. John’s wort–docetaxel | 3 | Write a topic report on St. John’s wort (*Hypericum perforatum*) with cyclosporine, indinavir, and docetaxel: cover, TOC, per-pair mechanism and evidence, clinical management, references. Deliver: (1) PDF (DOCX intermediate allowed); (2) HTML with an Apache ECharts sankey or chord diagram showing St. John’s wort as the source node and the three drugs as targets, with edge weight reflecting evidence grade or risk. |
| D05 | Danshen–aspirin; ginkgo–aspirin; ginkgo–clopidogrel; ginkgo–warfarin | 4 | Cardiology herb–drug panel: query danshen–aspirin, ginkgo–aspirin, ginkgo–clopidogrel, and ginkgo–warfarin. Compare bleeding / antiplatelet-related evidence. Deliver: (1) PDF assessment; (2) HTML dashboard with two Apache ECharts views — a horizontal bar chart of evidence strength and a pie (or rose) chart of risk-category share across the four pairs. |
| D06 | Grapefruit–cyclosporine; grapefruit–tacrolimus; St. John’s wort–cyclosporine | 3 | Transplant follow-up case: the patient takes cyclosporine or tacrolimus, drinks grapefruit juice, and recently bought a St. John’s wort product. Query grapefruit–cyclosporine, grapefruit–tacrolimus, and St. John’s wort–cyclosporine. Explain CYP/transporter mechanisms and risk. Deliver: (1) a patient-facing PDF information sheet; (2) a pharmacist-facing HTML page with an Apache ECharts graph / force-directed network (nodes = substances, edges = documented interactions). |
| D07 | Danshen–aspirin; danshen–warfarin; danshen–fluorouracil | 3 | Centered on danshen, query its interactions with aspirin, warfarin, and fluorouracil. Produce a bilingual (Chinese and English) PDF topic report, plus an English HTML page that embeds an Apache ECharts sunburst or treemap of danshen → drug → mechanism/evidence tags derived from the retrieval. Include clickable reference links. |
| D08 | Licorice–hydrochlorothiazide; licorice–digoxin | 2 | Compare licorice with hydrochlorothiazide versus licorice with digoxin: mechanisms and risks side by side (do not merge into one vague paragraph). Deliver: (1) PDF comparison report; (2) HTML with an Apache ECharts parallel-coordinates or dual-axis contrast chart encoding mechanism class and risk for the two pairs. |
| D09 | Compound Danshen Dripping Pills–aspirin; Xinkeshu–aspirin; grapefruit–doxorubicin; danshen–warfarin | 4 | Long-horizon name-resolution task. Handle in order: (1) Compound Danshen Dripping Pills + enteric-coated aspirin; (2) Xinkeshu + aspirin; (3) grapefruit juice + Adriamycin; (4) warfarin sodium 2.5 mg tablets + danshen tea. For each, document catalog binding or fallback, then the interaction conclusion. Deliver: (1) PDF resolution-log report; (2) HTML with an Apache ECharts custom timeline or step-line chart of the four resolution steps (success / fallback / hit). |
| D10 | Danshen–aspirin; ginkgo–aspirin; Yueqiu cao–aspirin (none); danshen–zanubrutinib (no record / no item) | 4 | Mixed report: positively query danshen–aspirin and ginkgo–aspirin; also check whether “Yueqiu cao (月球草)–aspirin” and “danshen–zanubrutinib” have catalog records. Deliver: (1) PDF with chapters “Records found” and “No record” (no invented interactions); (2) HTML overview with an Apache ECharts stacked bar or pictorial bar showing count of pairs with record vs no record, plus labels for each queried name. |

D10 no-record legs follow the C09/C10 spirit. Do not add them as positive gold records.

---

## Citation note for the poster

Suggested one-line methods mention:

> Evaluation used a 40-item HDI prompt set across four strata (simple co-use, multi-pair summary, name resolution/no-record, and long-horizon PDF/HTML/ECharts reporting; *n* = 10 each), scored for entity binding, field coverage, citation grounding, and non-invention, with additional PDF/HTML/ECharts criteria on stratum D.
