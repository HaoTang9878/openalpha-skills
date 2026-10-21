# Error dictionary — what each failure means and what to tell the user

The CLI appends a hint to most errors. This page is the full dictionary:
read it before inventing an explanation. **Never guess a cause that is not
listed here**, and never silently retry a 4xx.

## HTTP statuses

| Status | Meaning | Agent should say / do |
|--------|---------|----------------------|
| 400 with `未配置 API Key` | The user has NOT connected an exchange account (or not for that side). This is the **most common state for new users** — it is not a bug and not a key problem. | "你还没在 OpenAlpha 连接交易所账户 — 网页端 → 设置 → 交易所连接 配置 OKX/币安 API Key 后再来查。" Do not retry. |
| 401 | Key invalid or revoked (or user disabled/deleted). | Ask the user to create a new key (设置 → 安全 → API Keys) and `openalpha login --key oa_...` again. Do not retry. |
| 403 | Server-enforced read-only wall (non-GET attempt), or key-managing-key. | Explain the boundary; state-changing actions go to the web UI. Never retry with different methods to work around. |
| 429 | Rate limit: **60 requests/min per key**. Response carries `Retry-After`. | Stop, wait the given seconds, then slow the polling loop (e.g. ≥ 2 min interval for watch tasks). |
| 451 | Mainland-China IP blocked by platform policy. | "当前网络被平台地区策略拦截(451)。换一个能访问 openalpha.top 的网络环境。" Do NOT attempt proxies or circumvention — that violates platform policy. |
| 5xx | Platform-side error (CLI retries once automatically). | Report as platform error; suggest trying again later. |

## Data-level states (NOT errors)

| State | Where | Meaning |
|-------|-------|---------|
| `error` field on a balance side | `balance`, `overview` | That side's equity is **UNKNOWN** — exchange query failed. Never present as $0, never sum it. `overview` lists these in `unknownSides` and marks `partial: true`. |
| `needsConfig: true` | `balance` | No credentials configured for that side — nothing to query. Guide to 设置 → 交易所连接. |
| `stale` on positions | `positions` | Served from snapshot cache, not live exchange call. Mention when the user asks about "right now". |
| metric `—` / `null` (annualized, maxDD) | `overview`, `deployments` | Sample insufficient (<2 points or <7 days). **Honest absence, not zero.** Say "样本不足" not "0%". |
| `!` after a deployment status | `overview`, `deployments` | Marked running but executor process is not alive — surface it as an anomaly. |
| empty output ("no open positions" etc.) | anywhere | Genuinely empty. State it plainly; do not pad with assumptions. |

## Command-level

- `login` without `--key oa_...` → usage error; key must start with `oa_`.
- `status` exit code 2 = no key configured at all (neither env nor config).
- Unknown command → help text + exit 1.

## Retry discipline

Max 1 automatic retry, network/5xx only. 4xx (including 429) is never
retried automatically. After two failures, stop and report — do not loop.
