# Core Skill distribution policy

The packaged desktop app uses an explicit allowlist in `apps/desktop/package.json`.
Only the production workflow Skills required for script, guide, shot-list, QA,
artifact formatting, and version management are copied into an installer.

The `mckee-source` Skill and its source-book text are never distributed. McKee
analysis Skills are also excluded from the default installer until an independent
copyright and licensing review is complete. Users may import their own local Skill
folders, but imported files remain outside the application bundle.
