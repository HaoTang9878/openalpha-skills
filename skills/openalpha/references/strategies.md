# Strategy market & factor library

> The strategy market lists OpenAlpha's official strategies (e.g. 磐石
> defensive/CTA lines) with backtest-derived performance metrics. The factor
> library is the palette of signals strategies are built from. Read-only.

## `strategies`

```
$ openalpha strategies
id             name                        creator    return    annual    sharpe   maxDD
s_panshi_d     磐石-防御档                  official   ...       ...       ...     ...
```

- Metrics are **backtest/track-record figures, not promises**. Present them
  as such; never tell the user a strategy "will" return anything.
- Odd or missing metric fields → use `--json` and read what's there.

## `strategy <id>`

Full JSON profile of one strategy (description, config, performance detail).
Summarize in prose for the user; quote the numbers exactly as returned.

## `factors [query]`

Factor library with optional substring filter (matches name/description).

```
$ openalpha factors momentum
name                           category           ic
mom_30d                        trend              0.041
```

- `ic` (information criteria) values are historical and pool-dependent —
  do not extrapolate them into return predictions.
- More than 100 rows → CLI truncates; use `--json` for the full set.

## Boundary

Creating strategies, running backtests and deploying are web-UI actions.
This skill observes; it does not build.
