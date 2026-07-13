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

### API

```bash
cd apps/api
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
fastapi dev
```

The API runs at `http://127.0.0.1:8000`; interactive documentation is available
at `http://127.0.0.1:8000/docs`.

The local SQLite database is created automatically as `apps/api/campusflow.db`.
It is ignored by Git and can be replaced with another database through the
`DATABASE_URL` environment variable documented in `.env.example`.

### Course API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/courses` | List courses |
| `POST` | `/api/courses` | Create a course |
| `GET` | `/api/courses/{id}` | Read one course |
| `PATCH` | `/api/courses/{id}` | Update a course |
| `DELETE` | `/api/courses/{id}` | Delete a course |

## Roadmap

1. Project foundation and CI
2. Course CRUD and PostgreSQL persistence
3. Weekly timetable and conflict detection
4. Assignment and exam tracking
5. Authentication, deployment, and demo data

## License

MIT
