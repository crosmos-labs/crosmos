---
title: "How to Improve hermes Memory with Crosmos"
description: "Learn how to improve hermes Agent memory with Crosmos using persistent recall, automatic turn sync, shared spaces, and a quick setup."
slug: "improve-hermes-memory"
targetKeyword: "how to improve hermes memory"
secondaryKeywords:
  - "hermes Agent memory"
  - "hermes memory provider"
  - "persistent memory for hermes Agent"
  - "shared memory for AI agents"
author: "AUTHOR_NAME"
readTime: 5
publishedAt: "YYYY-MM-DD"
thumbnail: "/blogs/hermes-memory.png"
imageWidth: 1200
imageHeight: 480
---

# How to Improve hermes Memory with Crosmos

If you use hermes for more than a few sessions, you eventually hit the same annoying wall: you know the agent has seen the project before, but you still have to explain the important parts again.

Which API decision did we settle on? Why did we avoid that dependency? What did we already try during last week's incident? A new session should not feel like onboarding a new teammate every morning.

hermes already has built-in memory through `MEMORY.md` and `USER.md`. That memory is useful for stable preferences, environment details, and a small set of notes. The problem is that project history is usually bigger than a couple of curated files.

That is where an external memory provider helps. Crosmos gives hermes a persistent memory layer that can search older context when it is relevant, save completed work automatically, and share selected memories across authorized profiles and teammates.

> **Important:** hermes Agent 0.18.2 or newer and Python 3.11–3.13 are required. Start a new hermes session after setup or configuration changes.

## Why hermes memory can feel limited

The built-in memory is deliberately small and focused. That is a good thing for preferences such as “keep answers concise” or “this project uses PostgreSQL.” It keeps those facts close to the agent without loading every old conversation into every prompt.

It is not designed to be the complete history of a project or a team.

Over time, useful context ends up scattered across sessions: architecture decisions, failed approaches, deployment fixes, customer details, and the reasoning behind a change. A short note can preserve the conclusion, but not always the evidence or the timeline that made the conclusion useful.

You can search old sessions manually, keep a large notes file, or build a separate knowledge base. All of those work up to a point. They also make you responsible for remembering to maintain the system that is supposed to help you remember.

## What Crosmos adds

Crosmos runs as an external hermes memory provider. The built-in memory keeps working alongside it.

Before a meaningful turn, the provider searches your active Crosmos space with hybrid retrieval and adds the most relevant memories to the context. It can match the meaning of a question, exact keywords, connected entities, and the timing of an event. When the search finds nothing useful, it stays out of the way.

After a completed user-and-assistant exchange, the provider sends that turn to Crosmos in the background. A failed submission does not block the response. It remains buffered for another attempt on the next turn, session change, session end, or shutdown.

You can also ask for memory explicitly when automatic recall is not enough:

- `crosmos_recall` searches persistent memories.
- `crosmos_remember` queues a durable fact or decision.
- `crosmos_forget` removes a memory by ID.

The default Crosmos space is resolved by name and created when it does not exist. New memories are private by default, with organization visibility available when you want approved teammates to work from the same context.

That distinction matters. Shared memory should mean “the right people can build on what we already learned,” not “every conversation is visible to everyone.”

## Install Crosmos

You need a Crosmos API key from [console.crosmos.dev](https://console.crosmos.dev). Then install and configure the provider:

```bash
hermes plugins install crosmos-labs/hermes-crosmos
hermes memory setup crosmos
```

The setup wizard asks for your API key, API URL, default space, and the visibility of newly ingested memories. It stores the secret in the active hermes profile and keeps the non-secret settings separate.

hermes allows one external memory provider to be active at a time. Selecting Crosmos changes the external provider, if another one is already active. It does not turn off `MEMORY.md` or `USER.md`.

After setup, start a new session and check the provider:

```bash
hermes memory status
```

When automatic recall finds something useful, hermes shows a small status line:

```text
🌌 Crosmos — recalled 3 memories
```

Now test it with something real. Tell hermes a project preference or an architecture decision. Let the turn finish, start a new session, and ask a question that depends on the earlier context. You should not need to paste the old conversation back in.

## Where it helps

The simplest use case is coding work. A week later, hermes can recall why the team chose cursor pagination, which migration failed in staging, or why a tempting dependency was rejected. Git already remembers what changed. Crosmos helps preserve why it changed.

It is also useful when several people work through the same problem. One engineer can record the failed incident mitigation in an organization-visible space. Another teammate, using a separate hermes profile, can ask what has already been tried and continue from there.

The same pattern works for research, support, and customer projects. Each space keeps a different world separate, so a personal project does not pollute the context used for work.

If you are thinking about the larger problem of fragmented organizational context, [this article on the fragmentation problem](/blogs/the-fragmentation-problem) is a useful companion. If you care about keeping the history behind a decision, read [why memory should be auditable](/blogs/memory-should-be-auditable).

## Start here

The best test is not a benchmark or a demo prompt. Install the provider, use hermes on one real project, close the session, and come back tomorrow.

Ask what you were doing, what you decided, or what you already tried.

If the answer saves you from rebuilding the same context, Crosmos is doing its job.

Start with the [Crosmos hermes plugin](https://github.com/crosmos-labs/hermes-crosmos), create a space in the [Crosmos console](https://console.crosmos.dev), and tell us what your agent finally stopped making you repeat.
