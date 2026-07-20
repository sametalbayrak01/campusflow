import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  createAssignment,
  deleteAssignment,
  listAssignments,
  updateAssignment,
} from '../api/assignments'
import { listCourses } from '../api/courses'
import { AssignmentFormDialog } from '../components/AssignmentFormDialog'
import { DeleteAssignmentDialog } from '../components/DeleteAssignmentDialog'
import type { Assignment, AssignmentInput } from '../types/assignment'
import type { Course } from '../types/course'

const sortAssignments = (items: Assignment[]) => [...items].sort((first, second) =>
  Number(first.completed) - Number(second.completed)
    || first.due_date.localeCompare(second.due_date),
)

export function AssignmentsPage() {
  const { t, i18n } = useTranslation()
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null | undefined>()
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null)
  const [busy, setBusy] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(false)
    Promise.all([listCourses(controller.signal), listAssignments(controller.signal)])
      .then(([courseItems, assignmentItems]) => {
        setCourses(courseItems)
        setAssignments(sortAssignments(assignmentItems))
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const saveAssignment = async (input: AssignmentInput) => {
    setBusy(true)
    setMutationError(null)
    try {
      const saved = editingAssignment
        ? await updateAssignment(editingAssignment.id, input)
        : await createAssignment(input)
      setAssignments((current) => sortAssignments([
        ...current.filter((assignment) => assignment.id !== saved.id),
        saved,
      ]))
      setEditingAssignment(undefined)
    } catch {
      setMutationError(t('assignments.requestError'))
    } finally {
      setBusy(false)
    }
  }

  const toggleAssignment = async (assignment: Assignment) => {
    setBusy(true)
    setMutationError(null)
    try {
      const saved = await updateAssignment(assignment.id, { completed: !assignment.completed })
      setAssignments((current) => sortAssignments(current.map((item) => item.id === saved.id ? saved : item)))
    } catch {
      setMutationError(t('assignments.requestError'))
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingAssignment) return
    setBusy(true)
    setMutationError(null)
    try {
      await deleteAssignment(deletingAssignment.id)
      setAssignments((current) => current.filter((item) => item.id !== deletingAssignment.id))
      setDeletingAssignment(null)
    } catch {
      setMutationError(t('assignments.requestError'))
    } finally {
      setBusy(false)
    }
  }

  const closeDialogs = () => {
    if (busy) return
    setEditingAssignment(undefined)
    setDeletingAssignment(null)
    setMutationError(null)
  }

  const formatDate = (date: string) => new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))

  return (
    <main className="page-main assignments-page">
      <header className="topbar">
        <div><p className="eyebrow">{t('assignments.eyebrow')}</p><h1>{t('assignments.pageTitle')}</h1><p className="page-description">{t('assignments.subtitle')}</p></div>
        <button className="primary-button" type="button" onClick={() => setEditingAssignment(null)} disabled={courses.length === 0}><span>＋</span>{t('assignments.addTitle')}</button>
      </header>

      {loading && <div className="state-panel" role="status"><span className="spinner" />{t('assignments.loading')}</div>}
      {!loading && loadError && <div className="state-panel" role="alert"><strong>{t('assignments.loadError')}</strong><button className="secondary-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>{t('common.retry')}</button></div>}
      {!loading && !loadError && courses.length === 0 && <div className="state-panel empty-state"><span className="empty-mark">◇</span><strong>{t('schedule.noCoursesTitle')}</strong><p>{t('assignments.noCourses')}</p><Link className="primary-link" to="/courses">{t('courses.add')}</Link></div>}
      {!loading && !loadError && courses.length > 0 && assignments.length === 0 && <div className="state-panel empty-state"><span className="empty-mark">✓</span><strong>{t('assignments.emptyTitle')}</strong><p>{t('assignments.emptyText')}</p><button className="primary-button" type="button" onClick={() => setEditingAssignment(null)}>{t('assignments.addTitle')}</button></div>}
      {!loading && !loadError && assignments.length > 0 && (
        <div className="assignment-grid">
          {assignments.map((assignment) => (
            <article className={assignment.completed ? 'assignment-card completed' : 'assignment-card'} key={assignment.id} style={{ '--course-color': assignment.course.color } as React.CSSProperties}>
              <label className="assignment-check"><input type="checkbox" checked={assignment.completed} onChange={() => { void toggleAssignment(assignment) }} disabled={busy} /><span aria-hidden="true">✓</span></label>
              <div className="assignment-copy"><span>{assignment.course.code}</span><h2>{assignment.title}</h2><time dateTime={assignment.due_date}>{formatDate(assignment.due_date)}</time></div>
              <div className="assignment-actions"><button type="button" onClick={() => { setMutationError(null); setEditingAssignment(assignment) }}>{t('common.edit')}</button><button type="button" className="danger-text" onClick={() => { setMutationError(null); setDeletingAssignment(assignment) }}>{t('common.delete')}</button></div>
            </article>
          ))}
        </div>
      )}
      {mutationError && editingAssignment === undefined && !deletingAssignment && <p className="page-error" role="alert">{mutationError}</p>}

      {editingAssignment !== undefined && <AssignmentFormDialog courses={courses} assignment={editingAssignment} busy={busy} error={mutationError} onClose={closeDialogs} onSubmit={saveAssignment} />}
      {deletingAssignment && <DeleteAssignmentDialog assignment={deletingAssignment} busy={busy} error={mutationError} onCancel={closeDialogs} onConfirm={() => { void confirmDelete() }} />}
    </main>
  )
}
