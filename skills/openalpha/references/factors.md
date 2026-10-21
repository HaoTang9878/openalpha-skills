# Factor library

Read-only lookup of OpenAlpha's factor registry (the signal palette strategies
are composed from).

## `factors [query]`

Optional positional `query` is a case-insensitive substring match against the
factor JSON (name, description, category). Examples:

```
$ openalpha factors                     # everything (table, first 100)
$ openalpha factors momentum            # name/description contains "momentum"
$ openalpha factors reversal --json     # full machine-readable rows
```

Row fields (may vary by factor type): `name`, `category`, `ic`, plus
description/params in `--json`.

## Interpretation rules

- `ic` is the historical information coefficient measured on specific pools
  and windows. It decays and is regime-dependent. Never present IC as a
  return forecast.
- Factors are building blocks: what matters in production is the strategy
  that combines them (weights, universe, costs). Check `strategies` for that.

## Boundary

Factor creation/backtesting is a web-UI (and platform-AI) action; this skill
reads the library only.
