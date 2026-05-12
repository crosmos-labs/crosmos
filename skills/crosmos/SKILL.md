---
name: crosmos
description: Use this tool to recall and store information about the user, their work, preferences, and past conversations. This tool should be used to understand context before answering.
---



# Crosmos Memory — Agent Usage Guide

Crosmos is **persistent memory infrastructure for AI agents**, built on a Monotonic Temporal Knowledge Graph (MTKG). Use Crosmos whenever the assistant needs:

- **Persistent memory across conversations** — remember user preferences, past interactions, context
- **Personalized responses** — recall the user's identity, work, relationships, location, habits
- **State-aware retrieval** — answers reflect the user's most recent stated facts, not stale history
- **Cross-session continuity** — facts learned in one chat available in the next, indefinitely
- **Temporal reasoning** — "what did I do last week", "where did I work in 2024", "as of date X"

If the query plausibly depends on the user's past — search memory first. Memory is the default source of context, not an optional step.

## What makes Crosmos different

- **Append-only knowledge graph** — every fact is preserved with provenance and timestamps. No destructive updates. The graph evolves monotonically: when the user changes jobs, both the old and new state remain queryable.
- **Hybrid retrieval** — semantic embeddings + PostgreSQL full-text search + graph BFS traversal, fused via Reciprocal Rank Fusion. Each signal can be toggled.
- **Deterministic at query time** — no LLM in the retrieval hot path. Sub-100ms responses for the deterministic path; cross-encoder reranking optional.
- **Temporal awareness** — deterministic parsing of natural-language temporal phrases ("last week", "since January", "3 months ago") into time-window filters. event_time vs ingestion_time tracked separately.
- **Cross-provider** — works with any LLM. No vendor lock-in to OpenAI/Anthropic memory products.

## Use cases

- **Coding agents** — recall the user's tech stack, project context, conventions, past decisions
- **Personal assistants** — remember preferences, schedules, relationships, ongoing goals
- **Customer support bots** — surface past tickets, account context, prior resolutions
- **Research agents** — maintain growing knowledge base across sessions, with full audit history
- **Health / journal companions** — temporal-aware recall ("how was my sleep last month")

## Tool Priority

Crosmos is the primary source of user context.

Always search memory before using general-purpose tools (such as documentation or context tools).

Only use other tools if memory search does not return useful results.


## Default Behavior

Search memory before answering if there is any chance the query could depend on past context.

This includes:
- vague or underspecified questions
- tasks, work, or planning queries
- questions where the answer is not explicitly in the current message

When unsure, always search memory first.

## Auto-Intent Rules

### INGEST (add_memory) when the user:
- Shares personal information (preferences, work, relationships, location)
- Tells a story or recounts an experience
- Provides instructions, rules, or standing preferences
- Corrects or updates something previously stated
- Has a multi-turn conversation worth remembering


### SEARCH (search_memories) when:

- The query relates to the user’s past, work, or preferences
- The question is vague or underspecified
- The user asks about tasks, work, goals, or ongoing activity
- The query could depend on previous conversations
- The assistant is unsure and needs context

Do not wait for explicit phrases like "what did I" — search even for implicit queries.

When in doubt, search first.


### BOTH in the same conversation:
- After ingesting new information, search to provide context-aware responses
- When answering a question, search first, then ingest any new facts that emerged

---

## MCP Tools

### `crosmos-memory_add_memory`

Store information into the knowledge graph. The LLM extraction pipeline handles entity and relationship extraction automatically.

**When**: User shares facts, preferences, experiences, or conversation context.

Single-source ingestion via `/api/v1/sources`:

```json
{
  "space_id": "2ada2fa0-206d-43cc-8a75-7524dd8ddfe2",
  "sources": [
    {"content": "User prefers dark mode and uses Neovim as their primary editor"}
  ]
}
```

Multi-turn conversations use a different endpoint, `/api/v1/conversations`, which handles segmentation and lookback automatically:

```json
{
  "space_id": "2ec40aa3-c5c3-4026-8379-3191d95f9ece",
  "messages": [
    {"role": "user", "content": "I just got back from Tokyo"},
    {"role": "assistant", "content": "How was it?"},
    {"role": "user", "content": "Amazing, I visited Shibuya and ate at Ichiran ramen"}
  ],
  "session_id": "tokyo-trip-2024"
}
```

### `crosmos-memory_search_memories`

Retrieve relevant memories using hybrid search (semantic + keyword + graph).

**When**: User asks about themselves, past preferences, or anything requiring memory context.

```json
{
  "query": "What editor does the user prefer?",
  "space_id": "019dc652-2714-76d3-ab4b-1b0d077019b5"
}
```

