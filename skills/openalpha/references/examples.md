# Examples

Verbatim flows showing expected agent behavior.

## Morning watchdog

> user: 帮我看看 OpenAlpha 账户今天怎么样

Agent:

1. `openalpha balance --exchange okx` and `openalpha balance --exchange binance`
2. `openalpha positions --live --exchange okx` (and binance if configured)
3. `openalpha deployments`

Report (example):

**Task**: 检查 OpenAlpha 账户状态
**Actions**: balance(okx/binance) → positions(live) → deployments
**Result**:
- OKX live 权益 $12,345.67, 今日 +$45.67 (+0.37%); demo $10,000.00
- Binance live 权益 $8,765.43, 今日 -$12.00 (-0.14%)
- 实盘持仓 3 个: BTC 多 / ETH 多 / SOL 多(数字从输出原样引用)
- 部署 2 个均 running
**Follow-ups**: 要不要看 demo 账户?要不要盯某个部署的事件日志?

Note the balance-side demo figures included; if a side returned an error,
the report must show "查询失败(未知)" — never 0.

## Key diagnosis

> user: agent 一直报 401

1. `openalpha whoami` → reproduce the 401
2. Explain: key invalid/revoked → 设置 → 安全 → API Keys create a new one,
   `export OPENALPHA_API_KEY=...` again. Do not guess other causes.

## Deployment health check

> user: 我的部署还活着吗

1. `openalpha deployments`
2. For anything not `running`: `openalpha deployment <id> --json`
3. Summarize statuses + recent events; suggest web UI for restart (read-only
   boundary).
