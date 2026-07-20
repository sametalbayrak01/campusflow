import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError, listCourses } from '../api/courses'
import {
  createScheduleEntry,
  deleteScheduleEntry,
  listSchedule,
  updateScheduleEntry,
} from '../api/schedule'
import { ScheduleFormDialog } from '../components/ScheduleFormDialog'
import type { Course } from '../types/course'
import type { ScheduleEntry, ScheduleEntryInput } from '../types/schedule'

const sortEntries = (entries: ScheduleEntry[]) => [...entries].sort((first, second) =>
  first.weekday - second.weekday || first.start_time.localeCompare(second.start_time),
)

export function SchedulePage() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState<Course[]>([])
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null | undefined>()
  const [busy, setBusy] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(false)
    Promise.all([listCourses(controller.signal), listSchedule(controller.signal)])
      .then(([courseItems, scheduleItems]) => {
        setCourses(courseItems)
        setEntries(sortEntries(scheduleItems))
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const messageFor = (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) return t('schedule.conflict')
    if (error instanceof ApiError && error.status === 422) return t('schedule.validation')
    return t('schedule.requestError')
  }

  const saveEntry = async (input: ScheduleEntryInput) => {
    setBusy(true)
    setMutationError(null)
    try {
      const saved = editingEntry
        ? await updateScheduleEntry(editingEntry.id, input)
        : await createScheduleEntry(input)
      setEntries((current) => sortEntries([
        ...current.filter((entry) => entry.id !== saved.id),
        saved,
      ]))
      setEditingEntry(undefined)
    } catch (error) {
      setMutationError(messageFor(error))
    } finally {
      setBusy(false)
    }
  }

  const removeEntry = async (entry: ScheduleEntry) => {
    setBusy(true)
    setMutationError(null)
    try {
      await deleteScheduleEntry(entry.id)
      setEntries((current) => current.filter((item) => item.id !== entry.id))
    } catch (error) {
      setMutationError(messageFor(error))
    } finally {
      setBusy(false)
    }
  }

  const closeDialog = () => {
    if (busy) return
    setEditingEntry(undefined)
    setMutationError(null)
  }

  return (
    <main className="page-main schedule-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">{t('schedule.eyebrow')}</p>
          <h1>{t('schedule.title')}</h1>
          <p className="page-description">{t('schedule.subtitle')}</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setEditingEntry(null)} disabled={courses.length === 0}>
          <span>＋</span>{t('schedule.add')}
        </button>
      </header>

      {loading && <div className="state-panel" role="status"><span className="spinner" />{t('schedule.loading')}</div>}
      {!loading && loadError && (
        <div className="state-panel" role="alert">
          <strong>{t('schedule.loadError')}</strong>
          <button className="secondary-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>{t('common.retry')}</button>
        </div>
      )}
      {!loading && !loadError && courses.length === 0 && (
        <div className="state-panel empty-state">
          <span className="empty-mark" aria-hidden="true">◇</span>
          <strong>{t('schedule.noCoursesTitle')}</strong>
          <p>{t('schedule.noCoursesText')}</p>
          <Link className="primary-link" to="/courses">{t('courses.add')}</Link>
        </div>
      )}
      {!loading && !loadError && courses.length > 0 && entries.length === 0 && (
        <div className="state-panel empty-state">
          <span className="empty-mark" aria-hidden="true">▦</span>
          <strong>{t('schedule.emptyTitle')}</strong>
          <p>{t('schedule.emptyText')}</p>
          <button className="primary-button" type="button" onClick={() => setEditingEntry(null)}>{t('schedule.add')}</button>
        </div>
      )}
      {!loading && !loadError && entries.length > 0 && (
        <div className="weekly-schedule">
          {Array.from({ length: 7 }, (_, weekday) => {
            const dayEntries = entries.filter((entry) => entry.weekday === weekday)
            return (
              <section className="schedule-day" key={weekday}>
                <div className="schedule-day-heading">
                  <h2>{t(`weekday.${weekday}`)}</h2>
                  <span>{dayEntries.length}</span>
                </div>
                {dayEntries.length === 0 && <p className="schedule-day-empty">{t('schedule.freeDay')}</p>}
                {dayEntries.map((entry) => (
                  <article className="schedule-entry-card" key={entry.id} style={{ '--course-color': entry.course.color } as React.CSSProperties}>
                    <div className="schedule-entry-time"><strong>{entry.start_time.slice(0, 5)}</strong><span>{entry.end_time.slice(0, 5)}</span></div>
                    <div className="schedule-entry-copy"><span>{entry.course.code}</span><h3>{entry.course.name}</h3><small>{entry.room ?? t('courses.roomMissing')}</small></div>
                    <div className="schedule-entry-actions">
                      <button type="button" onClick={() => { setMutationError(null); setEditingEntry(entry) }}>{t('common.edit')}</button>
                      <button type="button" className="danger-text" onClick={() => { void removeEntry(entry) }} disabled={busy}>{t('common.delete')}</button>
                    </div>
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      )}

      {editingEntry !== undefined && (
        <ScheduleFormDialog
          courses={courses}
          entry={editingEntry}
          busy={busy}
          error={mutationError}
          onClose={closeDialog}
          onSubmit={saveEntry}
        />
      )}
    </main>
  )
}
