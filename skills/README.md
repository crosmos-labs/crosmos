# Crosmos Agent Skills

Agent skills for the [Crosmos](https://github.com/crosmos-labs/crosmos) memory engine. These skills give AI agents persistent memory with full temporal history, entity-relationship tracking, and hybrid retrieval.

## Available Skills

### crosmos

Crosmos Memory is a Monotonic Temporal Knowledge Graph (MTKG) for AI agents. Use this skill when building applications that need persistent memory with full temporal history, entity-relationship tracking, or hybrid retrieval (semantic + keyword + graph).

**Triggers:** Storing or retrieving user memories, tracking entity relationships, searching knowledge graphs, managing memory spaces.

## Install

```bash
npx skills add crosmos-labs/crosmos
```

Install globally:

```bash
npx skills add crosmos-labs/crosmos -g
```

Install a specific skill only:

```bash
npx skills add crosmos-labs/crosmos --skill crosmos
```

## Skill Structure

```
skills/
└── crosmos/
    └── SKILL.md
```

Each skill directory contains a `SKILL.md` with YAML frontmatter (`name`, `description`) and Markdown body covering MCP tools, API endpoints, data model, and usage patterns.

## Learn More

- [Crosmos Documentation](https://docs.crosmos.com)
- [skills.sh](https://skills.sh) — Browse more agent skills
