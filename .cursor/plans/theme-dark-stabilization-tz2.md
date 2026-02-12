## Plan: Dark theme stabilization (token-based)

## Status: completed

### Scope

System dark theme fix via CSS tokens only:
- unify `:root` and `[data-theme="dark"]` tokens
- sync `data-theme` from provider and SSR init script
- stabilize body background, cards, text, buttons, inputs, burger, overlay

No architecture/API/store changes.

### Tasks

1. [completed] Sync theme attribute handling (`data-theme`) in provider + layout init script.
2. [completed] Add authoritative token layer in `globals.css`.
3. [completed] Align dark glass card/button/input/burger styles with requested values.
4. [completed] Ensure overlay alpha and blur limits stay within spec.
5. [completed] Run diagnostics on changed files.
