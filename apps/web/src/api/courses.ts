import type { Course, CourseInput, CourseUpdateInput } from '../types/course'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

type ErrorPayload = {
  detail?: string | Array<{ msg?: string }>
}

export class ApiError extends Error {
  readonly status: number

  constructor(
    status: number,
    message: string,
  ) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ErrorPayload
    const detail = Array.isArray(payload.detail)
      ? payload.detail.map((item) => item.msg).filter(Boolean).join(', ')
      : payload.detail
    throw new ApiError(response.status, detail || 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export const listCourses = (signal?: AbortSignal) =>
  request<Course[]>('/courses', { signal })

export const createCourse = (input: CourseInput) =>
  request<Course>('/courses', { method: 'POST', body: JSON.stringify(input) })

export const updateCourse = (courseId: number, input: CourseUpdateInput) =>
  request<Course>(`/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify(input) })

export const deleteCourse = (courseId: number) =>
  request<void>(`/courses/${courseId}`, { method: 'DELETE' })
