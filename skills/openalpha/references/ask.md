# AI Q&A — `ask "question"` (scope: ask)

> Execute commands yourself. Billed per token from the user's platform wallet
> (same wallet as the OpenAlpha web AI). All read-only analysis — no orders,
> no config changes, no trades, ever.

## What it is

`ask` sends the question to the OpenAlpha platform AI **with the user's live
account context already attached server-side** (cross-exchange totals,
deployment metrics, anomalies). The answer quotes real numbers from that
context; you do not need to assemble any data yourself.

```
$ openalpha ask "我的部署还健康吗"
你的部署「磐石IC 4.0」运行正常, 曲线权益 $12,345.00, 累计 +10.00%…
--- tokens 1187 · charged $0.0024 · balance $4.9976
```

Always relay the answer **plus** the billing footer line (users care about
spend). `--json` returns `{answer, tokens, chargedUsd, balance}`.

## When to use ask vs answering yourself

- **Use `ask`** when the question needs judgment/analysis ("健康吗", "该担心吗",
  "帮我解读") or platform knowledge (strategy details, factor semantics).
- **Answer yourself from command output** when it's pure data lookup
  ("多少余额", "哪些部署在跑") — that's free and exact.

## Cost discipline

- Default price ~$0.002/1k tokens (env-tunable server-side). One question is
  typically well under $0.01 — still, don't loop `ask` in watchdogs; poll
  `overview` (free) and `ask` only when something needs interpretation.
- 402 `AGENT_ASK_NO_BALANCE` → tell the user to top up at OpenAlpha web →
  钱包. Do not retry.
- 502 `AGENT_ASK_LLM_DOWN` → platform AI temporarily down; report, don't loop.

## Boundary

`ask` never executes anything. If the user asks it to "stop my deployment",
that's a `deploy` action (see deploy.md) — and it still needs the key's
`deploy` scope plus the two-message confirmation.
