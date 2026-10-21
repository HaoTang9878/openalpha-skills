# Auth / Account / Balance / Positions

> Execute commands yourself. All read-only. Show real numbers from output.

## `whoami`

```
$ openalpha whoami
user        tanghao
role        user
plan        free
auth        api_key
```

Use it to verify the key works (setup) and to confirm which account you are
reporting on. `--json` returns id/displayName/createdAt too.

## `balance [--exchange okx|binance] [--live]`

Queries account equity and today's PnL for the given exchange
(default `okx`), for **both live and demo** sides; add `--live` for live only.

```
$ openalpha balance --exchange binance
[live]
  total         $1,234.56
  today PnL     +$12.34 (1.01%)
[demo]
  total         $10,000.00
  today PnL     -$5.00 (-0.05%)
exchange     binance
```

**Error semantics (important):** a side can return an `error` field (e.g.
exchange API key misconfigured, upstream timeout). In that case the CLI
prints `error ... (balance unknown — not a zero)`. Report it as unknown —
**never** interpret a failed side as $0 or as a loss.

`--json` exposes `total / today_profit / profit_percent / latency / error`
per side.

## `positions [--exchange okx|binance] [--live] [--symbol S]`

Open positions snapshot. Default is the **demo** account (matching the web
UI's default); pass `--live` for the real one. Always state which side you
are reporting.

```
$ openalpha positions --live
symbol       side    size        entry     mark      uPnL     lev
BTC-USDT-SWAP long   0.05        67200.0   67510.0   15.5     3
```

- Column names vary slightly per exchange; the CLI maps common aliases.
  With odd shapes, prefer `--json`.
- A `snapshot at ... (stale)` header means the platform served a cached
  snapshot; mention staleness when the user asks about "right now".
- Empty output means genuinely no open positions on that side.

## Common flows

- Daily check: `balance` (both exchanges) → `positions --live` per exchange.
- User asks "did my account move today?": `balance --live` today PnL, then
  `positions --live` to attribute the move to specific symbols.
