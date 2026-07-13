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
- **Database:** PostgreSQL (planned)
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

## Roadmap

1. Project foundation and CI
2. Course CRUD and PostgreSQL persistence
3. Weekly timetable and conflict detection
4. Assignment and exam tracking
5. Authentication, deployment, and demo data

## License

MIT
