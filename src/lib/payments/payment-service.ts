import { createClient } from '@/lib/supabase/server'

export class PaymentService {
    /**
     * Process a payment for a course.
     * In a real application, this would interact with Stripe/PayPal API.
     * For now, it simulates a successful payment and records it in the database.
     */
    static async processPayment(userId: string, courseId: string, amount: number) {
        const supabase = await createClient()

        // 1. Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 2. Record payment in database
        const { data: payment, error } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                course_id: courseId,
                amount: amount,
                status: 'completed',
                provider_id: `sim_${Date.now()}`, // Simulated provider ID
                metadata: {
                    source: 'simulation',
                    timestamp: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (error) {
            console.error('Payment recording failed:', error)
            throw new Error('Payment failed')
        }

        return payment
    }

    /**
     * Verify if a user has purchased a course.
     * This can be used as an extra check besides enrollment.
     */
    static async verifyPurchase(userId: string, courseId: string) {
        const supabase = await createClient()

        const { data } = await supabase
            .from('payments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('status', 'completed')
            .single()

        return !!data
    }
}
