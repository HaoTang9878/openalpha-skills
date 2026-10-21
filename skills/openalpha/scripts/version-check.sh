#!/usr/bin/env bash
# Light version-check for the openalpha skill (pinned-release model).
# Prints UP_TO_DATE / skill:X->Y (self-update via git) — the agent relays
# upgrade offers to the user; no auto-update without consent.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_VER="$(sed -n 's/^version: *"\(.*\)"/\1/p' "$HERE/SKILL.md" | head -1)"

REMOTE_TAG="$(git ls-remote --tags --refs \
    https://github.com/HaoTang9878/openalpha-skills.git 2>/dev/null \
    | sed 's|.*refs/tags/v||' | sort -V | tail -1 || true)"

if [ -z "$SKILL_VER" ] || [ -z "$REMOTE_TAG" ]; then
    echo "UNKNOWN skill=$SKILL_VER remote=$REMOTE_TAG (offline or unparsable — continue silently)"
    exit 0
fi

if [ "$SKILL_VER" = "$REMOTE_TAG" ]; then
    echo "UP_TO_DATE skill:$SKILL_VER"
else
    echo "UPGRADE skill:$SKILL_VER->$REMOTE_TAG (cd $HERE && git pull, or re-run installer pinned to v$REMOTE_TAG)"
fi
