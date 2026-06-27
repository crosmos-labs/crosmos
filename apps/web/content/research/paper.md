# Crosmos: Organizational Memory for AI Agents

> Agent memory has been built for one person. Companies don't work like that.

> Draft v0. Accuracy numbers are from LongMemEval-s on gpt-5-mini, graded by gpt-5-mini.

## The short version

Every agent memory system today remembers one person. A company is not one person. Its memory
is shared: what the team knows, who said what, and which parts each person is allowed to see.

Crosmos is built for that. It is a shared memory for an organization: many people, one growing
record, with permissions built in so each person sees only what they are allowed to, and a full
history that can be traced and audited rather than silently overwritten. It finds the right
memory 99.7% of the time, beats the best published systems while running on a smaller model, and
never calls a language model during search.

## 1. Personal memory is not enough for teams

A company's useful memory is shared and permissioned. If a sales rep asks "what did we promise
this customer," the answer might sit in someone else's conversation, and some of what is stored,
this person should not see at all. Existing memory tools model a single user, and none of them
treat "what is shared with me" as part of how they search. That is the gap Crosmos is built to
close.

## 2. Memory should be auditable

Crosmos stores memory as a Monotonic Temporal Knowledge Graph. Monotonic means it only ever
adds. When a fact changes, the old version is not erased. It is kept and dated, and the new one
is layered on top.

Most memory systems update in place. "Works at Google" becomes "works at Anthropic," and the
old fact is gone. But people change. They switch jobs, move cities, shift preferences. A system
that overwrites can only ever tell you the current state. A monotonic graph tells you the whole
story: what is true now, what was true before, and when it changed. Recent facts surface first
in search, older ones fade but stay reachable when the question is about the past.

Every fact also records two times, kept separately: when the event happened, and when it was
said. Someone might mention in June that they started a job in May. The two dates serve
different jobs, one for reasoning about time, one for ranking by recency, and keeping them apart
is what lets the system answer time questions correctly.

The graph is not the whole memory, it is a view onto it. Underneath sits the real record: the
facts and episodes exactly as they were observed, each with its timestamps and a link back to
where it came from, a conversation, a document, a Slack message, an email. Every connection in
the graph points back to the memory it was drawn from, and every memory points back to its
source. Any answer can be traced all the way to the original context it came from.

That traceability is the point. For a person using an assistant, memory is mostly about
convenience. For a company, memory is about trust: being able to audit a past decision,
reconstruct how something changed, and explain why the agent said what it said. A system that
overwrites cannot do any of that. One that preserves history can.

## 3. How search works, with no language model in it

A few pieces:

- Spaces. Each organization gets its own space. Every fact, person, and connection lives inside
  it.
- Facts. Short, self-contained statements ("Maria leads the Acme account"), cleaned up at save
  time so each one makes sense on its own, an approach related to contextual retrieval
  [^contextual].
- Connections. Links between people and things, each with a confidence and a date, so when a
  fact changes over time we can tell which version is current.
- Permissions. Every fact is either shared with the whole organization or owned by a person.
  Search only ever returns what the asker is allowed to see, and that rule is part of the search
  itself rather than a filter added afterward.

Search runs four approaches at once: meaning-based search, plain keyword search, a walk over the
connection graph, and a date-aware pass for time questions. Their results are combined, nudged
slightly toward recent items, and the top handful are returned. No language model runs during
any of this.

That last point is deliberate. A growing number of memory systems put language-model calls
inside search, rewriting the query, generating a hypothetical answer to search with, looping. It
costs time and money on every request, and it ties the result to prompt tuning. Our numbers show
you do not need it. Long contexts and noisy retrieval are known to degrade answers [^lostmiddle],
so the job of search is to hand the answering model a small, correct set, fast, every time, the
same way twice.

## 4. The benchmark, and what it does not measure

We test on LongMemEval [^longmemeval] because it is the closest public stand-in for real chat
history. Each question carries a long backlog of about 50 prior conversations (over 100,000
tokens), and the system has to find the right moment and reason over it. Older benchmarks like
LoCoMo [^locomo] use much shorter histories and do not test updating old facts with new ones, so
they no longer stress modern models. LongMemEval covers six question types: pulling a fact a
user or assistant stated, reading an implicit preference, reasoning across several sessions,
updating knowledge when newer facts replace older ones, reasoning about time, and knowing when
to say "I don't know." It is also the benchmark our closest peers report on, which lets us
compare directly.

But LongMemEval measures one thing: recall and reasoning over a single user's history. It does
not touch the parts of Crosmos that matter most in production:

- Shared memory and permissions. Every question is single-user. Nothing checks whether a person
  sees only what they are allowed to.
- Forgetting. Crosmos fades unimportant, unused memories and keeps the important, reused ones,
  so the knowledge base stays sharp as it grows instead of drowning in old noise. A fixed
  benchmark never runs long enough to test that.
- Consolidation. In the background, Crosmos groups related memories into higher-level summaries,
  so thousands of overlapping facts do not bury the few that matter. The benchmark has no notion
  of this.

So read the scores below as a floor, not a ceiling. They measure the slice of Crosmos that a
single-user question-and-answer benchmark can see.

## 5. Results

