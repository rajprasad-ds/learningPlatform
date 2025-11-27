'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, ArrowLeft, Check, Zap, AlertCircle } from 'lucide-react'
import { signInWithEmail, signInWithGoogle } from '../../../actions/auth-actions'

type Step = 'initial' | 'email' | 'password'

export default function LoginPage() {
    const [step, setStep] = useState<Step>('initial')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setError(null)
        setStep('password')
    }

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const result = await signInWithEmail(email, password)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
        // On success, signInWithEmail redirects to /dashboard
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError(null)
        await signInWithGoogle()
        // signInWithGoogle redirects to Google OAuth
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[800px]"
            >
                <Card className="bg-card/95 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden grid md:grid-cols-2 min-h-[450px] p-0">

                    {/* LEFT SIDE: Branding & Info */}
                    <div className="bg-secondary/30 p-12 flex flex-col justify-between relative overflow-hidden self-stretch">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">Invincible Mechanics</span>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 text-foreground">
                                Master the <br />
                                <span className="text-purple-600">Unbreakable.</span>
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Join the elite circle of engineers building the future.
                            </p>
                        </div>

                        {/* Abstract Decoration */}
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
                        <div className="absolute top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                    </div>

                    {/* RIGHT SIDE: Form */}
                    <div className="p-12 flex flex-col justify-center relative">

                        {/* Back Button */}
                        {step !== 'initial' && (
                            <button
                                onClick={() => setStep(step === 'password' ? 'email' : 'initial')}
                                className="absolute top-8 left-8 p-2 -ml-2 rounded-full hover:bg-secondary/50 text-muted-foreground transition-colors z-10"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}

                        <div className="max-w-[320px] mx-auto w-full">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-2">
                                    {step === 'initial' && "Sign in"}
                                    {step === 'email' && "Sign in"}
                                    {step === 'password' && "Welcome back"}
                                </h2>
                                <div className="text-muted-foreground">
                                    {step === 'initial' && "to continue to Invincible Mechanics"}
                                    {step === 'email' && "Enter your email"}
                                    {step === 'password' && (
                                        <div className="flex items-center gap-2 mt-1 bg-secondary/50 py-1 px-3 rounded-full w-fit text-sm">
                                            <span>{email}</span>
                                            <Check className="w-3 h-3 text-green-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-500">{error}</p>
                                </div>
                            )}

                            <AnimatePresence mode="wait">

                                {/* STEP 1: INITIAL */}
                                {step === 'initial' && (
                                    <motion.div
                                        key="initial"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 text-base font-normal bg-white dark:bg-secondary/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-secondary/80 hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.98] justify-start px-6 relative overflow-hidden group transition-all duration-200"
                                            onClick={handleGoogleSignIn}
                                            disabled={isLoading}
                                        >
                                            <svg className="w-5 h-5 mr-4" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Google"}
                                        </Button>

                                        <div className="flex items-center gap-4 py-2">
                                            <div className="h-px bg-border flex-1" />
                                            <span className="text-xs uppercase text-muted-foreground">or</span>
                                            <div className="h-px bg-border flex-1" />
                                        </div>

                                        <Button
                                            variant="ghost"
                                            className="w-full text-purple-600 hover:text-purple-500 hover:bg-purple-500/10"
                                            onClick={() => setStep('email')}
                                        >
                                            Continue with Email
                                        </Button>
                                    </motion.div>
                                )}

                                {/* STEP 2: EMAIL */}
                                {step === 'email' && (
                                    <motion.div
                                        key="email"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="sr-only">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Email address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-12 bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next"}
                                                </Button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* STEP 3: PASSWORD */}
                                {step === 'password' && (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <form onSubmit={handleFinalSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="sr-only">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="h-12 bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <Link href="#" className="text-sm text-purple-500 hover:underline">
                                                    Forgot password?
                                                </Link>
                                                <Button
                                                    type="submit"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                                </Button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                            </AnimatePresence>

                            {step === 'initial' && (
                                <div className="mt-8 text-center text-sm text-muted-foreground">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/signup" className="text-purple-600 hover:underline font-medium">
                                        Create account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
