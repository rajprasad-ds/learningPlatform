import { create } from 'zustand'
import { createVideoEntry, updateLessonVideo } from '@/actions/video-actions'

interface UploadState {
    isUploading: boolean
    progress: number
    status: 'idle' | 'uploading' | 'processing' | 'success' | 'error' | 'cancelled'
    error: string | null
    file: File | null
    lessonId: string | null
    lessonTitle: string | null
    courseTitle: string | null
    moduleTitle: string | null
    originPath: string | null
    xhr: XMLHttpRequest | null
    isMinimized: boolean

    // Actions
    startUpload: (file: File, details: { lessonId: string, lessonTitle: string, courseTitle: string, moduleTitle: string, chapters: any[], originPath: string }) => Promise<void>
    cancelUpload: () => void
    minimize: (value: boolean) => void
    reset: () => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
    isUploading: false,
    progress: 0,
    status: 'idle',
    error: null,
    file: null,
    lessonId: null,
    lessonTitle: null,
    courseTitle: null,
    moduleTitle: null,
    originPath: null,
    xhr: null,
    isMinimized: false,

    startUpload: async (file, details) => {
        set({
            isUploading: true,
            progress: 0,
            status: 'uploading',
            error: null,
            file,
            lessonId: details.lessonId,
            lessonTitle: details.lessonTitle,
            courseTitle: details.courseTitle,
            moduleTitle: details.moduleTitle,
            originPath: details.originPath,
            isMinimized: false
        })

        try {
            // 1. Create Video Entry
            const videoTitle = `${details.courseTitle} - ${details.moduleTitle} - ${details.lessonTitle}`
            const { videoId, success: createSuccess } = await createVideoEntry(videoTitle)

            if (!createSuccess || !videoId) {
                throw new Error('Failed to initialize upload')
            }

            // 2. Upload File via XHR
            const xhr = new XMLHttpRequest()
            set({ xhr })

            await new Promise<void>((resolve, reject) => {
                xhr.open('PUT', `/api/upload?videoId=${videoId}`)

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100
                        set({ progress: Math.round(percentComplete) })
                    }
                }

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        set({ status: 'processing', progress: 100 })
                        // 3. Update Lesson Record
                        await updateLessonVideo(details.lessonId, videoId, details.chapters)
                        set({ status: 'success', isUploading: false })
                        resolve()
                    } else {
                        const errorMsg = `Upload failed with status ${xhr.status}: ${xhr.responseText}`
                        console.error(errorMsg)
                        reject(new Error(errorMsg))
                    }
                }

                xhr.onerror = () => reject(new Error('Network error'))
                xhr.onabort = () => reject(new Error('Upload cancelled'))

                xhr.send(file)
            })

        } catch (error: any) {
            if (error.message === 'Upload cancelled') {
                set({ status: 'cancelled', isUploading: false, progress: 0 })
            } else {
                console.error(error)
                set({
                    status: 'error',
                    error: error.message || 'Failed to upload video',
                    isUploading: false
                })
            }
        }
    },

    cancelUpload: () => {
        const { xhr } = get()
        if (xhr) {
            xhr.abort()
        }
        // Don't reset everything immediately, just set status to cancelled
        // The UI will handle the "reset" after showing the feedback
        set({
            isUploading: false,
            status: 'cancelled',
            xhr: null
            // Keep file/lessonTitle for context in the UI
        })
    },

    minimize: (value) => set({ isMinimized: value }),

    reset: () => set({
        isUploading: false,
        progress: 0,
        status: 'idle',
        error: null,
        file: null,
        lessonId: null,
        lessonTitle: null,
        originPath: null,
        xhr: null
    })
}))
