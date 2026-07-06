# The Engram brain format (open)

A **Locally-stored** Engram brain is not a black box. It's two plain files in a folder you choose:

```
<your-folder>/
├── brain.sqlite     # the brain — a standard SQLite database (WAL mode), schema below
└── engram.json      # a small manifest so any tool can identify and open it
```

Nothing is proprietary about the *format*. You can open `brain.sqlite` with any SQLite browser, run
SQL over it, back it up, or move it to another machine. Bodies are stored as plain text this round
(at-rest encryption is on the roadmap; an `iv` column is reserved for it). This document is the open
spec so you can trust, inspect, and port your own brain.

> Note: this describes the on-disk **data**. How Engram *ranks* recall, which embedding model it
> uses, and the skill logic are part of the Engram service, not this format.

---

## `engram.json` — the manifest

```json
{
  "engram": "1",
  "storageMode": "local",
  "brainId": "<uuid>",
  "name": "Alex · Northwind",
  "kind": "personal | work | company | other",
  "embedModel": "<embedding model id used for the vectors>",
  "dim": 384,
  "createdAt": "<ISO 8601>",
  "updatedAt": "<ISO 8601>"
}
```

`embedModel` + `dim` are load-bearing: every row in `embeddings` must be produced by that same model
and dimension, or recall math won't line up. Record them here and keep them consistent.

---

## `brain.sqlite` — the schema

The brain is a **typed memory store + a graph + a vector index**. Six core tables:

### `brains` — one row per brain (a file can hold more than one)
| column | type | meaning |
|---|---|---|
| `id` | TEXT PK | brain id (matches `engram.json.brainId`) |
| `name` | TEXT | display name |
| `kind` | TEXT | `personal` \| `work` \| `company` \| `other` |
| `is_default` | INTEGER | 1 for the default brain |
| `created_at` | TEXT | ISO timestamp |

### `memory_items` — one row per entity (a person, project, decision, topic…)
| column | type | meaning |
|---|---|---|
| `id` | TEXT PK | entity id |
| `brain_id` | TEXT | owning brain |
| `type` | TEXT | `person` \| `topic` \| `decision` \| `project` \| `note` \| … |
| `title` | TEXT | the entity's name (unique per brain+type) |
| `body` | TEXT | the memory itself — markdown with `##` sections |
| `iv` | TEXT | reserved for at-rest encryption (unused this round) |
| `concept` / `subconcept` | TEXT | emergent grouping for the map |
| `tags` | TEXT | JSON array of strings |
| `summary` | TEXT | short index line for cheap search/recall |
| `confidence` | REAL | 0–1; graduates when a fact is confirmed |
| `depth_status` | TEXT | `provisional` \| `shallow` \| `at_depth` |
| `vitality` | REAL | usage signal — rises each time the item is recalled |
| `archived` | INTEGER | 1 = soft-deleted (hidden, excluded from recall) |
| `valid_from` / `valid_until` | TEXT | **temporal validity** — when the fact became true / stopped (null = still true) |
| `supersedes` / `superseded_by` | TEXT | supersede lineage — how a belief evolved without deleting history |
| `created_at` / `updated_at` | TEXT | timestamps |

### `memory_layers` — append-only dated enrichments on an item (the brain *accretes*, it doesn't overwrite)
| column | type | meaning |
|---|---|---|
| `id` | TEXT PK | layer id |
| `item_id` | TEXT | the entity this layer belongs to |
| `brain_id` | TEXT | owning brain |
| `section` | TEXT | which section it enriches |
| `body` | TEXT | the dated note |
| `summary` | TEXT | short form |
| `source` | TEXT | where it came from |
| `observed_at` | TEXT | the date the fact was observed |
| `created_at` | TEXT | timestamp |

### `edges` — links between entities, and pointers to external sources
| column | type | meaning |
|---|---|---|
| `id` | TEXT PK | edge id |
| `brain_id` | TEXT | owning brain |
| `src_id` | TEXT | the entity this edge starts from |
| `kind` | TEXT | `internal` (a `[[link]]` to another entity) or `external` (a source pointer) |
| `dst_id` / `dst_title` | TEXT | for internal edges — the linked entity |
| `uri` / `locator` | TEXT | for external edges — the source (a URL/permalink, a channel, a file…) + a locator |
| `observed_at` | TEXT | the source's date |
| `created_at` | TEXT | timestamp |

### `embeddings` — one vector per item/layer (the semantic index)
| column | type | meaning |
|---|---|---|
| `kind` | TEXT | `item` or `layer` |
| `ref_id` | TEXT | id of the item/layer (PK with `kind`) |
| `item_id` | TEXT | the owning entity |
| `brain_id` | TEXT | owning brain |
| `model` | TEXT | embedding model id (must match `engram.json.embedModel`) |
| `dim` | INTEGER | vector dimension |
| `vec` | BLOB | the vector — little-endian Float32 |
| `text` | TEXT | the text that was embedded |

### `aliases` — deterministic phrase → entity routing
| column | type | meaning |
|---|---|---|
| `brain_id` | TEXT | owning brain |
| `phrase` | TEXT | a phrase (PK with `brain_id`) |
| `entity_id` | TEXT | the entity it resolves to |
| `created_at` | TEXT | timestamp |

---

## How recall works (the shape, not the secret sauce)

1. **Rank** — embed the query with the brain's `embedModel`, take the cosine top-k over `embeddings`
   scoped to the brain; blend with a keyword pass over titles/summaries.
2. **Resolve** — check `aliases` for a deterministic phrase→entity hit, then walk to the matched entities.
3. **Return** — open the few matched `memory_items` (body + their `memory_layers` + 1-hop `edges` neighbours).

Never load the whole brain — traverse to the answer. That's the discipline the format is built for.

---

*Questions about the format?* engram@rootcause.ro
