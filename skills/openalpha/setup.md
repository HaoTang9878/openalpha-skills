# Setup — OpenAlpha skill

One-time setup, ~2 minutes.

## 1. The user creates an API key

In OpenAlpha web (openalpha.top): **设置 → 安全 → API Keys → 创建 Key**.
They give it a name (e.g. "my Claude Code") and get the full key `oa_...`
**shown once**. Tell them to copy it immediately.

The key is **read-only** — the OpenAlpha backend rejects every non-GET
request made with it. It can only see: account equity/positions, deployments,
strategy market, factor library.

## 2. Make the key available to the agent

Ask the user to export it in the shell profile the agent runs with:

```bash
export OPENALPHA_API_KEY=oa_paste_the_full_key_here
```

(Optionally also `export OPENALPHA_BASE_URL=...` — only needed for
self-hosted instances; the default is `https://openalpha.top`.)

## 3. Verify

Run:

```bash
node {baseDir}/bin/openalpha whoami
```

Expected: username, role, plan, `auth api_key`. If you see `401`, the key is
wrong or revoked — ask the user to re-check. If you see `451`, the current
network is blocked by the platform's region policy.

## 4. Make the CLI executable (optional but faster)

```bash
chmod +x {baseDir}/bin/openalpha
# then: {baseDir}/bin/openalpha whoami
```

## Security notes for the agent

- Never echo the full key back into chat output; the user typed/pasted it
  themselves, refer to it by its `prefix…`.
- If the user asks to revoke: web → 设置 → 安全 → API Keys → 吊销
  (instant, server-side).
