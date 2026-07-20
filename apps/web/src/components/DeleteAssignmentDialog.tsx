import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { Assignment } from '../types/assignment'

type DeleteAssignmentDialogProps = {
  assignment: Assignment
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteAssignmentDialog({
  assignment,
  busy,
  error,
  onCancel,
  onConfirm,
}: DeleteAssignmentDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  return (
    <div className="modal-backdrop">
      <section className="modal-card confirm-card" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="danger-mark" aria-hidden="true">!</div>
        <h2 id={titleId}>{t('assignments.deleteTitle')}</h2>
        <p>{t('assignments.deleteMessage', { title: assignment.title })}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={busy}>{t('common.cancel')}</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>{busy ? t('assignments.deleting') : t('common.delete')}</button>
        </div>
      </section>
    </div>
  )
}
