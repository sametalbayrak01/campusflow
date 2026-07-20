import { ApiError } from './courses'
import type {
  ScheduleEntry,
  ScheduleEntryInput,
  ScheduleEntryUpdateInput,
} from '../types/schedule'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

type ErrorPayload = {
  detail?: string | Array<{ msg?: string }>
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

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const listSchedule = (signal?: AbortSignal) =>
  request<ScheduleEntry[]>('/schedule', { signal })

export const createScheduleEntry = (input: ScheduleEntryInput) =>
  request<ScheduleEntry>('/schedule', { method: 'POST', body: JSON.stringify(input) })

export const updateScheduleEntry = (entryId: number, input: ScheduleEntryUpdateInput) =>
  request<ScheduleEntry>(`/schedule/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const deleteScheduleEntry = (entryId: number) =>
  request<void>(`/schedule/${entryId}`, { method: 'DELETE' })
