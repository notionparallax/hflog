# Build Spec — CDAA Confidential Diving Human-Factors Reporting (Prototype)

**Audience:** Claude Code (build brief). **Status:** Prototype / proof-of-concept, not production. Use synthetic/test data only — do not implement real PII hardening beyond the boundary described in §7.

---

## 1. Purpose

A **confidential** (not anonymous) reporting system for the Cave Divers Association of Australia (CDAA) that captures structured human-factors metadata for **every dive**, so that near-miss and incident **rates** can be established against a real denominator.

Two design facts drive everything:

1. **Confidential, not anonymous.** The diver is never named to the public or in any analytical export. Identity is held securely by the operating body so that, for a serious or instructive report, the diver can be asked to make contact. De-identification is a hard boundary (§7), not a display filter.
2. **Mandated logging = real denominator.** CDAA encourages/mandates logging through this method, so the count of logged dives ≈ the true number of dives. Every dive is logged, including uneventful ones (`had_event = false`). Nil-event logging must be near-instant.

The tool integrates with **Subsurface** without modifying it: it reads and writes a delimited, versioned metadata block inside the dive **Notes** field (§4–5). Subsurface is treated as a dumb carrier; all intelligence lives in this tool.

---

## 2. Scope

**In scope (build this):**

- Structured data-entry form (web) producing a report.
- Serializer/parser for the Notes metadata block, with lossless round-trip.
- Subsurface XML read/write of the `<notes>` field (inject/update block, preserve surrounding free text).
- Local persistence (SQLite) with a hard identity/analytical split.
- De-identified export (CSV + JSON).
- Basic aggregation dashboard (denominator, numerator, rate, severity×proximity matrix, factor frequencies).
- Synthetic seed data (dives + reports) and a README.

**Explicit non-goals (do NOT build):**

- Production multi-user server, real auth, KMS-grade PII encryption.
- Subsurface git-backed storage format (XML export is sufficient; note as future work).
- Cloud hosting / multi-org tenancy.
- Statistical rigour (confidence intervals, under-reporting models) — leave hooks, don't implement.
- Any change to Subsurface itself.

---

## 3. Data model

Keep all controlled vocabularies in a single module (`vocab.py`) — they **will** change. Use enums.

### 3.1 Dive context (denominator — recorded for every dive)

| field | type | notes |
|---|---|---|
| `report_id` | uuid | primary key |
| `reporter_id` | str | opaque local handle; links to identity table (§7) |
| `dive_date` | date | |
| `dive_site` | str | free text; optional `region_code` later |
| `dive_type` | enum | `cave`, `cavern`, `sinkhole`, `open_water`, `training`, `other` |
| `max_depth_m` | float | |
| `runtime_min` | int | |
| `had_event` | bool | the nil-event switch; drives whether §3.3 applies |

### 3.2 Pre-dive state (IMSAFE + extensions)

IMSAFE is the aviation fitness-to-fly checklist, widely adopted in diving — use it verbatim for recognisability.

| field | type | scale |
|---|---|---|
| `imsafe_illness` | int | 0–3 (none → significant) |
| `imsafe_medication` | bool | |
| `imsafe_stress` | int | 0–3 |
| `imsafe_alcohol` | bool | within prior 24h |
| `imsafe_fatigue` | int | 0–3 (well-rested → exhausted) |
| `imsafe_eating_emotion` | int | 0–3 |
| `site_familiarity` | enum | `first_time`, `return`, `regular` |
| `buddy_familiarity` | enum | `stranger`, `occasional`, `regular`, `solo` |
| `time_pressure` | int | 0–3 |
| `new_or_changed_kit` | bool + str | flag + free-text description |

### 3.3 Event (only when `had_event = true`)

`event_type` vocabulary is aligned to DAN's DIRS categories so data can pool later:

`rapid_ascent`, `out_of_gas`, `buoyancy_loss`, `valve_not_fully_open`, `entanglement`, `lost_guideline`, `silt_out`, `light_failure`, `gas_switch_error`, `dcs_symptom`, `equipment_failure`, `buddy_separation`, `navigation_error`, `other`.

| field | type | notes |
|---|---|---|
| `event_type` | enum | above |
| `event_description` | str | free text |
| `potential_severity` | int 1–5 | **axis A** — see anchors below |
| `proximity_barriers_remaining` | int 1–5 | **axis B** — see anchors below |
| `outcome` | enum | `no_harm_near_miss`, `minor_injury`, `treatment_required`, `evacuation`, `fatality` |
| `classification` | enum (derived) | `nil` / `near_miss` / `incident` — derive: no event → nil; event with `no_harm_near_miss` → near_miss; else incident |

**Severity and proximity are two orthogonal axes — never collapse them into one number.** Show the anchor text in the UI; inter-rater consistency depends on it.

*Potential severity (had this gone wrong, how bad could the outcome have been):*
1. Trivial — comfort/annoyance only.
2. Minor — recoverable discomfort, no plausible injury.
3. Moderate — plausible minor injury or aborted dive.
4. Serious — plausible serious injury, DCS, or emergency ascent.
5. Catastrophic — plausible fatality.

*Proximity / barriers remaining (how close it actually came):*
1. Many barriers remained; caught early, ample margin.
2. Comfortable margin; resolved routinely.
3. Noticeable erosion; one or two barriers left.
4. Last effective barrier; narrowly avoided.
5. Essentially only luck/circumstance prevented the incident.

### 3.4 Human-factors coding (multi-select — the "Dirty Dozen")

`factors[]` from: `communication`, `complacency`, `knowledge`, `distraction`, `teamwork`, `fatigue`, `resources`, `pressure`, `assertiveness`, `stress`, `awareness`, `norms`.

