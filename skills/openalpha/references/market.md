# Market radar — `market listings` (read scope)

Newly listed USDT perpetuals on OKX and Binance, from the exchanges'
official instrument metadata (listTime / onboardDate). Default window 14
days (`--days N`, 1–90). Cached 30 min server-side.

```
$ openalpha market listings
近 14 天新上市 USDT 永续(双所合计 5 个)
exchange  symbol                    days
okx       XYZ/USDT:USDT             2
binance   ABC/USDT:USDT             5
```

## Why it matters (pool admission)

Newly listed perps have special volatility/liquidity structure — dropping
them straight into a cross-sectional pool pollutes rankings. Use this
radar to make "when to include" an explicit decision: typically wait out
the first 1–2 weeks, then admit via the normal liquidity/volume screen.

## Honesty rules

- One exchange failing degrades to the other and prints a `! 数据降级`
  line naming the failure — absence of one exchange is NEVER silent.
- `days` counts from official listing time, not from when we first saw it.
