import { ApiError } from './courses'
import type { Assignment, AssignmentInput, AssignmentUpdateInput } from '../types/assignment'

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

export const listAssignments = (signal?: AbortSignal) =>
  request<Assignment[]>('/assignments', { signal })

export const createAssignment = (input: AssignmentInput) =>
  request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(input) })

export const updateAssignment = (assignmentId: number, input: AssignmentUpdateInput) =>
  request<Assignment>(`/assignments/${assignmentId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const deleteAssignment = (assignmentId: number) =>
  request<void>(`/assignments/${assignmentId}`, { method: 'DELETE' })
