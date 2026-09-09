#!/usr/bin/env bash
# Audit the codebase against design-system.md and the motion rules.
# Advisory: exits 1 when it finds something, so it can gate a commit if wanted.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
SRC="$REPO_ROOT/src"
DS="$REPO_ROOT/design-system.md"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

FINDINGS=0

COLORS='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
UTILS='bg|text|border|from|via|to|ring|fill|stroke|shadow|decoration|outline|accent|caret|divide|placeholder'
TOKEN_RE="\b(${UTILS})-(${COLORS})-[0-9]{2,3}\b"
VALID_SHADE='^(50|100|200|300|400|500|600|700|800|900|950)$'

if [ ! -d "$SRC" ]; then
  echo "error: no src/ directory found at $SRC"
  exit 2
fi

grep -rhoE "$TOKEN_RE" "$SRC" --include=*.jsx --include=*.js 2>/dev/null \
  | sort -u > "$TMP/used.txt"

echo "=============================================="
echo " Motion + design-system audit"
echo " repo: $REPO_ROOT"
echo "=============================================="
echo

# ---------------------------------------------------------------
# 1. Phantom Tailwind shades
# Tailwind's numeric scale is 50-950. A shade outside it (zinc-850)
# produces no CSS at all, so the style silently does nothing.
# ---------------------------------------------------------------
echo "[1] Phantom Tailwind shades"
awk -F'-' -v re="$VALID_SHADE" '{ if ($NF !~ re) print $0 }' "$TMP/used.txt" > "$TMP/phantom.txt"

if [ -s "$TMP/phantom.txt" ]; then
    while read -r tok; do
        n=$(grep -rho "$tok" "$SRC" --include=*.jsx --include=*.js 2>/dev/null | wc -l | tr -d ' ')
        echo "    $tok  (${n}x) -- renders as nothing"
    done < "$TMP/phantom.txt"
    echo
    echo "    Fix: define the shade under theme.extend.colors in tailwind.config.js,"
    echo "    or migrate to the nearest real shade."
    FINDINGS=$((FINDINGS + 1))
else
    echo "    none"
fi
echo

# ---------------------------------------------------------------
# 2. Tokens not approved in design-system.md
# ---------------------------------------------------------------
echo "[2] Tokens missing from design-system.md"
if [ ! -f "$DS" ]; then
    echo "    SKIPPED -- design-system.md does not exist yet."
    echo "    Run Phase 1 of the motion-sections skill to create it."
else
    awk '/APPROVED-TOKENS-START/{f=1;next} /APPROVED-TOKENS-END/{f=0} f' "$DS" \
      | tr -d ' \t' | grep -vE '^$' | sort -u > "$TMP/approved.txt"

    if [ ! -s "$TMP/approved.txt" ]; then
        echo "    SKIPPED -- no APPROVED-TOKENS block found in design-system.md."
        echo "    Add the markers described in the skill so this check can run."
    else
        comm -23 "$TMP/used.txt" "$TMP/approved.txt" > "$TMP/unapproved.txt"
        if [ -s "$TMP/unapproved.txt" ]; then
            while read -r tok; do
                n=$(grep -rho "$tok" "$SRC" --include=*.jsx --include=*.js 2>/dev/null | wc -l | tr -d ' ')
                echo "    $tok  (${n}x)"
            done < "$TMP/unapproved.txt"
            echo
            echo "    Each of these is either a component that slipped the system,"
            echo "    or a deliberate change that belongs in design-system.md."
            FINDINGS=$((FINDINGS + 1))
        else
            echo "    none -- every color token is in the system"
        fi
    fi
fi
echo

# ---------------------------------------------------------------
# 3. Framer Motion without reduced-motion handling
# ---------------------------------------------------------------
echo "[3] Framer Motion files with no reduced-motion handling"
grep -rlE "from ['\"]framer-motion['\"]" "$SRC" --include=*.jsx --include=*.js 2>/dev/null \
  | sort > "$TMP/motion_files.txt"

: > "$TMP/no_rm.txt"
while read -r f; do
    [ -z "$f" ] && continue
    if ! grep -qE "useReducedMotion|@/lib/motion" "$f" 2>/dev/null; then
        echo "${f#"$REPO_ROOT/"}" >> "$TMP/no_rm.txt"
    fi
done < "$TMP/motion_files.txt"

total=$(grep -c '' "$TMP/motion_files.txt" 2>/dev/null || echo 0)
missing=$(grep -c '' "$TMP/no_rm.txt" 2>/dev/null || echo 0)

if [ "$missing" -gt 0 ]; then
    sed 's/^/    /' "$TMP/no_rm.txt"
    echo
    echo "    ${missing} of ${total} motion files ignore prefers-reduced-motion."
    echo "    Route them through useEntrance/useHoverLift in src/lib/motion.js"
    echo "    (see references/motion-patterns.md section 2)."
    FINDINGS=$((FINDINGS + 1))
else
    echo "    none -- all ${total} motion files handle it"
fi
echo

# ---------------------------------------------------------------
# 4. Likely layout-property animation (heuristic)
# Animating width/height/top/margin forces layout recalculation
# every frame. Transform and opacity composite on the GPU instead.
# ---------------------------------------------------------------
echo "[4] Possible layout-property animation"
find "$SRC" \( -name '*.jsx' -o -name '*.js' \) -print0 2>/dev/null \
  | xargs -0 awk '
    /(initial|animate|exit|whileHover|whileTap|whileInView|variants)[[:space:]]*=[[:space:]]*\{\{/ { w = 5 }
    w > 0 && /(^|[^a-zA-Z])(width|height|top|left|right|bottom|margin|padding)[[:space:]]*:/ {
        print FILENAME ":" FNR ":" $0
    }
    { if (w > 0) w-- }
  ' 2>/dev/null | sed "s|$REPO_ROOT/||" > "$TMP/layout.txt"

if [ -s "$TMP/layout.txt" ]; then
    sed 's/^/    /' "$TMP/layout.txt"
    echo
    echo "    Heuristic -- verify each. Prefer transform/opacity; for height,"
    echo "    scaleY or a Radix collapsible is usually the right substitute."
    FINDINGS=$((FINDINGS + 1))
else
    echo "    none"
fi
echo

echo "=============================================="
if [ "$FINDINGS" -eq 0 ]; then
    echo " Clean. Still do the manual checks: real phone on"
    echo " cellular, OS reduced motion on, fast scroll up+down."
    exit 0
else
    echo " ${FINDINGS} of 4 checks found something. Fix it, or update"
    echo " design-system.md if the change was deliberate."
    exit 1
fi
