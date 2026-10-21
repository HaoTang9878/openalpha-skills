# Auth / Account / Balance / Positions

> Execute commands yourself. All read-only. Show real numbers from output.
> **DEFAULT SIDE IS LIVE.** `--demo` switches to the demo account; `--both`
> (balance only) shows both. Always state the side in your report.

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

## `status` / `login` / `logout`

- `status` — where the key comes from (env / config file / not configured),
  base url, config path. Exit 2 when nothing is configured.
- `login --key oa_...` — saves the key to `~/.openalpha/config.json`
  (mode 600). Preferred over env for interactive installs.
- `logout` — removes the saved key (the key stays valid server-side until
  revoked in the web UI — tell the user both steps).

## `balance [--exchange okx|binance] [--demo|--both]`

Equity and today's PnL. **Defaults to the live side of the given exchange**
(default exchange `okx`).

```
$ openalpha balance --exchange binance
[live]
  total         $1,234.56
  today PnL     +$12.34 (1.01%)
exchange     binance  (live side shown; --demo / --both)
```

**Error semantics (important):**
- A side with `error` → the CLI prints `balance unknown — NOT zero`.
  Report it as unknown; never treat as $0 or fold into sums. For totals,
  use `overview` (server-side, marks `partial`).
- `needsConfig` → no exchange credentials configured yet: guide the user to
  设置 → 交易所连接 (see errors.md). Most common new-user state.

## `positions [--exchange okx|binance] [--demo] [--symbol S]`

Open positions snapshot. **Defaults to LIVE.** The output's first line names
the side — quote it in your report.

```
$ openalpha positions
account      LIVE (okx)
symbol        side    size        entry     mark      uPnL     lev
BTC-USDT-SWAP long    0.05        67200.0   67510.0   15.5     3
```

- Column names vary slightly per exchange; the CLI maps common aliases. With
  odd shapes prefer `--json`.
- `snapshot at ... (stale)` = served from cache; mention it when the user
  asks about "right now".
- Empty output = genuinely no open positions on that side.

## Common flows

- "我的账户怎么样" → **do not chain balances**; run `overview`
  (references/overview.md) — totals are computed server-side.
- Per-exchange deep dive → `balance --exchange X` then
  `positions --exchange X` (state the side).
