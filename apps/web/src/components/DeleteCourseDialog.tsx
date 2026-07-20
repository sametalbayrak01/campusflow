import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { Course } from '../types/course'

type DeleteCourseDialogProps = {
  course: Course
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteCourseDialog({
  course,
  busy,
  error,
  onCancel,
  onConfirm,
}: DeleteCourseDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()

  return (
    <div className="modal-backdrop">
      <section className="modal-card confirm-card" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="danger-mark" aria-hidden="true">!</div>
        <h2 id={titleId}>{t('courses.deleteTitle')}</h2>
        <p>{t('courses.deleteMessage', { code: course.code })}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={busy}>{t('common.cancel')}</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? t('courses.deleting') : t('common.delete')}
          </button>
        </div>
      </section>
    </div>
  )
}
