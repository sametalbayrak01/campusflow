# CampusFlow contributor guidance

## Scope

- Keep changes small, reviewable, and tied to one issue.
- Preserve the `apps/web` and `apps/api` separation.
- Never commit secrets; document required variables in `.env.example`.

## Verification

- Web: run `npm run lint` and `npm run build` from `apps/web`.
- API: run `ruff check .` and `pytest` from `apps/api`.
- Add or update tests when behavior changes.

## Style

- Prefer clear domain names such as `Course`, `Schedule`, and `Assignment`.
- Keep API routes thin; put business rules in dedicated service modules.
- Use accessible HTML and explicit TypeScript types at public boundaries.
- Explain non-obvious architectural decisions in the README or `docs/`.
