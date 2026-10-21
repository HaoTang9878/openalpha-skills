# Deployments & bots

> Two product lines, two commands. All read-only.
> - `deployments` — **cross-sectional strategy deployments** (磐石-style):
>   the platform executor rebalances the user's exchange account daily
>   (UTC 0:00) toward the strategy's target portfolio.
> - `bots` — V40 **orderflow bots** (per-symbol, e.g. 以太坊订单流).

## `overview` covers both

For "is everything OK" start with `overview` (references/overview.md): it
lists deployments with server-computed metrics plus an anomaly list, and a
`bots` running count. Use the commands below for depth.

## `deployments`

```
$ openalpha deployments
id      name             status  exch  mode  equity       return
dep-1   磐石IC 4.0       running okx   live  $12,345.00   10.00%
```

- `equity`/`return` derive from the **executor's real equity curve** (not
  backtests). Rows with <2 curve points show `—` (insufficient sample —
  not zero).
- `!` after status = marked running but executor process is not alive.
- `annual` lives in `overview` (needs ≥7 days of samples).

## `deployment <id>`

Full JSON of one deployment, including `live` (executor state with
`equityCurve`, last rebalances) and `logTail` (recent executor output).
Parse and summarize the fields relevant to the question — status, events,
curve start/end. For metric math reuse `overview`'s numbers instead of
recomputing.

Health checklist when the user asks "还活着吗":
1. `status === 'running'` and no `!`
2. `credentialOk` true (else the executor silently skips every rebalance —
   the anomaly list in `overview` names this exactly)
3. curve's last point is recent (not stuck days ago)

## `bots`

```
$ openalpha bots
id              name        status    exchange   mode
bot-116b4a70-7  以太坊订单流  running   okx        live
```

Per-symbol V40 orderflow bots. `overview` gives the running/total count;
use this for the list.

## Boundary

Start/stop/redeploy are **not possible via this skill** (server-enforced).
If asked: confirm understanding, point to OpenAlpha web → 部署 page. Do not
retry against the API.
