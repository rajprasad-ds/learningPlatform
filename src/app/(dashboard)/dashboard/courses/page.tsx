export const dynamic = 'force-dynamic'
import { getEnrolledCourses } from '@/actions/course-actions'
import CourseList from './course-list'

export default async function MyCoursesPage() {
    const courses = await getEnrolledCourses()

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                <p className="text-muted-foreground">
                    Continue your learning journey
                </p>
            </div>

            <CourseList courses={courses} />
        </div>
    )
}