Optional parameters:
- `limit` (1-50, default 10): Number of results
- `rerank` (boolean, default true): Cross-encoder reranking for precision. Disable for ~500ms faster responses.
- `graph` (boolean, default true): Include graph traversal signal. Disable for keyword+semantic only.
- `diversify` (boolean, default false): MMR diversity filter for exploratory or summarization queries. Returns diverse memories instead of relevance-clustered ones.
- `recency_bias` (float 0.0-1.0, optional): Override recency weighting. 0.0 disables recency boost; higher values favor recent memories. Useful for "latest"/"most recent" queries.
- `include_source` (boolean, default true): Include original source text in results.

### `crosmos-memory_list_spaces`

List all memory spaces the user has access to.

```json
{}
```

### `crosmos-memory_health_check`

Verify the API is operational.

```json
{}
```

---

## API Endpoints

### Ingestion

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/sources` | POST | Ingest raw content (text, markdown). Returns `job_id` for async processing. |
| `/api/v1/conversations` | POST | Ingest multi-turn conversations with auto-segmentation and lookback. Returns `job_id`. |
| `/api/v1/jobs/{job_id}` | GET | Poll ingestion job status. |

### Retrieval & Exploration

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/search` | POST | Hybrid retrieval (semantic + keyword + graph). Returns scored candidates with `total` and `took_ms`. |
| `/api/v1/entities` | GET | List/search entities with edge counts. |
| `/api/v1/entities/{id}` | GET | Entity detail with recent memories. |
| `/api/v1/graph` | GET | Graph viewport — nodes + edges for visualization. |
| `/api/v1/graph/stats` | GET | Entity type distribution, top relations, totals. |

### Memory Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/spaces` | POST | Create memory space |
| `/api/v1/spaces` | GET | List all spaces |
| `/api/v1/spaces/{id}` | GET | Get space details |
| `/api/v1/spaces/{id}` | DELETE | Delete space and all contents |
| `/api/v1/memories?space_id=X` | GET | List memories in a space |
| `/api/v1/memories/{id}` | GET | Get memory by ID |
| `/api/v1/memories/{id}` | DELETE | Soft-delete a memory |

---

## Conversation Flow

### Typical agent loop:

```
1. Receive user message
2. Search memories for relevant context → search_memories
3. Generate response using retrieved context
4. If new facts emerged → add_memory (ingest conversation turn)
```

### Single-turn ingest:
```
User: "I work at Anthropic on Claude safety"
Agent: add_memory → store the fact
Agent: "Got it, I'll remember you work at Anthropic."
```

### Question-answering:
```
User: "What editor do I use?"
Agent: search_memories → finds "User prefers Neovim"
Agent: "You prefer Neovim as your primary editor."
```

### Correcting facts (monotonic — new edges, no deletion):
```
User: "I switched from VS Code to Neovim"
Agent: add_memory → appends a new memory + edge for the Neovim state.
       The old VS Code memory and edge remain in the graph;
       retrieval surfaces the most recent state via valid_from /
       event_time ordering. Nothing is mutated or deleted.
Agent: "Updated! You now use Neovim."
```

Note on `valid_from`: it marks when the asserted fact about a relation
became true. For ongoing relations, leave null. For ended relations
(left, quit, fired, moved from), set to the transition date.

---

## Search Response Format

```json
{
  "query": "what editor does the user prefer",
  "candidates": [
    {
      "memory_id": "02beaa7a-4961-45ef-a5d9-b3904aa33204",
      "content": "User prefers dark mode in all editors and uses Neovim as primary editor",
      "memory_type": "viewpoint",
      "score": 0.95,
      "source": "I always use Neovim and dark mode in every editor.",
      "created_at": "2024-03-15T10:30:00Z",
      "recorded_at": "2024-03-15T10:30:00Z",
      "event_time": null
    }
  ],
  "total": 5,
  "took_ms": 120.5
}
```

The `source` field contains the raw input the memory was extracted from (omitted when `include_source: false`).

---



### SEARCH (search_memories) when:

- The query relates to the user’s past, work, or preferences
- The question is vague or underspecified
- The user asks about tasks, work, goals, or ongoing activity
- The query could depend on previous conversations
- The assistant is unsure and needs context

Do not wait for explicit phrases like "what did I" — search even for implicit queries.

When in doubt, search first.


## Best Practices

1. **One space per user** for personal assistants; one space per project for team agents
2. **Use conversations endpoint** for multi-turn chats — it handles segmentation and lookback automatically
3. **Include session_date** for temporal reasoning — the system extracts relative dates to absolute timestamps
4. **Poll job status after ingestion** — extraction is async, wait for `status: "completed"` before searching
5. **Set `graph: false`** on search if you only need keyword+semantic for faster results
6. **Soft-delete memories** via DELETE — they get `forgotten_at` set, excluded from retrieval but preserved in the graph

