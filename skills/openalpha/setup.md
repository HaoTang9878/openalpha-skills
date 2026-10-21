# Setup — OpenAlpha skill

One-time setup, ~2 minutes. **The login flow requires no shell-profile
editing.**

## 1. The user creates an API key

In OpenAlpha web (openalpha.top): **设置 → 安全 → API Keys → 创建 Key**.
They give it a name (e.g. "my Claude Code") and get the full key `oa_...`
**shown once**. Tell them to copy it immediately.

The key is **read-only** — the OpenAlpha backend rejects every non-GET
request made with it (equity/positions/deployments/strategy market/factor
library only).

## 2. Save the key (recommended: `login`)

Ask the user to paste the key, then run:

```bash
node {baseDir}/bin/openalpha login --key oa_paste_the_full_key
```

This writes `~/.openalpha/config.json` with mode 600. No `.zshrc`/`.bashrc`
editing — works immediately for the agent session.

Alternative for CI/headless: `export OPENALPHA_API_KEY=oa_...` (env overrides
the config file).

## 3. Verify

```bash
node {baseDir}/bin/openalpha whoami
node {baseDir}/bin/openalpha overview
```

Expected: username/plan from `whoami`; `overview` prints the account picture
(or "no exchange accounts connected" — that is the common new-user state,
guide them to 设置 → 交易所连接, see references/errors.md).

## 4. Optional convenience

```bash
chmod +x {baseDir}/bin/openalpha   # then run as ./bin/openalpha or on PATH
```

## Security notes for the agent

- Never echo the full key back into chat output; refer to it by `prefix…`
  (`openalpha status` shows the prefix).
- `openalpha logout` removes the saved key; revocation (instant, server-side)
  is a separate click in the web UI — remind the user both exist.
