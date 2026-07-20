import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { createAssignment, listAssignments, updateAssignment } from '../api/assignments'
import { listCourses } from '../api/courses'
import { listExams } from '../api/exams'
import { listSchedule } from '../api/schedule'
import { AssignmentFormDialog } from '../components/AssignmentFormDialog'
import type { Assignment, AssignmentInput } from '../types/assignment'
import type { Course } from '../types/course'
import type { ScheduleEntry } from '../types/schedule'

type StatsProps = {
  activeCourseCount: number | null
  dueTodayCount: number
  examCount: number
  tasksRemaining: number
}

function Stats({ activeCourseCount, dueTodayCount, examCount, tasksRemaining }: StatsProps) {
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
        <small>{t('dashboard.dueToday', { count: dueTodayCount })}</small>
      </article>
      <article className="stat-card">
        <span className="stat-icon blue">◷</span>
        <div><strong>{examCount}</strong><span>{t('dashboard.upcomingExams')}</span></div>
        <small>{t('dashboard.examSummary')}</small>
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
  assignments: Assignment[]
  completedCount: number
  busyId: number | null
  error: string | null
  onAdd: () => void
  onToggle: (assignment: Assignment) => void
}

function TasksPanel({ assignments, completedCount, busyId, error, onAdd, onToggle }: TasksPanelProps) {
  const { t, i18n } = useTranslation()
  const today = new Date()
  const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowValue = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
  const dueLabel = (dueDate: string) => {
    if (dueDate === todayValue) return t('due.today')
    if (dueDate === tomorrowValue) return t('due.tomorrow')
    return new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' }).format(new Date(`${dueDate}T12:00:00`))
  }
  return (
    <section className="panel" id="tasks">
      <div className="panel-heading">
        <div><p className="eyebrow">{t('dashboard.stayOnTrack')}</p><h2>{t('dashboard.upcomingTasks')}</h2></div>
        <span className="task-count">{completedCount}/{assignments.length}</span>
      </div>
      <div className="task-list">
        {assignments.length === 0 && <p className="panel-empty">{t('assignments.empty')}</p>}
        {assignments.map((assignment) => (
          <label className={assignment.completed ? 'task completed' : 'task'} key={assignment.id}>
            <input
              type="checkbox"
              checked={assignment.completed}
              disabled={busyId === assignment.id}
              aria-label={t('assignments.toggle', { title: assignment.title })}
              onChange={() => onToggle(assignment)}
            />
            <span className="custom-check" aria-hidden="true">✓</span>
            <span className="task-copy"><strong>{assignment.title}</strong><small>{assignment.course.code}</small></span>
            <span className={assignment.due_date === todayValue ? 'due urgent' : 'due'}>
              {dueLabel(assignment.due_date)}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="text-button" type="button" onClick={onAdd}>{t('dashboard.addNewTask')}</button>
    </section>
  )
}

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourseCount, setActiveCourseCount] = useState<number | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([])
  const [examCount, setExamCount] = useState(0)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [assignmentBusy, setAssignmentBusy] = useState(false)
  const [assignmentBusyId, setAssignmentBusyId] = useState<number | null>(null)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const completedCount = useMemo(
    () => assignments.filter((assignment) => assignment.completed).length,
    [assignments],
  )
  const todayValue = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
  const dueTodayCount = assignments.filter(
    (assignment) => !assignment.completed && assignment.due_date === todayValue,
  ).length
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  useEffect(() => {
    const controller = new AbortController()
    listCourses(controller.signal)
      .then((items) => {
        setCourses(items)
        setActiveCourseCount(items.length)
      })
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
    listAssignments(controller.signal)
      .then(setAssignments)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setAssignmentError(t('assignments.loadError'))
        }
      })
    listExams(controller.signal)
      .then((items) => setExamCount(items.filter((exam) => exam.exam_date >= todayValue).length))
      .catch(() => setExamCount(0))
    return () => controller.abort()
  }, [t, todayValue])

  const saveAssignment = async (input: AssignmentInput) => {
    setAssignmentBusy(true)
    setAssignmentError(null)
    try {
      const saved = await createAssignment(input)
      setAssignments((current) => [...current, saved].sort((first, second) => first.due_date.localeCompare(second.due_date)))
      setAssignmentDialogOpen(false)
    } catch {
      setAssignmentError(t('assignments.requestError'))
    } finally {
      setAssignmentBusy(false)
    }
  }

  const toggleAssignment = async (assignment: Assignment) => {
    setAssignmentBusyId(assignment.id)
    setAssignmentError(null)
    try {
      const saved = await updateAssignment(assignment.id, { completed: !assignment.completed })
      setAssignments((current) => current.map((item) => item.id === saved.id ? saved : item))
    } catch {
      setAssignmentError(t('assignments.requestError'))
    } finally {
      setAssignmentBusyId(null)
    }
  }

  const openAssignmentDialog = () => {
    if (courses.length === 0) {
      setAssignmentError(t('assignments.noCourses'))
      return
    }
    setAssignmentError(null)
    setAssignmentDialogOpen(true)
  }

  return (
    <main className="page-main" id="dashboard">
      <header className="topbar" id="top">
        <div><p className="eyebrow">{formattedDate}</p><h1>{t('dashboard.greeting')}</h1></div>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label={t('dashboard.notifications')}>♢</button>
          <button className="primary-button" type="button" onClick={openAssignmentDialog}><span>＋</span>{t('dashboard.addTask')}</button>
        </div>
      </header>

      <Stats
        activeCourseCount={activeCourseCount}
        dueTodayCount={dueTodayCount}
        examCount={examCount}
        tasksRemaining={assignments.length - completedCount}
      />
      <div className="content-grid">
        <SchedulePanel entries={todaySchedule} />
        <TasksPanel
          assignments={assignments}
          completedCount={completedCount}
          busyId={assignmentBusyId}
          error={assignmentError}
          onAdd={openAssignmentDialog}
          onToggle={(assignment) => { void toggleAssignment(assignment) }}
        />
      </div>
      {assignmentDialogOpen && (
        <AssignmentFormDialog
          courses={courses}
          assignment={null}
          busy={assignmentBusy}
          error={assignmentError}
          onClose={() => { if (!assignmentBusy) setAssignmentDialogOpen(false) }}
          onSubmit={saveAssignment}
        />
      )}
    </main>
  )
}
