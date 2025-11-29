'use client'

import { useState } from 'react'
import { addComment } from '@/actions/comment-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Comment {
    id: string
    content: string
    created_at: string
    timestamp?: number
    user_id: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
        role: string | null
    }
}

interface CommentSectionProps {
    lessonId: string
    comments: Comment[]
    currentUser: any
    currentTime?: number
    onTimestampClick?: (time: number) => void
}

function formatRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
}

export function CommentSection({
    lessonId,
    comments: initialComments,
    currentUser,
    currentTime,
    onTimestampClick
}: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [includeTimestamp, setIncludeTimestamp] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (!newComment.trim()) return

        setIsSubmitting(true)
        try {
            const timestamp = includeTimestamp && currentTime ? Math.floor(currentTime) : undefined
            await addComment(lessonId, newComment, timestamp)

            setNewComment('')
            setIncludeTimestamp(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to post comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-6">
            {/* Input Area */}
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                <div className="flex gap-4">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
                        <AvatarFallback>{currentUser?.user_metadata?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                        <Textarea
                            placeholder="Ask a question or share your thoughts..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px] bg-white dark:bg-black border-gray-200 dark:border-zinc-800 focus-visible:ring-purple-500"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {currentTime !== undefined && (
                                    <button
                                        onClick={() => setIncludeTimestamp(!includeTimestamp)}
                                        className={`
                                            flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors
                                            ${includeTimestamp
                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400'
                                            }
                                        `}
                                    >
                                        <Clock className="w-3 h-3" />
                                        {includeTimestamp ? `At ${formatTime(currentTime)}` : 'Link current time'}
                                    </button>
                                )}
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || isSubmitting}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Post Comment
                                        <Send className="w-3 h-3 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No questions yet. Be the first to ask!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <Avatar className="w-8 h-8 mt-1">
                                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                                <AvatarFallback>{comment.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {comment.profiles.full_name}
                                    </span>
                                    {comment.profiles.role === 'teacher' && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-full">
                                            TEACHER
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatRelativeTime(comment.created_at)}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {comment.content}
                                </div>

                                {comment.timestamp !== null && comment.timestamp !== undefined && (
                                    <button
                                        onClick={() => onTimestampClick?.(comment.timestamp!)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline mt-1"
                                    >
                                        <Clock className="w-3 h-3" />
                                        Jump to {formatTime(comment.timestamp)}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
