export type AssignmentCourse = {
  id: number
  code: string
  name: string
  color: string
}

export type Assignment = {
  id: number
  course_id: number
  title: string
  due_date: string
  completed: boolean
  created_at: string
  course: AssignmentCourse
}

export type AssignmentInput = {
  course_id: number
  title: string
  due_date: string
  completed?: boolean
}

export type AssignmentUpdateInput = Partial<AssignmentInput>
