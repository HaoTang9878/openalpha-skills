---
name: openalpha
version: "1.0.0"
description: "Quant strategy platform monitoring via OpenAlpha CLI. Account equity & today PnL on OKX/Binance, open positions, strategy deployments, official strategy market, factor library. Read-only by design: the API key cannot place orders or change anything — server-enforced. Use when: (1) OpenAlpha is mentioned (openalpha.top, 磐石/Panshi, OpenAlpha deployments), (2) the user asks to check their OpenAlpha accounts/positions/equity, (3) strategy market browsing, factor library lookups, deployment status checks, (4) scheduled portfolio monitoring / watchdog reporting. Do NOT activate for generic crypto education or trading on other platforms."
homepage: https://openalpha.top
metadata: { "version": "1.0.0" }
---

# OpenAlpha — your agent's read-only window into a quant strategy platform

<!-- Safety: this file is documentation only. No executable code. -->

OpenAlpha (openalpha.top) runs crypto cross-sectional quant strategies. Users
connect their own OKX/Binance accounts, deploy official or custom strategies,
and the platform's executor rebalances on their exchanges. This skill gives an
AI agent **read-only monitoring access**: equity, positions, deployments, the
strategy market and the factor library.

## READ-ONLY is enforced by the server, not by politeness

The API key this skill uses (`oa_...`, created in OpenAlpha web → 设置 → 安全 →
API Keys) is rejected by the backend for **every non-GET request**. Orders,
transfers, withdrawals, deployment start/stop and config changes are
impossible with it. Do not try to work around this, and never present the key
as if it could trade. If the user wants a trade or a deployment change, tell
them to do it in the OpenAlpha web UI.

## Post-install setup

On first activation, read `{baseDir}/setup.md` and follow its instructions.

## Prerequisites

- Node.js ≥ 18 (`node --version`)
- `OPENALPHA_API_KEY` env var (or exported in the user's shell profile)
- Network that can reach `openalpha.top` (mainland-China IPs get HTTP 451 —
  this is platform policy; do not attempt to circumvent it)

## Agent behavior

1. Match user intent → find the command in the table below.
2. **Read the linked reference doc** before first use of a command.
3. **Run the command yourself** (`node {baseDir}/bin/openalpha ...`) and read
   the output. Never ask the user to run commands for you.
4. Report: **Task** → **Actions** → **Result** → **Follow-ups**.
5. **Always show the real numbers from the output.** Never answer "done"
   without the data, and never invent or round away figures. A side that
   reports an `error` is unknown — report the error, never present it as $0.
6. Retry at most once on network/server errors, then stop and report.
   A command hanging > 30s times out on its own; do not loop.

## Analysis → action boundary

All commands here are read-only analysis. If the user, in the same message,
asks for something state-changing (deploy a strategy, stop a bot, place an
order), complete the read-only part, then point them to the OpenAlpha web UI
for the action. **Never simulate or fabricate a confirmation**, and never
claim an action was performed.

## Command reference

All commands: `node {baseDir}/bin/openalpha <command> [args] [--json]`.
Add `--json` for full machine-readable data.

### Account & funds

| Intent | Command | Reference |
|--------|---------|-----------|
| "who am I on OpenAlpha", "check my key works" | `whoami` | `{baseDir}/references/account.md` |
| "how much do I have", "today PnL", "check my equity" | `balance [--exchange okx\|binance] [--live]` | `{baseDir}/references/account.md` |
| "show my positions", "what am I holding" | `positions [--exchange X] [--live] [--symbol S]` | `{baseDir}/references/account.md` |

### Deployments & strategies

| Intent | Command | Reference |
|--------|---------|-----------|
| "my deployments", "is my strategy running" | `deployments` | `{baseDir}/references/deployments.md` |
| "deployment details", "what happened to dep X" | `deployment <id>` | `{baseDir}/references/deployments.md` |
| "browse the strategy market", "best strategies" | `strategies` | `{baseDir}/references/strategies.md` |
| "tell me about strategy X" | `strategy <id>` | `{baseDir}/references/strategies.md` |

### Factor library

| Intent | Command | Reference |
|--------|---------|-----------|
| "list factors", "find a momentum factor" | `factors [query]` | `{baseDir}/references/factors.md` |

## Suggested flows

- **Morning watchdog**: `balance` (live, both exchanges) → `positions` →
  `deployments` → summarize equity change and anything offline.
- **Deployment health check**: `deployments` → for each non-running entry
  `deployment <id>` → report status + events from the JSON.
- **Strategy research**: `strategies` → pick by metrics → `strategy <id>`
  for the full profile.

## UX rules

- **Always show results** — prices, balances, statuses, verbatim from output.
- **Live vs demo is explicit.** `positions`/`balance` default to demo unless
  `--live`; always state which side you are reporting.
- **Follow-ups.** After a task, suggest 1–2 concrete next commands
  (e.g. "check positions too?" or "watch deployment X?").
- The user's funds live on their own OKX/Binance accounts; OpenAlpha is the
  strategy layer. Keep that distinction when summarizing.

## Credentials

- `OPENALPHA_API_KEY` — create in OpenAlpha web → 设置 → 安全 → API Keys.
  The full key is shown **once** at creation.
- `OPENALPHA_BASE_URL` — optional override (default `https://openalpha.top`).
- Keys are revocable any time in the same settings page; revocation is
  instant on the server.

## Examples

See `{baseDir}/references/examples.md`.