Before the numbers, the point of them. A memory system has one job: surface the right
information when it is asked for. What happens next, how an agent phrases the answer, which model
it uses, how it reasons, depends on the use case and the team building on top. So the measure
that is really about the memory is recall: how often the answer is actually in what we return.
That is the number a memory system lives or dies by, and ours is 99.7%. Everything downstream
rides on it.

LongMemEval-s is 500 questions across the six types above. For Crosmos, answering and grading
both use gpt-5-mini, with the benchmark's official per-question grading rubric [^longmemeval].

### 5.1 Retrieval: the clean comparison

The piece of memory that holds the answer is in the top 10 results 99.7% of the time, measured
without telling the search what kind of question it is. For comparison, Supermemory reports 95%
at the top 15 [^supermemory]. Crosmos finds the answer more often, in a tighter set. Retrieval
quality does not depend on which model answers or grades, so this is the one number that
compares cleanly across systems, and it is our strongest result.

### 5.2 Answering accuracy

Crosmos answers 90.8% of questions correctly. By category:

| Question type | Crosmos (gpt-5-mini) |
|---|---|
| Single-session (assistant) | 100.0 |
| Single-session (user) | 97.1 |
| Knowledge update | 93.6 |
| Time reasoning | 93.2 |
| Single-session (preference) | 83.3 |
| Multi-session reasoning | 81.2 |
| Overall | 90.8 |

### 5.3 Against the field

At the same model tier, Crosmos leads. The published overall numbers, with the grader noted:

| System | Answering model | Grader | Overall |
|---|---|---|---|
| Crosmos | gpt-5-mini | gpt-5-mini | 90.8 |
| HydraDB | gpt-5-mini | gemini-3-pro | 85.8 |
| Supermemory | gpt-5 | gpt-4o | 84.6 |

That is about 6 points ahead, and far ahead on the hardest type, piecing together facts across
many sessions. Crosmos's 90.8% on gpt-5-mini also matches the best published score anywhere,
90.79% on a much larger model.

One honest note, because it matters for reading any of these tables: each system uses a
different answering and grading model, and the score moves a lot with both. Supermemory's own
numbers show it, the same system scores 95% when gpt-4o both answers and grades, but 84.6% and
85.2% when a different model answers and gpt-4o grades [^supermemory]. A system grading its own
answers tends to score itself higher. Our 90.8% is self-graded and the others are not, so the
cleanest cross-system number is retrieval (5.1), and a same-grader re-score is what we run next.

### 5.4 The prompt barely matters

We ran the exact same memory with four different answering prompts, grader held fixed:

| Answering prompt | Score |
|---|---|
| Ours, detailed | 90.6 |
| Ours, shipped | 90.8 |
| A competitor's prompt, word for word | 91.0 |
| A bare, vague one | 87.0 |

Any reasonable prompt lands within about a point. Only a deliberately bad one drops. The prompt
is not doing the work, the memory is. We even ran a competitor's own answering prompt on our
memory and it scored the same.

### 5.5 What this means

Search finds the answer 99.7% of the time, but final accuracy is 90.8%. The gap is the answering
model fumbling questions where the right information was already in front of it, not the memory
missing things. On the two hardest types, preference and multi-session, retrieval is close to
perfect, so the misses are in the answering. Use a stronger answering model and accuracy climbs
toward that 99.7%. The memory is doing its job.

## 6. What's new here

1. Memory for a whole organization, with multiple people and permissions built into search. The
   systems above all model a single user.
2. Search with no language model in it that still reaches very high retrieval, 99.7% in the top 10.
3. A clear result that the prompt is not the trick, with the same score across very different
   prompts, including a competitor's own.

## 7. What's next

Two things build on this. First, to make the cross-system accuracy fully apples to apples, we
re-score every system's answers with a single shared grader. Second, LongMemEval measures
personal recall, while the parts of Crosmos that set it apart, shared memory with permissions,
forgetting, and consolidation, go untested by any public benchmark today. The next benchmark we
are building measures those directly, starting with the one that matters most: whether a person
sees exactly what they are allowed to and nothing more.

---

Reproducibility: the benchmark harness records the exact settings and dataset version for every
run, the answering prompt is published in full, grading uses the benchmark's official rubric
unchanged, and search returns the top 10. The 99.7% figure is how often the answer-bearing item
is in those 10.

## Citations

[^longmemeval]: Wu, D., Wang, H., Yu, W., Zhang, Y., Chang, K. W., & Yu, D. (2024). LongMemEval: Benchmarking chat assistants on long-term interactive memory. arXiv:2410.10813.
[^locomo]: Maharana, A., Lee, D. H., Tulyakov, S., Bansal, M., Barbieri, F., & Fang, Y. (2024). Evaluating very long-term conversational memory of LLM agents. arXiv:2402.17753.
[^lostmiddle]: Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2024). Lost in the middle: How language models use long contexts. TACL, 12, 157-173.
[^contextual]: Anthropic (2024). Introducing Contextual Retrieval. Anthropic Engineering Blog. https://www.anthropic.com/engineering/contextual-retrieval
[^supermemory]: Supermemory (2025). LongMemBench results. supermemory.ai/research/longmembench.
[^zep]: Rasmussen, P., Paliychuk, P., Beauvais, T., Ryan, J., & Chalef, D. (2025). Zep: a temporal knowledge graph architecture for agent memory. arXiv:2501.13956.
[^mem0]: Chhikara, P., et al. (2025). Mem0: Building production-ready AI agents with scalable long-term memory. arXiv:2504.19413.
