import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Course, CourseInput } from '../types/course'

type CourseFormDialogProps = {
  course: Course | null
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: CourseInput) => Promise<void>
}

type FormValues = {
  code: string
  name: string
  instructor: string
  room: string
  color: string
  credits: string
}

const emptyValues: FormValues = {
  code: '',
  name: '',
  instructor: '',
  room: '',
  color: '#6853d7',
  credits: '3',
}

export function CourseFormDialog({
  course,
  busy,
  error,
  onClose,
  onSubmit,
}: CourseFormDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const [values, setValues] = useState<FormValues>(() => course ? {
    code: course.code,
    name: course.name,
    instructor: course.instructor ?? '',
    room: course.room ?? '',
    color: course.color,
    credits: String(course.credits),
  } : emptyValues)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busy, onClose])

  const changeField = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit({
      code: values.code,
      name: values.name,
      instructor: values.instructor.trim() || null,
      room: values.room.trim() || null,
      color: values.color,
      credits: Number(values.credits),
    })
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{t('courses.eyebrow')}</p>
            <h2 id={titleId}>{t(course ? 'courses.editTitle' : 'courses.addTitle')}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} disabled={busy} aria-label={t('common.cancel')}>×</button>
        </div>
        <form className="course-form" onSubmit={submit}>
          <div className="form-grid">
            <label>
              <span>{t('form.code')}</span>
              <input name="code" value={values.code} onChange={changeField} minLength={2} maxLength={20} required autoFocus />
            </label>
            <label>
              <span>{t('form.credits')}</span>
              <input name="credits" type="number" value={values.credits} onChange={changeField} min={1} max={30} required />
            </label>
            <label className="form-wide">
              <span>{t('form.name')}</span>
              <input name="name" value={values.name} onChange={changeField} minLength={2} maxLength={120} required />
            </label>
            <label>
              <span>{t('form.instructor')} <small>{t('form.optional')}</small></span>
              <input name="instructor" value={values.instructor} onChange={changeField} maxLength={100} />
            </label>
            <label>
              <span>{t('form.room')} <small>{t('form.optional')}</small></span>
              <input name="room" value={values.room} onChange={changeField} maxLength={50} />
            </label>
            <label>
              <span>{t('form.color')}</span>
              <span className="color-field">
                <input name="color" type="color" value={values.color} onChange={changeField} />
                <output>{values.color.toUpperCase()}</output>
              </span>
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
