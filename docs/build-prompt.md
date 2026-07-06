# The build prompt

After you've added the Engram connector to your assistant, open a **new session** and paste this to
build your brain. The console's **Connect your AI** screen always has the latest version (a “Copy
prompt” button) — this copy is here for reference.

> Sources differ by assistant. Where you have live connectors (Slack, Gmail, Drive…), Engram builds
> from them. On ChatGPT, which can only read the current conversation, it builds *forward* from what
> you type — your continuity is the Engram brain, not the assistant.

```text
Set up a brain in Engram — do the FULL build, not a stub. Use the Engram connector and run its activate runbook end to end:

1. First call whoami and brain_list. If a brain already exists, ask me whether to build a NEW brain or extend an existing one — then proceed with that brain.
2. DISCOVER my sources — sources differ by host, so check what THIS assistant can actually do; don't promise what it can't. TIER 1 = external connectors you genuinely have loaded right now (Slack, Gmail, Drive, Confluence, calendar, tickets, recordings…) — list the ones you REALLY have, don't guess names. TIER 2 = the live conversation, going forward: if you have no external source tools (ChatGPT), you can read ONLY what I type in this conversation from now on — you CANNOT read my past chats, other threads, or ChatGPT's own memory. So build the brain forward from what I tell you here; that's the permanent mode on this host, not a fallback. TIER 3 = I paste key material. Tell me up front which applies.
3. Storage mode for THIS brain: if you (the assistant) can't write files to my device (e.g. ChatGPT), it MUST be Cloud Hosted — don't offer local, just tell me. If you CAN write files (Claude Desktop, Claude Code, Codex, Antigravity), confirm Cloud Hosted vs Locally stored. Also confirm (for Tier 1) how far back to read, and REQUIRED: what's private / off-limits (channels, labels, folders, people, topics) — a hard filter.
4. If Locally stored: ask me WHERE to store it, and connect that folder to the session so you can write to it. Then build brain.sqlite + engram.json there yourself per local_brain_spec.
5. Connect each in-scope source with source_connect (kind = its real name for Tier 1, 'conversation' for Tier 2, or 'manual' for pasted). Tier 1: run surface_scan and read each source with its OWN tools, NEWEST-FIRST. Tier 2: capture forward from THIS conversation, memory_upsert-ing entities as I talk. Write one memory per person, project, decision and topic, each with internal [[links]] AND its source pointer stamped by TIER (Tier 1 = real URL; Tier 2 = session://<host>/<date-or-turn>; Tier 3 = manual://pasted) — porting verbatim quotes + dates. Record progress with activation_stage.
6. Do NOT tell me the brain is 'set up' or 'live' until activation_status returns readiness.ok = true. If any step is refused, follow the doThisNext steps it returns and keep going.
7. Stand up the daily run (reuse the existing scheduled task if there is one) WITH my timezone, then report activated and show me a short summary of what was built.
```
