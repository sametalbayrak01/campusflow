import { useMemo, useState } from 'react'
import './App.css'

type Task = { id: number; title: string; course: string; due: string; completed: boolean }

const schedule = [
  { time: '09:00', code: 'CENG 301', title: 'Algorithms', room: 'B-204', tone: 'violet' },
  { time: '11:00', code: 'MATH 204', title: 'Linear Algebra', room: 'A-112', tone: 'blue' },
  { time: '14:30', code: 'CENG 315', title: 'Databases', room: 'Lab 3', tone: 'orange' },
]

const initialTasks: Task[] = [
  { id: 1, title: 'Graph theory problem set', course: 'CENG 301', due: 'Today', completed: false },
  { id: 2, title: 'Normalize library schema', course: 'CENG 315', due: 'Tomorrow', completed: false },
  { id: 3, title: 'Review eigenvectors', course: 'MATH 204', due: '18 Jul', completed: true },
]

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks])
  const toggleTask = (id: number) => setTasks((current) => current.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  ))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="CampusFlow home">
          <span className="brand-mark">C</span><span>CampusFlow</span>
        </a>
        <nav aria-label="Main navigation">
          <a className="nav-link active" href="#dashboard"><span>⌂</span> Dashboard</a>
          <a className="nav-link" href="#schedule"><span>□</span> Schedule</a>
          <a className="nav-link" href="#tasks"><span>✓</span> Tasks</a>
          <a className="nav-link" href="#courses"><span>▤</span> Courses</a>
        </nav>
        <div className="semester-card">
          <p className="eyebrow">Spring semester</p><strong>Week 8 of 14</strong>
          <div className="progress" aria-label="Semester progress: 57 percent"><span /></div>
          <small>6 weeks until finals</small>
        </div>
        <button className="profile" type="button">
          <span className="avatar">SA</span><span><strong>Student</strong><small>View profile</small></span>
          <span aria-hidden="true">•••</span>
        </button>
      </aside>

      <main id="dashboard">
        <header className="topbar" id="top">
          <div><p className="eyebrow">Monday, 13 July</p><h1>Good morning 👋</h1></div>
          <div className="header-actions">
            <button className="icon-button" type="button" aria-label="Notifications">♢</button>
            <button className="primary-button" type="button"><span>＋</span> Add task</button>
          </div>
        </header>

        <section className="stats-grid" aria-label="Study overview">
          <article className="stat-card"><span className="stat-icon violet">▤</span><div><strong>4</strong><span>Active courses</span></div><small>All on track</small></article>
          <article className="stat-card"><span className="stat-icon orange">!</span><div><strong>{tasks.length - completedCount}</strong><span>Tasks remaining</span></div><small>1 due today</small></article>
          <article className="stat-card"><span className="stat-icon blue">◷</span><div><strong>12.5h</strong><span>Focus this week</span></div><small>↑ 18% from last week</small></article>
        </section>

        <div className="content-grid">
          <section className="panel" id="schedule">
            <div className="panel-heading"><div><p className="eyebrow">Your day</p><h2>Today’s schedule</h2></div><a href="#schedule">Full calendar →</a></div>
            <div className="timeline">
              {schedule.map((item) => (
                <article className="class-item" key={item.time}>
                  <time>{item.time}</time><span className={`timeline-dot ${item.tone}`} />
                  <div className={`class-card ${item.tone}`}><div><span>{item.code}</span><h3>{item.title}</h3></div><small>{item.room}</small></div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel" id="tasks">
            <div className="panel-heading"><div><p className="eyebrow">Stay on track</p><h2>Upcoming tasks</h2></div><span className="task-count">{completedCount}/{tasks.length}</span></div>
            <div className="task-list">
              {tasks.map((task) => (
                <label className={task.completed ? 'task completed' : 'task'} key={task.id}>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                  <span className="custom-check" aria-hidden="true">✓</span>
                  <span className="task-copy"><strong>{task.title}</strong><small>{task.course}</small></span>
                  <span className={task.due === 'Today' ? 'due urgent' : 'due'}>{task.due}</span>
                </label>
              ))}
            </div>
            <button className="text-button" type="button">＋ Add a new task</button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
