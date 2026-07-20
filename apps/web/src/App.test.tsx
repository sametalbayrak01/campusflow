import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import i18n from './i18n'
import type { Course, CourseInput } from './types/course'
import type { ScheduleEntry, ScheduleEntryInput } from './types/schedule'

const sampleCourse: Course = {
  id: 1,
  code: 'CENG 301',
  name: 'Algorithms',
  instructor: 'Ada Lovelace',
  room: 'B-204',
  color: '#6853d7',
  credits: 4,
  created_at: '2026-07-20T10:00:00',
}

const sampleScheduleEntry: ScheduleEntry = {
  id: 1,
  course_id: sampleCourse.id,
  weekday: 0,
  start_time: '09:00:00',
  end_time: '10:00:00',
  room: 'B-204',
  created_at: '2026-07-20T10:00:00',
  course: {
    id: sampleCourse.id,
    code: sampleCourse.code,
    name: sampleCourse.name,
    color: sampleCourse.color,
  },
}

const jsonResponse = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function installCourseApi(initialCourses: Course[]) {
  let courses = [...initialCourses]
  const fetchMock = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
    const path = String(input)
    const method = options?.method ?? 'GET'

    if (path === '/api/courses' && method === 'GET') return jsonResponse(courses)
    if (path === '/api/courses' && method === 'POST') {
      const values = JSON.parse(String(options?.body)) as CourseInput
      const created = { ...values, id: 2, created_at: '2026-07-20T11:00:00' }
      courses = [...courses, created]
      return jsonResponse(created, 201)
    }
    if (path === '/api/courses/1' && method === 'PATCH') {
      const changes = JSON.parse(String(options?.body)) as Partial<Course>
      courses = courses.map((course) => course.id === 1 ? { ...course, ...changes } : course)
      return jsonResponse(courses.find((course) => course.id === 1))
    }
    if (path === '/api/courses/1' && method === 'DELETE') {
      courses = courses.filter((course) => course.id !== 1)
      return new Response(null, { status: 204 })
    }
    return jsonResponse({ detail: 'Not found' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function installScheduleApi(initialEntries: ScheduleEntry[] = []) {
  let entries = [...initialEntries]
  const fetchMock = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
    const path = String(input)
    const method = options?.method ?? 'GET'

    if (path === '/api/courses' && method === 'GET') return jsonResponse([sampleCourse])
    if (path === '/api/schedule' && method === 'GET') return jsonResponse(entries)
    if (path === '/api/schedule' && method === 'POST') {
      const values = JSON.parse(String(options?.body)) as ScheduleEntryInput
      const created: ScheduleEntry = {
        ...values,
        id: 2,
        created_at: '2026-07-20T11:00:00',
        course: sampleScheduleEntry.course,
      }
      entries = [...entries, created]
      return jsonResponse(created, 201)
    }
    if (path === '/api/schedule/1' && method === 'PATCH') {
      const changes = JSON.parse(String(options?.body)) as Partial<ScheduleEntry>
      entries = entries.map((entry) => entry.id === 1 ? { ...entry, ...changes } : entry)
      return jsonResponse(entries.find((entry) => entry.id === 1))
    }
    if (path === '/api/schedule/1' && method === 'DELETE') {
      entries = entries.filter((entry) => entry.id !== 1)
      return new Response(null, { status: 204 })
    }
    return jsonResponse({ detail: 'Not found' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('CampusFlow web application', () => {
  beforeEach(async () => {
    window.history.pushState({}, '', '/')
    localStorage.clear()
    await i18n.changeLanguage('tr')
    vi.unstubAllGlobals()
  })

  it('starts in Turkish and persists a language change', async () => {
    installCourseApi([])
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Gösterge paneli')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('tr')

    await user.selectOptions(screen.getByLabelText('Dil'), 'en')

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(localStorage.getItem('campusflow.locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('shows the active course count loaded from the API', async () => {
    installCourseApi([sampleCourse])
    render(<App />)

    const activeCoursesLabel = screen.getByText('Aktif ders')
    const statCard = activeCoursesLabel.closest('article')

    expect(statCard).not.toBeNull()
    await waitFor(() => expect(within(statCard as HTMLElement).getByText('1')).toBeInTheDocument())
  })

  it('creates a weekly schedule entry', async () => {
    window.history.pushState({}, '', '/schedule')
    installScheduleApi()
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('Haftan henüz boş')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Ders saati ekle' })[0])
    await user.selectOptions(screen.getByLabelText('Gün'), '2')
    fireEvent.change(screen.getByLabelText('Başlangıç'), { target: { value: '09:30' } })
    fireEvent.change(screen.getByLabelText('Bitiş'), { target: { value: '11:00' } })
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Algorithms')).toBeInTheDocument()
    expect(screen.getByText('09:30')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Çarşamba' })).toBeInTheDocument()
  })

  it('shows a localized schedule conflict error', async () => {
    window.history.pushState({}, '', '/schedule')
    const fetchMock = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      if (String(input) === '/api/courses') return jsonResponse([sampleCourse])
      if ((options?.method ?? 'GET') === 'GET') return jsonResponse([])
      return jsonResponse({ detail: 'Schedule entry conflicts with an existing course' }, 409)
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Haftan henüz boş')
    await user.click(screen.getAllByRole('button', { name: 'Ders saati ekle' })[0])
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Bu saat aynı gündeki başka bir dersle çakışıyor.',
    )
  })

  it('shows a load error and retries the course request', async () => {
    window.history.pushState({}, '', '/courses')
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ detail: 'Unavailable' }, 503))
      .mockResolvedValueOnce(jsonResponse([sampleCourse]))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('Dersler yüklenemedi.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tekrar dene' }))

    expect(await screen.findByText('Algorithms')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('creates a course from the empty state', async () => {
    window.history.pushState({}, '', '/courses')
    installCourseApi([])
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('Henüz ders yok')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Ders ekle' })[0])
    await user.type(screen.getByLabelText('Ders kodu'), 'math 204')
    await user.type(screen.getByLabelText('Ders adı'), 'Linear Algebra')
    await user.type(screen.getByLabelText(/Öğretim görevlisi/), 'Emmy Noether')
    await user.type(screen.getByLabelText(/Derslik/), 'A-112')
    await user.clear(screen.getByLabelText('Kredi'))
    await user.type(screen.getByLabelText('Kredi'), '5')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Linear Algebra')).toBeInTheDocument()
    expect(screen.getByText('5 kredi')).toBeInTheDocument()
  })

  it('edits and deletes an existing course', async () => {
    window.history.pushState({}, '', '/courses')
    installCourseApi([sampleCourse])
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('Algorithms')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Düzenle' }))
    const nameInput = screen.getByLabelText('Ders adı')
    await user.clear(nameInput)
    await user.type(nameInput, 'Advanced Algorithms')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Advanced Algorithms')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sil' }))
    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText('CENG 301 kalıcı olarak silinecek.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))

    await waitFor(() => expect(screen.queryByText('Advanced Algorithms')).not.toBeInTheDocument())
    expect(screen.getByText('Henüz ders yok')).toBeInTheDocument()
  })

  it('shows a localized duplicate-code error in the form', async () => {
    window.history.pushState({}, '', '/courses')
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, options?: RequestInit) => {
      if ((options?.method ?? 'GET') === 'GET') return jsonResponse([])
      return jsonResponse({ detail: 'A course with this code already exists' }, 409)
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Henüz ders yok')
    await user.click(screen.getAllByRole('button', { name: 'Ders ekle' })[0])
    await user.type(screen.getByLabelText('Ders kodu'), 'CENG 301')
    await user.type(screen.getByLabelText('Ders adı'), 'Algorithms')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Bu koda sahip bir ders zaten var.')
  })
})
