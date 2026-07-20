import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError, createCourse, deleteCourse, listCourses, updateCourse } from '../api/courses'
import { CourseFormDialog } from '../components/CourseFormDialog'
import { DeleteCourseDialog } from '../components/DeleteCourseDialog'
import type { Course, CourseInput } from '../types/course'

const sortCourses = (courses: Course[]) =>
  [...courses].sort((first, second) => first.code.localeCompare(second.code))

type CourseGridProps = {
  courses: Course[]
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}

function CourseGrid({ courses, onEdit, onDelete }: CourseGridProps) {
  const { t } = useTranslation()
  return (
    <div className="course-grid">
      {courses.map((course) => (
        <article className="course-card" key={course.id} style={{ '--course-color': course.color } as React.CSSProperties}>
          <div className="course-card-top">
            <span className="course-code">{course.code}</span>
            <span className="credit-badge">{t('courses.credits', { count: course.credits })}</span>
          </div>
          <h2>{course.name}</h2>
          <dl>
            <div><dt aria-hidden="true">●</dt><dd>{course.instructor ?? t('courses.instructorMissing')}</dd></div>
            <div><dt aria-hidden="true">⌖</dt><dd>{course.room ?? t('courses.roomMissing')}</dd></div>
          </dl>
          <div className="course-actions">
            <button className="text-button" type="button" onClick={() => onEdit(course)}>{t('common.edit')}</button>
            <button className="text-button danger-text" type="button" onClick={() => onDelete(course)}>{t('common.delete')}</button>
          </div>
        </article>
      ))}
    </div>
  )
}

export function CoursesPage() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [editingCourse, setEditingCourse] = useState<Course | null | undefined>()
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [busy, setBusy] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(false)
    listCourses(controller.signal)
      .then((items) => setCourses(sortCourses(items)))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const messageFor = (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) return t('courses.duplicate')
    if (error instanceof ApiError && error.status === 422) return t('courses.validation')
    return t('courses.requestError')
  }

  const saveCourse = async (input: CourseInput) => {
    setBusy(true)
    setMutationError(null)
    try {
      const saved = editingCourse
        ? await updateCourse(editingCourse.id, input)
        : await createCourse(input)
      setCourses((current) => sortCourses([
        ...current.filter((course) => course.id !== saved.id),
        saved,
      ]))
      setEditingCourse(undefined)
    } catch (error) {
      setMutationError(messageFor(error))
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingCourse) return
    setBusy(true)
    setMutationError(null)
    try {
      await deleteCourse(deletingCourse.id)
      setCourses((current) => current.filter((course) => course.id !== deletingCourse.id))
      setDeletingCourse(null)
    } catch (error) {
      setMutationError(messageFor(error))
    } finally {
      setBusy(false)
    }
  }

  const openCreate = () => {
    setMutationError(null)
    setEditingCourse(null)
  }

  const closeDialogs = () => {
    if (busy) return
    setMutationError(null)
    setEditingCourse(undefined)
    setDeletingCourse(null)
  }

  return (
    <main className="page-main courses-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">{t('courses.eyebrow')}</p>
          <h1>{t('courses.title')}</h1>
          <p className="page-description">{t('courses.subtitle')}</p>
        </div>
        <button className="primary-button" type="button" onClick={openCreate}>
          <span>＋</span>{t('courses.add')}
        </button>
      </header>

      {loading && <div className="state-panel" role="status"><span className="spinner" />{t('courses.loading')}</div>}
      {!loading && loadError && (
        <div className="state-panel" role="alert">
          <strong>{t('courses.loadError')}</strong>
          <button className="secondary-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>
            {t('common.retry')}
          </button>
        </div>
      )}
      {!loading && !loadError && courses.length === 0 && (
        <div className="state-panel empty-state">
          <span className="empty-mark" aria-hidden="true">◇</span>
          <strong>{t('courses.emptyTitle')}</strong>
          <p>{t('courses.emptyText')}</p>
          <button className="primary-button" type="button" onClick={openCreate}>{t('courses.add')}</button>
        </div>
      )}
      {!loading && !loadError && courses.length > 0 && (
        <CourseGrid
          courses={courses}
          onEdit={(course) => { setMutationError(null); setEditingCourse(course) }}
          onDelete={(course) => { setMutationError(null); setDeletingCourse(course) }}
        />
      )}

      {editingCourse !== undefined && (
        <CourseFormDialog
          course={editingCourse}
          busy={busy}
          error={mutationError}
          onClose={closeDialogs}
          onSubmit={saveCourse}
        />
      )}
      {deletingCourse && (
        <DeleteCourseDialog
          course={deletingCourse}
          busy={busy}
          error={mutationError}
          onCancel={closeDialogs}
          onConfirm={() => { void confirmDelete() }}
        />
      )}
    </main>
  )
}
