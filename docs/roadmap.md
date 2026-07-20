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
- [x] Turkish and English interface support
- [x] Dashboard course, schedule, and assignment API integration

## Remaining product sections

### 1. Exams

- [ ] Add the `Exam` model and migration
- [ ] Add validated exam CRUD API endpoints and service rules
- [ ] Add exam management UI and dashboard deadlines
- [ ] Add API and web behavior tests

### 2. User accounts and ownership

- [ ] Choose and document the authentication provider
- [ ] Add users and ownership to courses, schedules, assignments, and exams
- [ ] Protect API endpoints and web routes
- [ ] Add sign-in, sign-out, session, and authorization tests

### 3. Production database

- [ ] Add the PostgreSQL driver and local development configuration
- [ ] Run every migration against PostgreSQL in CI
- [ ] Document backup, restore, and migration deployment procedures

### 4. Honest dashboard and product polish

- [ ] Replace the placeholder focus-hours and semester-progress values
- [ ] Implement or remove notification and profile buttons
- [ ] Add loading, empty, and failure states for every remaining surface
- [ ] Complete keyboard, responsive, and accessibility review

### 5. Demo and deployment

- [ ] Add an idempotent demo-data seed command
- [ ] Configure production web and API deployment
- [ ] Add production environment variable documentation
- [ ] Add deployed smoke checks and a public demo URL

## Definition of done

A section is complete only when its database migration, domain service, thin API
routes, web flows, localized copy, automated tests, README documentation, local
quality checks, and GitHub Actions run all pass.
