#!/usr/bin/env bash
# OpenAlpha skill installer for Claude Code
# Pinned to a release tag by default (main is mutable; tags are the contract).
# Override with: OPENALPHA_SKILL_REF=v1.0.0 bash ... (use "main" for bleeding edge)
# Usage:  curl -fsSL https://raw.githubusercontent.com/HaoTang9878/openalpha-skills/v1.1.0/scripts/claudecode-openalpha-skill-setup.sh | bash
set -euo pipefail

REPO="HaoTang9878/openalpha-skills"
REF="${OPENALPHA_SKILL_REF:-v1.1.0}"
DEST="${HOME}/.claude/skills/openalpha"

echo "[openalpha-skill] installing ${REF} to ${DEST}"

if [ -d "${DEST}/.git" ]; then
    echo "[openalpha-skill] existing install found, fetching pinned ref"
    git -C "${DEST}" fetch --depth 1 origin "${REF}" || true
    git -C "${DEST}" checkout "FETCH_HEAD" 2>/dev/null \
        || echo "[openalpha-skill] checkout failed, keeping current copy"
elif [ -d "${DEST}" ]; then
    echo "[openalpha-skill] non-git install at ${DEST}, leaving it; remove it first to reinstall"
fi

if [ ! -d "${DEST}/.git" ] && [ ! -d "${DEST}" ]; then
    git clone --depth 1 --branch "${REF}" "https://github.com/${REPO}.git" "${DEST}" \
        || git clone --depth 1 "https://github.com/${REPO}.git" "${DEST}"
fi

chmod +x "${DEST}/skills/openalpha/bin/openalpha" 2>/dev/null || true

if ! command -v node >/dev/null 2>&1; then
    echo "[openalpha-skill] WARNING: node not found — the CLI needs Node >= 18"
else
    echo "[openalpha-skill] node: $(node --version)"
fi

if [ -f "${HOME}/.openalpha/config.json" ]; then
    echo "[openalpha-skill] key already configured (~/.openalpha/config.json) — run 'openalpha whoami' to verify"
else
    cat <<'EOF'
[openalpha-skill] NEXT STEP (you, the human):
  1. open https://openalpha.top  →  设置  →  安全  →  API Keys
  2. create a key (shown ONCE), then tell your agent the key so it runs:
       openalpha login --key oa_paste_key_here
  3. verify:  openalpha overview
EOF
fi

echo "[openalpha-skill] done (${REF}). The skill activates on account/equity/deployment questions."
