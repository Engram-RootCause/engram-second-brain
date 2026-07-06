#!/usr/bin/env node
// engram-setup — one-command onboarding for Engram (https://engram.rootcause.ro).
//
// This is client-side GLUE only. It creates NOTHING secret and talks to NO private API: it opens your
// browser to sign in, asks which assistant you use, and prints the exact connector config for it. Your
// per-account connector key is minted in the Engram console (Settings) and pasted in by YOU — it never
// touches this script or this repository. The Engram service (retrieval engine, hosted server, skills)
// is a separate product and is not part of this open-source tool.
import { createInterface } from "node:readline/promises";
import { stdin, stdout, platform } from "node:process";
import { spawn } from "node:child_process";

const SITE = "https://engram.rootcause.ro";
const LOGIN = `${SITE}/login`;
const CONSOLE = `${SITE}/app`;
const MCP_FULL = `${SITE}/mcp`; // Claude clients — full tool set
const MCP_LITE = `${SITE}/mcp/lite`; // ChatGPT / Codex / Antigravity — trimmed tool set (fits ChatGPT's limit)

// ---- tiny ANSI + prompt helpers (zero dependencies, so `npx` is instant) ----
const c = { b: "\x1b[1m", dim: "\x1b[2m", grn: "\x1b[32m", cyn: "\x1b[36m", ylw: "\x1b[33m", r: "\x1b[0m" };
const log = (s = "") => stdout.write(s + "\n");
const rl = createInterface({ input: stdin, output: stdout });
const ask = (q) => rl.question(`${c.cyn}?${c.r} ${q} `);

function openBrowser(url) {
  const cmd = platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  try { spawn(cmd, args, { stdio: "ignore", detached: true }).unref(); } catch { /* fall through to printing the URL */ }
}

const ASSISTANTS = [
  {
    id: "claude-desktop", name: "Claude Desktop app (Cowork)", local: true,
    steps: () => [
      `In Claude Desktop: ${c.b}Settings → Connectors → Add custom connector${c.r}.`,
      `Name: ${c.b}Engram${c.r}`,
      `Remote MCP server URL: ${c.grn}${MCP_FULL}${c.r}`,
      `OAuth Client ID / Secret: ${c.dim}leave empty${c.r}`,
      `Click ${c.b}Add${c.r} → ${c.b}Connect${c.r} and approve the sign-in.`,
    ],
  },
  {
    id: "claude-code", name: "Claude Code (CLI)", local: true, needsKey: true,
    steps: (key) => [
      `Run this in your project (your connector key rides in the URL):`,
      `  ${c.grn}claude mcp add --transport http engram-v2 ${MCP_FULL}/${key || "<YOUR-KEY>"}${c.r}`,
    ],
  },
  {
    id: "chatgpt", name: "ChatGPT (paid plan — Plus/Pro/Business/Enterprise/Edu)", local: false,
    steps: () => [
      `${c.ylw}Cloud-Hosted only${c.r} — ChatGPT can't write files to your device.`,
      `Turn on ${c.b}Settings → Apps → Advanced → Developer mode${c.r} (an admin may need to enable it).`,
      `${c.b}Settings → Apps → Create app${c.r} for a remote MCP server:`,
      `  Name: ${c.b}Engram${c.r}`,
      `  MCP server URL: ${c.grn}${MCP_LITE}${c.r}`,
      `  Authentication: ${c.b}OAuth${c.r}`,
      `Click ${c.b}Create${c.r} — Engram appears in the composer's Developer-Mode tools.`,
    ],
  },
  {
    id: "codex", name: "Codex (OpenAI CLI / IDE)", local: true, needsKey: true,
    steps: (key) => [
      `Add this to ${c.b}~/.codex/config.toml${c.r}:`,
      `  ${c.grn}[mcp_servers.engram]${c.r}`,
      `  ${c.grn}url = "${MCP_LITE}"${c.r}`,
      `  ${c.grn}http_headers = { Authorization = "Bearer ${key || "<YOUR-KEY>"}" }${c.r}`,
    ],
  },
  {
    id: "antigravity", name: "Antigravity (Google — desktop + CLI)", local: true, needsKey: true,
    steps: (key) => [
      `Add Engram to Antigravity's MCP settings (${c.b}settings.json${c.r}):`,
      `  ${c.grn}{ "mcpServers": { "engram": { "httpUrl": "${MCP_LITE}",`,
      `      "headers": { "Authorization": "Bearer ${key || "<YOUR-KEY>"}" } } } }${c.r}`,
    ],
  },
];

async function main() {
  log(`\n${c.b}🧠 Engram — connect your second brain${c.r}`);
  log(`${c.dim}The memory & skills layer for your AI assistant. This sets up the connection.${c.r}\n`);

  // 1. account
  log(`${c.b}Step 1 — your Engram account${c.r}`);
  log(`Opening ${c.cyn}${LOGIN}${c.r} — sign in with Google or an email code (free, no card).`);
  openBrowser(LOGIN);
  await ask(`Signed in? Press ${c.b}Enter${c.r} to continue…`);

  // 2. pick assistant
  log(`\n${c.b}Step 2 — which assistant are you connecting?${c.r}`);
  ASSISTANTS.forEach((a, i) => log(`  ${c.b}${i + 1}${c.r}. ${a.name}`));
  let pick;
  while (!pick) {
    const n = Number((await ask(`Enter a number (1–${ASSISTANTS.length}):`)).trim());
    pick = ASSISTANTS[n - 1];
    if (!pick) log(`${c.ylw}Please enter 1–${ASSISTANTS.length}.${c.r}`);
  }

  // 3. key if needed
  let key = "";
  if (pick.needsKey) {
    log(`\n${pick.name} needs your ${c.b}connector key${c.r}. Find it in the console: ${c.cyn}${CONSOLE}${c.r} → Settings → Connect your AI.`);
    key = (await ask(`Paste your connector key (or press Enter to use a <YOUR-KEY> placeholder):`)).trim();
  }

  // 4. print config
  log(`\n${c.b}Step 3 — add the connector${c.r}`);
  for (const line of pick.steps(key)) log(`  ${line}`);

  // 5. build prompt
  log(`\n${c.b}Step 4 — build your brain${c.r}`);
  log(`Open a ${c.b}new session${c.r} in ${pick.name} and paste the ${c.b}build prompt${c.r}.`);
  log(`Grab the current build prompt from the console's ${c.b}Connect your AI${c.r} screen (the “Copy prompt” button),`);
  log(`or read it here: ${c.cyn}docs/build-prompt.md${c.r} in this repo.`);
  const open = (await ask(`Open the console now to copy it? (y/N):`)).trim().toLowerCase();
  if (open === "y" || open === "yes") openBrowser(CONSOLE);

  log(`\n${c.grn}✓ Done.${c.r} Your brain persists in Engram across sessions.`);
  log(`${c.dim}Docs: ${SITE} · Open brain format: docs/BRAIN-FORMAT.md · Issues: engram@rootcause.ro${c.r}\n`);
  rl.close();
}

main().catch((err) => { log(`\n${c.ylw}Setup stopped: ${err?.message ?? err}${c.r}`); rl.close(); process.exit(1); });
