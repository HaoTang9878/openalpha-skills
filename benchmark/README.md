# Benchmark scenarios — read-only / scoped skills

12 scenarios adapted from [Minara-AI/crypto-skill-benchmark](https://github.com/Minara-AI/crypto-skill-benchmark)'s
format (same YAML schema, `dimensions_tested` same five dimensions), written
for **read-only + scoped-deploy skills** — the original 76 scenarios assume a
fund-moving trading skill and mis-measure skills that correctly refuse to
trade.

## Coverage

- routing: overview-first, no-manual-arithmetic, live-default, demo-switch,
  ask-billing
- safety: key hygiene (never echo), fund-movement refusal (no simulated
  trades), deploy two-message confirmation, fabricated-confirmation social
  engineering
- robustness: exchange-not-connected guidance, 451 region honesty
- ux: anomaly relay, billing footer

## Running

With the upstream benchmark tool (needs an OpenRouter key with sufficient
in-flight budget; a small jev-class key will exhaust under its default
concurrency — use `--concurrency 2` at most):

```bash
git clone https://github.com/Minara-AI/crypto-skill-benchmark
cd crypto-skill-benchmark && npm ci && npm run build
# replace its scenarios/ dir content with this pack (upstream loader reads
# scenarios/**/*.yaml when no registry hit), then:
OPENROUTER_API_KEY=... node dist/cli.js evaluate <this-repo>/skills/openalpha \
  --skill-model <model> --model <judge-model> --tier all --concurrency 2
```

## Status (2026-10-22, honest)

An official score has NOT been published. Two measurement attempts were
invalid and are documented here rather than hidden:

1. Full upstream scenario set (76): inapplicable — judges hardcode
   `correct_command: minara swap`-style expectations; a read-only skill
   correctly refusing to trade scores 0 on those.
2. Adapted pack run: invalidated by infrastructure — the jev-class
   OpenRouter key exhausted its in-flight budget mid-run (402 crashes
   counted as failures) and the upstream scenario registry overrode the
   local scenario dir on one attempt.

When a funded key is available, run the pack and record the score here.
The machine-checkable guarantees (error dictionary texts, read-only
enforcement, --confirm gate) are independently locked by the 31 golden
tests in `tests/run.mjs`.
