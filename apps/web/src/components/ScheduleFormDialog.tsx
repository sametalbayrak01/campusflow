import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Course } from '../types/course'
import type { ScheduleEntry, ScheduleEntryInput } from '../types/schedule'

type ScheduleFormDialogProps = {
  courses: Course[]
  entry: ScheduleEntry | null
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: ScheduleEntryInput) => Promise<void>
}

type FormValues = {
  courseId: string
  weekday: string
  startTime: string
  endTime: string
  room: string
}

export function ScheduleFormDialog({
  courses,
  entry,
  busy,
  error,
  onClose,
  onSubmit,
}: ScheduleFormDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const [values, setValues] = useState<FormValues>(() => ({
    courseId: String(entry?.course_id ?? courses[0]?.id ?? ''),
    weekday: String(entry?.weekday ?? 0),
    startTime: entry?.start_time.slice(0, 5) ?? '09:00',
    endTime: entry?.end_time.slice(0, 5) ?? '10:00',
    room: entry?.room ?? '',
  }))

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busy, onClose])

  const changeField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit({
      course_id: Number(values.courseId),
      weekday: Number(values.weekday),
      start_time: values.startTime,
      end_time: values.endTime,
      room: values.room.trim() || null,
    })
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{t('schedule.eyebrow')}</p>
            <h2 id={titleId}>{t(entry ? 'schedule.editTitle' : 'schedule.addTitle')}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} disabled={busy} aria-label={t('common.cancel')}>×</button>
        </div>
        <form className="course-form" onSubmit={submit}>
          <div className="form-grid schedule-form-grid">
            <label className="form-wide">
              <span>{t('schedule.course')}</span>
              <select name="courseId" value={values.courseId} onChange={changeField} required autoFocus>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}
              </select>
            </label>
            <label className="form-wide">
              <span>{t('schedule.weekday')}</span>
              <select name="weekday" value={values.weekday} onChange={changeField} required>
                {Array.from({ length: 7 }, (_, weekday) => (
                  <option key={weekday} value={weekday}>{t(`weekday.${weekday}`)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('schedule.startTime')}</span>
              <input name="startTime" type="time" value={values.startTime} onChange={changeField} required />
            </label>
            <label>
              <span>{t('schedule.endTime')}</span>
              <input name="endTime" type="time" value={values.endTime} onChange={changeField} required />
            </label>
            <label className="form-wide">
              <span>{t('form.room')} <small>{t('form.optional')}</small></span>
              <input name="room" value={values.room} onChange={changeField} maxLength={50} />
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose} disabled={busy}>{t('common.cancel')}</button>
            <button className="primary-button" type="submit" disabled={busy || courses.length === 0}>{busy ? t('common.saving') : t('common.save')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
