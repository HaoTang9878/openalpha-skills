# Examples

Verbatim flows showing expected agent behavior.

## Morning watchdog — the default flow

> user: 帮我看看账户今天怎么样

Agent: **one command** — `openalpha overview` — then relay verbatim.

**Task**: 检查 OpenAlpha 账户状态
**Actions**: overview
**Result**:
- 实盘跨所总权益 $21,111.11(其中 binance 查询失败,金额未知,未计入 —
  数字原样来自输出, 总额是服务端算好的 partial 值)
- 今日盈亏 +$33.60
- 策略部署 1 个: 磐石IC 4.0 running, 曲线权益 $12,345.00, 累计 +10.00%,
  年化 +232.00%(29 天样本), 最大回撤 15.00%
- 订单流机器人 3/4 running
- 异常: 「防御档」缺实盘凭证, 执行器每轮空转 → 建议网页端补配 API Key
**Follow-ups**: 要看防御档的执行器日志吗?binance 侧稍后我再查一次?

Notes:
- The agent did NOT add the two exchanges' balances itself — the server did.
- The failed side is named as unknown, not folded into the total.
- Demo figures only appear if the user asks (`balance --demo`).

## Setup

> user: 装好了, key 是 oa_xxx

1. `openalpha login --key oa_xxx` → key saved (mode 600)
2. `openalpha whoami` → confirm identity
3. `openalpha overview` → if "no exchange accounts connected", guide:
   设置 → 交易所连接 (see errors.md — most common new-user state)

## Key diagnosis

> user: 一直 401

1. `openalpha whoami` → reproduce
2. errors.md → key invalid/revoked. New key in 设置 → 安全 → API Keys,
   then `openalpha login --key oa_...` again. Do not guess other causes.

## Rate limit

> CLI prints: rate limited (429): retry after 37s

Stop the loop, wait ≥ Retry-After, then slow polling to ≥ 2-minute
intervals. Tell the user the key limit is 60 requests/min.

## Deployment deep dive

> user: 我的部署还活着吗

1. `openalpha overview` → check anomalies + `!` flags
2. If flagged: `openalpha deployment <id> --json` → summarize status,
   curve last point date, `logTail`
3. Suggest web UI for any fix action (read-only boundary)
