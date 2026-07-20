# CampusFlow delivery roadmap

This file records completed product slices and the order of the remaining work.
Start a new section only when there is enough time to finish its model, API,
web interface, migration, tests, and documentation together.

## Completed

- [x] Repository foundation, web/API separation, local configuration, and CI
- [x] GitHub Actions running on current Node.js 24 action runtimes
- [x] Course create, list, edit, and delete workflows
- [x] SQLite persistence and Alembic schema migrations
- [x] Weekly schedule create, edit, and delete workflows
- [x] Same-day schedule conflict detection
- [x] Persistent assignment create, edit, complete, and delete workflows
- [x] Exam create, edit, and delete workflows with dashboard integration
- [x] Turkish and English interface support
- [x] Dashboard course, schedule, and assignment API integration

## Remaining product sections

### 1. Schedule document import

- [ ] Accept PDF, PNG, and JPEG uploads for course and exam schedules
- [ ] Ask whether the uploaded document is a course schedule or exam schedule
- [ ] Extract course names, dates or weekdays, times, and locations
- [ ] Show an editable preview and validation warnings before saving anything
- [ ] Import only the rows explicitly approved by the student
- [ ] Reject unsupported or unreadable files with a clear fallback to manual entry
- [ ] Keep uploads temporary and document the retention and privacy policy

Calendar-file (`.ics`) import and calendar subscriptions are intentionally out
of scope. University schedules are commonly published as documents, and the
upload-review-confirm flow keeps the primary onboarding path understandable.

#### Next session checkpoint

Continue with this section before starting accounts, PostgreSQL, or deployment.
Deliver it in reviewable vertical slices:

1. Choose and document the PDF/image extraction engine, its required environment
   variables, supported file limits, and local-development fallback.
2. Add a temporary upload and extraction API for PDF, PNG, and JPEG files. The
   response must be a preview only and must not modify the database.
3. Add an accessible web flow that asks for the document type, displays editable
   extracted rows, highlights incomplete or conflicting values, and lets the
   student select which rows to import.
4. Convert approved course-schedule rows into courses and weekly schedule
   entries, reusing the existing schedule conflict rules.
5. Convert approved exam-schedule rows into courses and exams, detecting
   duplicates before saving.
6. Test the complete flow with representative KTUN course and exam schedule
   documents, then run all web/API checks and GitHub Actions.

Uploaded source files must be treated as temporary private data: validate file
type and size, do not expose their contents in logs, and delete them after
extraction. Low-confidence extraction must always require student review; it
must never silently create records.

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
