# Release Process

This project uses two separate repositories:

- **designkit-dev** (private) — day-to-day development
- **designkit** (public) — published releases

They have independent git histories. A script handles syncing.

## Quick Start

```bash
# From the designkit-dev root:
./release.sh              # sync files, prompted for commit message
./release.sh "v0.2.0"    # sync files with a specific commit message
```

On first run, the script clones the public repo to `~/Dev/designkit`. After that it syncs in place.

## What Gets Published

Everything in the dev repo **except**:

| Excluded path | Reason |
|---|---|
| `.superpowers/` | Dev tooling state (brainstorm sessions, logs) |
| `superpowers-main/` | Upstream Superpowers source bundled for dev reference |
| `docs/` | Internal docs, plans, and specs |
| `release.sh` | Dev-only tooling |
| `node_modules/` | Dependencies (not committed) |
| `.DS_Store` | macOS junk |

## How It Works

1. **rsync** copies the dev repo into the public repo folder, using `--delete` to remove files that no longer exist in dev
2. Excluded paths are skipped entirely — they never touch the public repo
3. The script shows `git status` of the public repo so you can review what changed
4. You're prompted for a commit message (or pass one as an argument)
5. You're prompted again before pushing to GitHub

## Adding New Exclusions

Edit `release.sh` and add another `--exclude` line to the rsync block:

```bash
rsync -av --delete \
  --exclude '.git/' \
  --exclude '.superpowers/' \
  --exclude 'your-new-exclusion/' \   # <-- add here
  ...
```

## Gotchas

- **CLAUDE.md is published.** It contains project instructions that are useful for public contributors too. If you add dev-only notes to it, consider moving those to `docs/superpowers/` instead (which is excluded).
- **`--delete` means removals propagate.** If you delete a file in dev, it gets deleted in the public repo on next sync. This is intentional.
- **No cherry-picking.** This is an all-or-nothing sync (minus exclusions). If you need to hold back a specific file temporarily, add it to the exclude list and remove it later.
