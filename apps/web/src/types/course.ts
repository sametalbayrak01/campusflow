export type Course = {
  id: number
  code: string
  name: string
  instructor: string | null
  room: string | null
  color: string
  credits: number
  created_at: string
}

export type CourseInput = {
  code: string
  name: string
  instructor: string | null
  room: string | null
  color: string
  credits: number
}

export type CourseUpdateInput = Partial<CourseInput>
