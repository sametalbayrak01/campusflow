import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createExam, deleteExam, listExams, updateExam } from '../api/exams'
import { listCourses } from '../api/courses'
import type { Course } from '../types/course'
import type { Exam, ExamInput } from '../types/exam'

const dateValue = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10)

export function ExamsPage() {
  const { t, i18n } = useTranslation()
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [editing, setEditing] = useState<Exam | null | undefined>()
  const [deleting, setDeleting] = useState<Exam | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [values, setValues] = useState<ExamInput>({ course_id: 0, title: '', exam_date: dateValue(), start_time: null, location: null })

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([listCourses(controller.signal), listExams(controller.signal)])
      .then(([courseItems, examItems]) => { setCourses(courseItems); setExams(examItems) })
      .catch(() => setError(true))
    return () => controller.abort()
  }, [])

  const openForm = (exam: Exam | null) => {
    setEditing(exam)
    setValues(exam ? { course_id: exam.course_id, title: exam.title, exam_date: exam.exam_date, start_time: exam.start_time?.slice(0, 5) ?? null, location: exam.location } : { course_id: courses[0]?.id ?? 0, title: '', exam_date: dateValue(), start_time: null, location: null })
  }
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(false)
    try {
      const saved = editing ? await updateExam(editing.id, values) : await createExam(values)
      setExams((current) => [...current.filter((exam) => exam.id !== saved.id), saved].sort((a, b) => a.exam_date.localeCompare(b.exam_date)))
      setEditing(undefined)
    } catch { setError(true) } finally { setBusy(false) }
  }
  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try { await deleteExam(deleting.id); setExams((current) => current.filter((exam) => exam.id !== deleting.id)); setDeleting(null) } catch { setError(true) } finally { setBusy(false) }
  }
  const formatDate = (value: string) => new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))

  return <main className="page-main exams-page">
    <header className="topbar"><div><p className="eyebrow">{t('exams.eyebrow')}</p><h1>{t('exams.title')}</h1><p className="page-description">{t('exams.subtitle')}</p></div><button className="primary-button" type="button" disabled={!courses.length} onClick={() => openForm(null)}><span>＋</span>{t('exams.add')}</button></header>
    {error && editing === undefined && !deleting && <p className="page-error" role="alert">{t('exams.error')}</p>}
    {!courses.length && <div className="state-panel empty-state"><strong>{t('schedule.noCoursesTitle')}</strong><Link className="primary-link" to="/courses">{t('courses.add')}</Link></div>}
    {!!courses.length && !exams.length && <div className="state-panel empty-state"><span className="empty-mark">!</span><strong>{t('exams.empty')}</strong><button className="primary-button" type="button" onClick={() => openForm(null)}>{t('exams.add')}</button></div>}
    <div className="exam-grid">{exams.map((exam) => <article className="exam-card" key={exam.id} style={{ '--course-color': exam.course.color } as React.CSSProperties}><span>{exam.course.code}</span><h2>{exam.title}</h2><time>{formatDate(exam.exam_date)}{exam.start_time ? ` · ${exam.start_time.slice(0, 5)}` : ''}</time><small>{exam.location ?? t('exams.locationMissing')}</small><div><button onClick={() => openForm(exam)}>{t('common.edit')}</button><button className="danger-text" onClick={() => setDeleting(exam)}>{t('common.delete')}</button></div></article>)}</div>
    {editing !== undefined && <div className="modal-backdrop"><section className="modal-card" role="dialog" aria-modal="true"><h2>{t(editing ? 'exams.edit' : 'exams.add')}</h2><form className="course-form" onSubmit={save}><div className="form-grid"><label className="form-wide"><span>{t('exams.name')}</span><input required minLength={2} value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} /></label><label className="form-wide"><span>{t('assignments.course')}</span><select value={values.course_id} onChange={(e) => setValues({ ...values, course_id: Number(e.target.value) })}>{courses.map((c) => <option value={c.id} key={c.id}>{c.code} — {c.name}</option>)}</select></label><label><span>{t('exams.date')}</span><input type="date" required value={values.exam_date} onChange={(e) => setValues({ ...values, exam_date: e.target.value })} /></label><label><span>{t('exams.time')}</span><input type="time" value={values.start_time ?? ''} onChange={(e) => setValues({ ...values, start_time: e.target.value || null })} /></label><label className="form-wide"><span>{t('exams.location')}</span><input value={values.location ?? ''} onChange={(e) => setValues({ ...values, location: e.target.value || null })} /></label></div>{error && <p className="form-error">{t('exams.error')}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditing(undefined)}>{t('common.cancel')}</button><button className="primary-button" disabled={busy}>{t('common.save')}</button></div></form></section></div>}
    {deleting && <div className="modal-backdrop"><section className="modal-card confirm-card" role="alertdialog"><h2>{t('exams.delete')}</h2><p>{deleting.title}</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDeleting(null)}>{t('common.cancel')}</button><button className="danger-button" disabled={busy} onClick={() => { void remove() }}>{t('common.delete')}</button></div></section></div>}
  </main>
}
