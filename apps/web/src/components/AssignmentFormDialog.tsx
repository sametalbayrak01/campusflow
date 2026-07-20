import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Course } from '../types/course'
import type { AssignmentInput } from '../types/assignment'

type AssignmentFormDialogProps = {
  courses: Course[]
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: AssignmentInput) => Promise<void>
}

const localDateValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function AssignmentFormDialog({
  courses,
  busy,
  error,
  onClose,
  onSubmit,
}: AssignmentFormDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const [courseId, setCourseId] = useState(String(courses[0]?.id ?? ''))
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(localDateValue(new Date()))

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busy, onClose])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit({ course_id: Number(courseId), title, due_date: dueDate })
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-heading">
          <div><p className="eyebrow">{t('assignments.eyebrow')}</p><h2 id={titleId}>{t('assignments.addTitle')}</h2></div>
          <button className="close-button" type="button" onClick={onClose} disabled={busy} aria-label={t('common.cancel')}>×</button>
        </div>
        <form className="course-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="form-wide">
              <span>{t('assignments.title')}</span>
              <input value={title} onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)} minLength={2} maxLength={160} required autoFocus />
            </label>
            <label className="form-wide">
              <span>{t('assignments.course')}</span>
              <select value={courseId} onChange={(event) => setCourseId(event.target.value)} required>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}
              </select>
            </label>
            <label className="form-wide">
              <span>{t('assignments.dueDate')}</span>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose} disabled={busy}>{t('common.cancel')}</button>
            <button className="primary-button" type="submit" disabled={busy}>{busy ? t('common.saving') : t('common.save')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
