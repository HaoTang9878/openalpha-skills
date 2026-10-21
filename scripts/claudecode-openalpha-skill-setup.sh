#!/usr/bin/env bash
# OpenAlpha skill installer for Claude Code
# Usage:  curl -fsSL https://raw.githubusercontent.com/HaoTang9878/openalpha-skills/main/scripts/claudecode-openalpha-skill-setup.sh | bash
set -euo pipefail

REPO="HaoTang9878/openalpha-skills"
DEST="${HOME}/.claude/skills/openalpha"

echo "[openalpha-skill] installing to ${DEST}"

if [ -d "${DEST}" ]; then
    echo "[openalpha-skill] existing install found, updating via git pull"
    git -C "${DEST}" pull --ff-only || {
        echo "[openalpha-skill] git pull failed, re-cloning"
        rm -rf "${DEST}"
    }
fi

if [ ! -d "${DEST}" ]; then
    git clone --depth 1 "https://github.com/${REPO}.git" "${DEST}"
fi

chmod +x "${DEST}/skills/openalpha/bin/openalpha"

if ! command -v node >/dev/null 2>&1; then
    echo "[openalpha-skill] WARNING: node not found — the CLI needs Node >= 18"
else
    echo "[openalpha-skill] node: $(node --version)"
fi

if [ -z "${OPENALPHA_API_KEY:-}" ]; then
    cat <<'EOF'
[openalpha-skill] NEXT STEP (you, the human):
  1. open https://openalpha.top  →  设置  →  安全  →  API Keys
  2. create a key (shown ONCE), then in your shell profile:
       export OPENALPHA_API_KEY=oa_paste_key_here
  3. verify with:  ~/.claude/skills/openalpha/skills/openalpha/bin/openalpha whoami
EOF
else
    echo "[openalpha-skill] OPENALPHA_API_KEY already set — run the CLI 'whoami' to verify"
fi

echo "[openalpha-skill] done. The skill activates when you mention OpenAlpha in chat."
