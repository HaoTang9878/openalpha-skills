# Overview — the one-shot account answer

`overview` is the DEFAULT first command for any "how is my account / 我的账户
怎么样" question. One call returns everything, with all cross-exchange
arithmetic done **server-side** (agents must never sum balances themselves).

```
$ openalpha overview
=== OpenAlpha overview  (2026-10-22T02:00:00.000Z) ===

[live equity]
  total across exchanges   $21,111.11
  today PnL                +$33.60
  ⚠ binance:live: query FAILED — amount unknown, NOT counted as 0

[strategy deployments]
name                 status     equity       return    annual    maxDD    days
磐石IC 4.0           running    $12,345.00   10.00%    232.00%   15.00%   29
  (! = marked running but executor process is not alive)

[orderflow bots]  3/4 running

[anomalies]
  ⚠ 策略部署「防御档」缺实盘凭证, 执行器每轮空转 —— 请到网页端补配 API Key
```

## Reading rules

- `total across exchanges` already sums only the sides that queried
  successfully. `partial` / `⚠ unknown` lines mean some side FAILED — report
  the total as partial and name the unknown side. Never add numbers yourself.
- `today PnL` is the same server-side sum. Its sign/percent formatting comes
  from the server; quote it as printed.
- Deployment rows come from the **executor's real equity curve** (not
  backtests): `equity` = latest point, `return` = last/first−1, `annual` =
  compounded (null when <7 days of samples — shown as `—`, meaning
  insufficient sample, NOT 0%), `maxDD` = peak-to-trough.
- `[anomalies]` are plain-language sentences produced by the server —
  relay them verbatim; each names the deployment and the fix direction.
  `none` means no stopped deployments, no missing credentials, no failed
  balance queries.

## `--json` contract (for programmatic use)

```
{ generatedAt, latencyMs,
  balances: [{exchange, live: BalanceSide|null, demo: BalanceSide|null}],
  totals: { liveUsd: number|null, liveTodayPnlUsd: number|null,
            partial: boolean, unknownSides: string[] },
  strategyDeployments: [{id,name,exchange,demo,pool,symbolCount,
    initialCapitalUsd,leverage,status,processAlive,credentialOk,createdAt,
    metrics: {latestEquityUsd,totalReturnPct,annualizedPct,
              maxDrawdownPct,days}}],
  bots: {total, running},
  anomalies: string[] }
```

`BalanceSide = {total, today_profit, profit_percent, latency, error?}` —
`error` present means unknown.

## Watchdog use

Poll at ≥ 2-minute intervals. Compare consecutive overviews (equity delta,
new anomalies) and report only changes plus the full picture once per day.
Respect 429 `Retry-After` if you hit the 60/min key limit.
