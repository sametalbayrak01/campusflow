# CampusFlow delivery roadmap

This file records completed product slices and the order of the remaining work.
Start a new section only when there is enough time to finish its model, API,
web interface, migration, tests, and documentation together.

## Completed

- [x] Repository foundation, web/API separation, local configuration, and CI
- [x] Course create, list, edit, and delete workflows
- [x] SQLite persistence and Alembic schema migrations
- [x] Weekly schedule create, edit, and delete workflows
- [x] Same-day schedule conflict detection
- [x] Persistent assignment create, edit, complete, and delete workflows
- [x] Exam create, edit, and delete workflows with dashboard integration
- [x] Turkish and English interface support
- [x] Dashboard course, schedule, and assignment API integration

## Remaining product sections

### 1. User accounts and ownership

- [ ] Choose and document the authentication provider
- [ ] Add users and ownership to courses, schedules, assignments, and exams
- [ ] Protect API endpoints and web routes
- [ ] Add sign-in, sign-out, session, and authorization tests

### 2. Production database

- [ ] Add the PostgreSQL driver and local development configuration
- [ ] Run every migration against PostgreSQL in CI
- [ ] Document backup, restore, and migration deployment procedures

### 3. Honest dashboard and product polish

- [ ] Replace the placeholder focus-hours and semester-progress values
- [ ] Implement or remove notification and profile buttons
- [ ] Add loading, empty, and failure states for every remaining surface
- [ ] Complete keyboard, responsive, and accessibility review

### 4. Demo and deployment

- [ ] Add an idempotent demo-data seed command
- [ ] Configure production web and API deployment
- [ ] Add production environment variable documentation
- [ ] Add deployed smoke checks and a public demo URL

## Definition of done

A section is complete only when its database migration, domain service, thin API
routes, web flows, localized copy, automated tests, README documentation, local
quality checks, and GitHub Actions run all pass.
