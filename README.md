# CampusFlow

CampusFlow is an open-source course and study planning platform for university
students. The project is being built as a production-style portfolio project:
small increments, automated checks, documented decisions, and a public roadmap.

## MVP

- Create and manage courses
- Build a weekly timetable
- Detect schedule conflicts
- Track assignments and exams
- Show upcoming work on a dashboard

## Tech stack

- **Web:** React, TypeScript, Vite
- **API:** Python, FastAPI
- **Database:** SQLite for local development; PostgreSQL planned
- **Quality:** ESLint, Ruff, Pytest, GitHub Actions

## Repository layout

```text
apps/
  api/   FastAPI service
  web/   React application
```

## Local development

### Web

```bash
cd apps/web
npm install
npm run dev
```

The web application runs at `http://localhost:5173`.
During development, Vite proxies `/api` requests to the FastAPI service at
`http://127.0.0.1:8000`. Set `VITE_API_BASE_URL` as documented in
`apps/web/.env.example` when the API is served elsewhere.

### API

```bash
cd apps/api
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
alembic upgrade head
fastapi dev
```

The API runs at `http://127.0.0.1:8000`; interactive documentation is available
at `http://127.0.0.1:8000/docs`.

The migration command creates the local SQLite database as
`apps/api/campusflow.db`. It is ignored by Git and can be replaced with another
database through the `DATABASE_URL` environment variable documented in
`.env.example`.

Create a migration after changing a SQLAlchemy model, then apply it:

```bash
cd apps/api
alembic revision --autogenerate -m "describe the schema change"
alembic upgrade head
```

### Course API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/courses` | List courses |
| `POST` | `/api/courses` | Create a course |
| `GET` | `/api/courses/{id}` | Read one course |
| `PATCH` | `/api/courses/{id}` | Update a course |
| `DELETE` | `/api/courses/{id}` | Delete a course |

The web application exposes the dashboard at `/` and course management at
`/courses`. Course data on that page is loaded from the API and supports
create, edit, and delete flows. The interface is available in Turkish and
English; Turkish is the default and the selected language is stored locally.

### Weekly schedule API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/schedule` | List weekly class times |
| `POST` | `/api/schedule` | Add a class time |
| `PATCH` | `/api/schedule/{id}` | Update a class time |
| `DELETE` | `/api/schedule/{id}` | Delete a class time |

The weekly schedule is available at `/schedule`. Weekdays use `0` for Monday
through `6` for Sunday. Time ranges are treated as half-open intervals, so a
class ending at `10:00` does not conflict with another class starting at
`10:00`; any actual overlap on the same weekday returns HTTP `409`.

### Assignment API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/assignments` | List assignments |
| `POST` | `/api/assignments` | Create an assignment |
| `PATCH` | `/api/assignments/{id}` | Update or complete an assignment |
| `DELETE` | `/api/assignments/{id}` | Delete an assignment |

Dashboard assignment counts, due dates, create actions, and completion
checkboxes use this API and persist in the database.

### Exam API

`GET` and `POST` requests use `/api/exams`; `PATCH` and `DELETE` use
`/api/exams/{id}`. The `/exams` page manages exam dates, optional start times,
and locations. The dashboard shows the number of exams scheduled from today.

## Quality checks

```bash
cd apps/web
npm run lint
npm run test
npm run build

cd ../api
ruff check .
pytest
```

## Roadmap

Detailed delivery status and the remaining definition of done are tracked in
[`docs/roadmap.md`](docs/roadmap.md).

1. Project foundation and CI
2. Course CRUD and web integration
3. PostgreSQL persistence and migrations
4. Weekly timetable and conflict detection
5. Assignment and exam tracking
6. Authentication, deployment, and demo data

## License

MIT
