# 🧠 Engram — a Second Brain for your AI assistant

**Engram is the persistent memory & skills layer for whatever AI you use** — Claude, ChatGPT, Codex, or Antigravity. Your assistant forgets everything the moment a chat ends. Engram doesn't: it builds a private, structured brain from your world and hands the right piece back, in any session, from any assistant.

> Your continuity lives in **your brain**, not in the assistant. Switch assistants; the brain stays.

**→ Try it: [engram.rootcause.ro](https://engram.rootcause.ro)** · free to use.

---

## Quick start

One command sets up the connection to your assistant:

```bash
npx github:Engram-RootCause/engram-second-brain
```

It opens your browser to create a free account, asks which assistant you use, and prints the exact connector config for it. That's it — then paste the build prompt into a new session and your brain starts filling in.

*(Prefer to do it by hand? Everything the CLI prints is also in the console under **Connect your AI**.)*

---

## What Engram gives you

- **Memory that survives sessions.** One brain, read and written by every conversation — so your assistant stops asking you to re-explain yesterday.
- **Depth, not a dumped transcript.** Typed entities (people, projects, decisions, topics), linked into a graph, each with its sources — recalled by meaning, not keyword.
- **It knows what's current.** Superseded facts keep a validity window (*“what did we believe in March?”* is answerable), and stale items rank below fresh ones automatically.
- **Skills you call by name.** *“brief me”* (Echo), *“red-team this”* (Quality Gate), *“will this land?”* (Diplomat), and more — each reads your brain to adapt to you.
- **Works across assistants.** Claude (full), and — in beta — ChatGPT (paid), Codex, and Antigravity, over the open [Model Context Protocol](https://modelcontextprotocol.io).

See it live and read the deeper story at **[engram.rootcause.ro](https://engram.rootcause.ro)**.

---

## Two ways to store a brain

| Mode | Where your memories live | Who it's for |
|---|---|---|
| **Cloud Hosted** | Your private, isolated space on Engram's servers | Any assistant, anywhere (the only option where the assistant can't write local files, e.g. ChatGPT) |
| **Locally stored** | A database on **your own device** — only the anonymized *shape* ever reaches the cloud | Assistants that can write files (Claude Desktop, Claude Code, Codex, Antigravity) |

A Locally-stored brain is a plain, **open, inspectable** SQLite file — see **[docs/BRAIN-FORMAT.md](docs/BRAIN-FORMAT.md)**. Your data is yours: export or delete it any time.

---

## What's in this repo (and what isn't)

**This repo is open (MIT).** It's the *front door*:

- [`bin/engram-setup.mjs`](bin/engram-setup.mjs) — the zero-dependency onboarding CLI. Pure client-side glue; holds no secrets and calls no private API.
- [`docs/BRAIN-FORMAT.md`](docs/BRAIN-FORMAT.md) — the open on-disk brain format (so you can trust, inspect, and port your local brain).
- [`docs/build-prompt.md`](docs/build-prompt.md) — the activation prompt, for reference.

**The Engram *service* is the product and is not open-source:** the retrieval engine, the hosted multi-tenant server, embeddings, and the skill logic live in a private repository. This split is deliberate — the tooling and your data format are open; the engine that makes it smart is the service you connect to.

---

## Links

- **Product & console:** [engram.rootcause.ro](https://engram.rootcause.ro)
- **Security & your data:** [engram.rootcause.ro/security.html](https://engram.rootcause.ro/security.html)
- **Terms:** [engram.rootcause.ro/terms.html](https://engram.rootcause.ro/terms.html)
- **Something break? Tell us:** engram@rootcause.ro

## License

MIT © ROOTCAUSE S.R.L. — see [LICENSE](LICENSE). Applies to the contents of this repository (the onboarding CLI and docs), not to the Engram service.
