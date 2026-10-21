---
name: openalpha
version: "1.1.0"
description: "Quant strategy platform monitoring via OpenAlpha CLI. ONE command `overview` answers: cross-exchange account equity, today PnL, strategy deployment performance (real executor equity curves), anomalies. Plus per-exchange balances, open positions, deployments, strategy market, factor library. Read-only by design: the API key cannot place orders or change anything — server-enforced. Use when: (1) OpenAlpha is mentioned (openalpha.top, 磐石/Panshi), (2) the user asks to check their quant/trading account, equity, positions, or strategy deployments — including generic phrasings like 'how is my account doing', '查账户', '盯盘', 'today PnL' — once this skill is installed, (3) browsing the strategy market or factor library, (4) scheduled portfolio monitoring / watchdog reporting. Do NOT activate for generic crypto education or trading on other platforms."
homepage: https://openalpha.top
metadata: { "version": "1.1.0" }
---

# OpenAlpha — your agent's read-only window into a quant strategy platform

<!-- Safety: this file is documentation only. No executable code. -->

OpenAlpha (openalpha.top) runs crypto cross-sectional quant strategies. Users
connect their own OKX/Binance accounts, deploy official or custom strategies,
and the platform's executor rebalances on their exchanges. This skill gives an
AI agent **read-only monitoring access**: equity, positions, deployments, the
strategy market and the factor library.

## READ-ONLY is enforced by the server, not by politeness

The API key this skill uses (`oa_...`) is rejected by the backend for **every
non-GET request**. Orders, transfers, withdrawals, deployment start/stop and
config changes are impossible with it. Scoped/tiered write access is on the
roadmap; until then, point users to the OpenAlpha web UI for any action.
Never simulate or fabricate a confirmation, and never claim an action was
performed.

## Post-install setup

On first activation, read `{baseDir}/setup.md` and follow its instructions —
the recommended flow is `openalpha login --key oa_...` (no shell-profile
editing needed).

## Prerequisites

- Node.js ≥ 18 (`node --version`)
- A key from OpenAlpha web → 设置 → 安全 → API Keys (via `login --key` or
  `OPENALPHA_API_KEY` env)
- Network that can reach `openalpha.top` (mainland-China IPs get HTTP 451 —
  platform policy; do not attempt to circumvent it)

## Agent behavior

1. Match user intent → find the command in the table below.
2. **Read the linked reference doc** before first use of a command; on any
   error, read `{baseDir}/references/errors.md` — do not invent causes.
3. **Run the command yourself** (`node {baseDir}/bin/openalpha ...`) and read
   the output. Never ask the user to run commands for you.
4. Report: **Task** → **Actions** → **Result** → **Follow-ups**.
5. **Always show the real numbers from the output.** Never answer "done"
   without data, never invent or round away figures. An errored side is
   UNKNOWN — say so, never present it as $0. `—` means insufficient sample,
   not zero.
6. **Never do arithmetic on money yourself.** Use `overview` — all
   cross-exchange totals are computed server-side. Adding balances in your
   head is how numbers get fabricated.
7. Retry at most once on network/server errors, then stop and report.
   Never retry 4xx (429 → wait the `Retry-After` seconds).

## Live vs demo — say which side you are reporting

`balance` and `positions` **default to the LIVE account**. `--demo` switches
to the demo account, `--both` (balance) shows both. Always state the side in
your report ("实盘"/"模拟盘") — a demo number reported as live is a serious
mistake.

## Command reference

All commands: `node {baseDir}/bin/openalpha <command> [args] [--json]`.

### Account & setup

| Intent | Command | Reference |
|--------|---------|-----------|
| "check my key works", "who am I" | `whoami` | `{baseDir}/references/account.md` |
| "how is my account doing" — **START HERE** | `overview` | `{baseDir}/references/overview.md` |
| "my equity on X", "today PnL on binance" | `balance [--exchange okx\|binance] [--demo\|--both]` | `{baseDir}/references/account.md` |
| "show my positions" | `positions [--exchange X] [--demo] [--symbol S]` | `{baseDir}/references/account.md` |

### Deployments, bots, strategies, factors

| Intent | Command | Reference |
|--------|---------|-----------|
| "is my strategy running", "deployment health" | `deployments` | `{baseDir}/references/deployments.md` |
| "deployment X details / events" | `deployment <id>` | `{baseDir}/references/deployments.md` |
| "my orderflow bots" | `bots` | `{baseDir}/references/deployments.md` |
| "browse strategy market" | `strategies` | `{baseDir}/references/strategies.md` |
| "strategy X profile" | `strategy <id>` | `{baseDir}/references/strategies.md` |
| "find a momentum factor" | `factors [query]` | `{baseDir}/references/strategies.md` |

### Errors

Every failure mode and the exact user-facing wording:
`{baseDir}/references/errors.md`.

## Suggested flows

- **Morning watchdog / "how am I doing"**: `overview` alone. It contains
  cross-exchange equity + today PnL + deployment metrics + anomalies.
- **Deep dive on an anomaly**: `overview` → `deployment <id>` for the flagged
  one → summarize events from JSON.
- **Watchdog loops**: poll `overview` at ≥ 2-minute intervals (rate limit is
  60 req/min per key; don't burn it on 30s loops).

## UX rules

- **Always show results** — verbatim numbers from output.
- **Side is explicit** (live/demo) in every report.
- **Follow-ups.** After a task, suggest 1–2 concrete next commands.
- The user's funds live on their own OKX/Binance accounts; OpenAlpha is the
  strategy layer. Keep that distinction when summarizing.

## Credentials

- Preferred: `openalpha login --key oa_...` → `~/.openalpha/config.json`
  (mode 600). Env `OPENALPHA_API_KEY` overrides the config file.
- `openalpha status` shows where the key comes from; `logout` removes it.
- Keys are revocable any time in the web UI; revocation is instant.

## Examples

See `{baseDir}/references/examples.md`.
