import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { listCourses } from '../api/courses'
import { listSchedule } from '../api/schedule'
import type { ScheduleEntry } from '../types/schedule'

type Task = {
  id: number
  title: string
  course: string
  due: 'today' | 'tomorrow' | 'date'
  dueLabel?: string
  completed: boolean
}

const initialTasks: Task[] = [
  { id: 1, title: 'Graph theory problem set', course: 'CENG 301', due: 'today', completed: false },
  { id: 2, title: 'Normalize library schema', course: 'CENG 315', due: 'tomorrow', completed: false },
  { id: 3, title: 'Review eigenvectors', course: 'MATH 204', due: 'date', dueLabel: '18 Jul', completed: true },
]

type StatsProps = {
  activeCourseCount: number | null
  tasksRemaining: number
}

function Stats({ activeCourseCount, tasksRemaining }: StatsProps) {
  const { t } = useTranslation()
  return (
    <section className="stats-grid" aria-label={t('dashboard.studyOverview')}>
      <article className="stat-card">
        <span className="stat-icon violet">◇</span>
        <div><strong>{activeCourseCount ?? '—'}</strong><span>{t('dashboard.activeCourses')}</span></div>
        <small>{t('dashboard.onTrack')}</small>
      </article>
      <article className="stat-card">
        <span className="stat-icon orange">!</span>
        <div><strong>{tasksRemaining}</strong><span>{t('dashboard.tasksRemaining')}</span></div>
        <small>{t('dashboard.dueToday')}</small>
      </article>
      <article className="stat-card">
        <span className="stat-icon blue">◷</span>
        <div><strong>12.5h</strong><span>{t('dashboard.focusWeek')}</span></div>
        <small>{t('dashboard.fromLastWeek')}</small>
      </article>
    </section>
  )
}

function SchedulePanel({ entries }: { entries: ScheduleEntry[] }) {
  const { t } = useTranslation()
  return (
    <section className="panel" id="schedule">
      <div className="panel-heading">
        <div><p className="eyebrow">{t('dashboard.yourDay')}</p><h2>{t('dashboard.todaySchedule')}</h2></div>
        <Link to="/schedule">{t('dashboard.fullCalendar')}</Link>
      </div>
      <div className="timeline">
        {entries.length === 0 && <p className="panel-empty">{t('schedule.todayEmpty')}</p>}
        {entries.map((entry) => (
          <article className="class-item" key={entry.id} style={{ '--course-color': entry.course.color } as React.CSSProperties}>
            <time>{entry.start_time.slice(0, 5)}</time>
            <span className="timeline-dot course-tone" />
            <div className="class-card course-tone">
              <div><span>{entry.course.code}</span><h3>{entry.course.name}</h3></div>
              <small>{entry.room ?? t('courses.roomMissing')}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

type TasksPanelProps = {
  tasks: Task[]
  completedCount: number
  onToggle: (id: number) => void
}

function TasksPanel({ tasks, completedCount, onToggle }: TasksPanelProps) {
  const { t } = useTranslation()
  return (
    <section className="panel" id="tasks">
      <div className="panel-heading">
        <div><p className="eyebrow">{t('dashboard.stayOnTrack')}</p><h2>{t('dashboard.upcomingTasks')}</h2></div>
        <span className="task-count">{completedCount}/{tasks.length}</span>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <label className={task.completed ? 'task completed' : 'task'} key={task.id}>
            <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
            <span className="custom-check" aria-hidden="true">✓</span>
            <span className="task-copy"><strong>{task.title}</strong><small>{task.course}</small></span>
            <span className={task.due === 'today' ? 'due urgent' : 'due'}>
              {task.due === 'date' ? task.dueLabel : t(`due.${task.due}`)}
            </span>
          </label>
        ))}
      </div>
      <button className="text-button" type="button">{t('dashboard.addNewTask')}</button>
    </section>
  )
}

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [tasks, setTasks] = useState(initialTasks)
  const [activeCourseCount, setActiveCourseCount] = useState<number | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([])
  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks])
  const toggleTask = (id: number) => setTasks((current) => current.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  ))
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  useEffect(() => {
    const controller = new AbortController()
    listCourses(controller.signal)
      .then((courses) => setActiveCourseCount(courses.length))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setActiveCourseCount(null)
        }
      })
    listSchedule(controller.signal)
      .then((entries) => {
        const today = (new Date().getDay() + 6) % 7
        setTodaySchedule(entries.filter((entry) => entry.weekday === today))
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setTodaySchedule([])
        }
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="page-main" id="dashboard">
      <header className="topbar" id="top">
        <div><p className="eyebrow">{formattedDate}</p><h1>{t('dashboard.greeting')}</h1></div>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label={t('dashboard.notifications')}>♢</button>
          <button className="primary-button" type="button"><span>＋</span>{t('dashboard.addTask')}</button>
        </div>
      </header>

      <Stats
        activeCourseCount={activeCourseCount}
        tasksRemaining={tasks.length - completedCount}
      />
      <div className="content-grid">
        <SchedulePanel entries={todaySchedule} />
        <TasksPanel
          tasks={tasks}
          completedCount={completedCount}
          onToggle={toggleTask}
        />
      </div>
    </main>
  )
}
