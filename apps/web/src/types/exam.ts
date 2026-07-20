export type Exam = { id: number; course_id: number; title: string; exam_date: string; start_time: string | null; location: string | null; created_at: string; course: { id: number; code: string; name: string; color: string } }
export type ExamInput = { course_id: number; title: string; exam_date: string; start_time: string | null; location: string | null }
