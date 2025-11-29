'use client'

import { useState } from 'react'
import { purchaseCourse } from '@/actions/course-actions'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface EnrollButtonProps {
    courseId: string
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleEnroll() {
        setIsLoading(true)
        try {
            const result = await purchaseCourse(courseId)

            if (result.success) {
                // Handle Free Course (Instant Enrollment)
                if (!result.orderId) {
                    router.refresh()
                    return
                }

                // Handle Paid Course (Razorpay)
                const options = {
                    key: result.key,
                    amount: result.amount,
                    currency: result.currency,
                    name: "Learning Platform",
                    description: result.course.name,
                    order_id: result.orderId,
                    handler: async function (response: RazorpayResponse) {
                        try {
                            const verifyRes = await fetch('/api/payments/verify', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    userId: result.user.id,
                                    courseId: courseId
                                }),
                            })

                            const verifyData = await verifyRes.json()

                            if (verifyData.success) {
                                router.refresh()
                            } else {
                                alert('Payment verification failed')
                            }
                        } catch (err) {
                            console.error(err)
                            alert('Payment verification failed')
                        }
                    },
                    prefill: {
                        name: result.user.name,
                        email: result.user.email,
                        contact: result.user.contact,
                    },
                    theme: {
                        color: "#9333ea",
                    },
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
            } else {
                alert('Failed to initiate payment')
            }
        } catch (error) {
            console.error(error)
            alert('Enrollment failed.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <button
                onClick={handleEnroll}
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Enroll Now'
                )}
            </button>
        </>
    )
}