`learning_note` (str) — what the diver would do differently / any systemic factor.

### 3.5 Confidential follow-up (see §7 — stored separately, never exported)

| field | type | notes |
|---|---|---|
| `contactable` | bool | diver consents to contact |
| `contact_detail` | str | held in identity table only |
| `follow_up_requested` | bool | set by an analyst reviewing the report |

---

## 4. Notes-block serialization format

The block lives inside the Subsurface Notes field, coexisting with human free text. Requirements: human-readable, machine-parseable, round-trippable, and **version-stamped** for schema evolution.

Everything between the sentinels is the machine block; everything outside is preserved verbatim.

```
[CDAA-HF v1]
report_id: 3f2a9c7e-...
had_event: true
imsafe: {illness: 0, medication: no, stress: 2, alcohol: no, fatigue: 2, eating_emotion: 1}
site_familiarity: return
buddy_familiarity: regular
time_pressure: 1
new_kit: "new backplate/wing, first dive on it"
event_type: lost_guideline
severity: 4
proximity: 3
outcome: no_harm_near_miss
factors: [awareness, complacency]
learning: "Rushed the primary tie-off; will re-brief line protocol."
[/CDAA-HF]
```

**Parsing rules:**
- Locate the block by the `[CDAA-HF vN]` … `[/CDAA-HF]` sentinels.
- Parse the interior as a permissive key:value / YAML-ish structure.
- Preserve all text outside the sentinels exactly (both before and after).
- If no block is present, the dive is a valid nil-event denominator record if it exists in the divelog — but a report is only created when a block is written.
- Reject/soft-warn on unknown schema version.

---

## 5. Subsurface integration

- Subsurface exports an XML divelog (`.ssrf` / `.xml`); each dive is a `<dive>` with a `<notes>` child.
- **Write mode:** given a divelog file and a target dive (match by dive `number`, `date`+`time`, or dive `id`), read existing `<notes>`, inject or update the CDAA block while preserving surrounding free text, write the file back.
- **Read/aggregate mode:** iterate all `<dive>` elements, extract any CDAA block, load into SQLite. Count *all* dives as the denominator regardless of whether a block is present.
- **Safety:** never edit in place. Work on a copy, validate the XML parses, then atomically replace; keep a timestamped `.bak`.
- Use `lxml` (or stdlib `ElementTree`). Handle files with many dives.

---

## 6. Architecture & stack (suggested)

- **Python 3.11+**, single repo, `venv`.
- **Backend:** FastAPI.
- **Storage:** SQLite via SQLModel/SQLAlchemy.
- **Front end:** minimal — Jinja2 server-rendered form + a lightweight results page. Keep JS dependencies near zero. The severity/proximity anchors render as helper text next to each control.
- **CLI:** a small Typer/argparse CLI for the Subsurface round-trip (`inject`, `ingest`) and `export`, so the tool is usable headless.
- Keep `vocab.py`, `serialize.py` (block ↔ dict), `subsurface.py` (XML I/O), `store.py` (DB), `web/`, `cli.py` as separable modules.

---

## 7. Confidentiality boundary (the one thing to get right)

Model identity as a **hard boundary**, not a filter:

- **Two tables.** `reports` holds all analytical fields (§3.1–3.4) keyed by `reporter_id` (an opaque handle). `identities` holds `reporter_id → contact_detail`, `contactable`, `follow_up_requested`. Nothing else joins to `identities`.
- **Export path physically cannot reach `identities`.** The export function selects only from `reports`; write a test asserting the export contains zero contact fields.
- An analyst view may set `follow_up_requested` on a report; resolving that to an actual contact detail is a separate, access-gated action (for the prototype, a distinct CLI command is fine).

---

## 8. Aggregation dashboard (basic)

From the ingested data, compute and display:

- **Denominator:** total logged dives.
- **Numerator:** dives with `had_event = true`; and separately, incidents vs near-misses.
- **Rate:** near-misses per 100 dives, incidents per 100 dives (with a visible caveat that early figures are unstable and reporting-culture-sensitive).
- **Severity × proximity matrix:** 5×5 heatmap count.
- **Factor frequency:** bar chart of `factors[]`.
- **Pre-dive signal:** simple cross-tab of `had_event` against IMSAFE fields and `new_or_changed_kit` (association only, no causal claim).

---

## 9. Acceptance criteria

- [ ] Form → block → XML `<notes>` → parse → dict is **identical** to the submitted dict (round-trip test).
- [ ] A CDAA block injected into notes containing pre-existing free text loses none of that free text.
- [ ] De-identified export contains **no** contact fields (asserted by test).
- [ ] Denominator = count of all logged dives; numerator = dives with `had_event = true`.
- [ ] `potential_severity` and `proximity_barriers_remaining` are stored as separate columns.
- [ ] Nil-event logging path takes minimal input (dive context + `had_event = false`).
- [ ] Synthetic dataset (e.g. ~200 dives, ~15 events across the severity/proximity space) renders the full dashboard.
- [ ] Block format carries a schema version; unknown versions warn rather than crash.

---

## 10. Notes for the builder

- Design `event_type` and IMSAFE fields to make a future export mapper to **DAN DIRS** / **Gareth Lock's DISMS** schema straightforward — interoperability is the long-term payoff, so don't invent idiosyncratic names.
- Keep all vocabularies in one place; expect the CDAA to revise them.
- Anchor the two 1–5 scales in the UI with the descriptor text from §3.3 — the taxonomy is worthless without inter-rater consistency.
- Treat the git-backed Subsurface format, real auth, and statistical inference as clearly-marked TODOs, not silent omissions.