export type ScheduleCourse = {
  id: number
  code: string
  name: string
  color: string
}

export type ScheduleEntry = {
  id: number
  course_id: number
  weekday: number
  start_time: string
  end_time: string
  room: string | null
  created_at: string
  course: ScheduleCourse
}

export type ScheduleEntryInput = {
  course_id: number
  weekday: number
  start_time: string
  end_time: string
  room: string | null
}

export type ScheduleEntryUpdateInput = Partial<ScheduleEntryInput>
