import { createClient } from '@/lib/supabase/server'
import { getCourseModules } from '@/actions/video-actions'
import { CurriculumBuilder } from '@/components/teacher/curriculum-builder'
import { PublishButton } from '@/components/teacher/publish-button'
import { CourseSettingsForm } from '@/components/teacher/course-settings-form'
import Link from 'next/link'
import { ChevronLeft, Eye, LayoutList, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CourseEditorProps {
    params: Promise<{ id: string }>
}

export default async function CourseEditorPage({ params }: CourseEditorProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch course details
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

    if (!course) {
        return <div>Course not found</div>
    }

    // Fetch modules and lessons
    const modules = await getCourseModules(id)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/teacher/courses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Courses
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.is_published
                            ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                            }`}>
                            {course.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span>•</span>
                        <span>${course.price}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/courses/${course.id}`} target="_blank">
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium">
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                    </Link>
                    <PublishButton courseId={course.id} isPublished={course.is_published} />
                </div>
            </div>

            <Tabs defaultValue="curriculum" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="curriculum" className="flex items-center gap-2">
                        <LayoutList className="w-4 h-4" />
                        Curriculum
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum">
                    {/* Curriculum Builder */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Curriculum</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Organize your course into modules and lessons.</p>
                        </div>

                        <CurriculumBuilder
                            courseId={course.id}
                            initialModules={modules}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <CourseSettingsForm course={course} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
