import { ApiError } from './courses'
import type { Exam, ExamInput } from '../types/exam'

const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  if (!response.ok) throw new ApiError(response.status, 'Exam request failed')
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
export const listExams = (signal?: AbortSignal) => request<Exam[]>('/exams', { signal })
export const createExam = (input: ExamInput) => request<Exam>('/exams', { method: 'POST', body: JSON.stringify(input) })
export const updateExam = (id: number, input: ExamInput) => request<Exam>(`/exams/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
export const deleteExam = (id: number) => request<void>(`/exams/${id}`, { method: 'DELETE' })
