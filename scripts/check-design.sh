#!/bin/bash
# Design guardrail — V5 Bordeaux Salon legacy class detector.
# Fails if any legacy / forbidden class is found in app code.
# Usage: npm run check:design

set -euo pipefail

# Search scope — only app code, not docs/tests/node_modules
SCOPE=(app features components)

# Patterns to forbid (regex, ERE)
# Note: amethyst-* / blush-* / roseGold-* / etc. are intentionally allowed
# in tailwind.config.ts as back-compat aliases; we ban only usages in code.
PATTERNS=(
  # Removed palettes
  'bg-amethyst[- "]'
  'text-amethyst[- "]'
  'border-amethyst[- "]'
  'hover:bg-amethyst'
  'hover:text-amethyst'
  'hover:border-amethyst'
  'bg-blush[- "]'
  'text-blush[- "]'
  'border-blush[- "]'
  'hover:bg-blush'
  'hover:border-blush'
  'bg-roseGold[- "]'
  'text-roseGold[- "]'
  'border-roseGold[- "]'
  'hover:bg-roseGold'
  'hover:border-roseGold'
  'focus:border-roseGold'
  # Legacy dark palette
  'bg-bg[- "]'
  'bg-bg/'
  'text-text-'
  # Legacy state colors (use success / warning / wine-deep)
  'text-rose[ "]'
  'bg-rose/'
  'border-rose/'
  'hover:bg-rose/'
  'text-amber[ "]'
  'bg-amber/'
  'border-amber/'
  'text-emerald[ "]'
  'bg-emerald/'
  'border-emerald/'
  # Legacy gradients
  'bg-gradient-rose-gold'
  'bg-gradient-amethyst'
  'bg-gradient-blush[ "]'
  # Legacy shadows
  'shadow-glow-amethyst'
  'shadow-glow-rose'
  'shadow-soft-card'
  'shadow-elevated-light'
  # Legacy custom CSS classes
  'rose-gradient[ "]'
  'ruri-gradient[ "]'
  # text-pearl unification
  'text-pearl[ "]'
)

FOUND=0
RESULTS=""

for pat in "${PATTERNS[@]}"; do
  # grep -E for ERE, -r recursive, -n line-number, --include for tsx/ts only
  match=$(grep -rEn --include='*.tsx' --include='*.ts' "$pat" "${SCOPE[@]}" 2>/dev/null || true)
  if [ -n "$match" ]; then
    FOUND=$((FOUND + 1))
    RESULTS+=$'\n--- Forbidden pattern: '"$pat"' ---\n'
    RESULTS+="$match"
    RESULTS+=$'\n'
  fi
done

if [ "$FOUND" -gt 0 ]; then
  echo "✗ Design guardrail FAILED — $FOUND forbidden pattern(s) found."
  echo "$RESULTS"
  echo ""
  echo "See design.md §1.6 and docs/design/TOKENS.md for V5 Bordeaux Salon alternatives."
  exit 1
fi

echo "✓ Design guardrail passed — no legacy class refs in code."
