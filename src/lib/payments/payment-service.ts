import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay'

export class PaymentService {
    /**
     * Process a payment for a course.
     * In a real application, this would interact with Stripe/PayPal API.
     * For now, it simulates a successful payment and records it in the database.
     */
    static async createOrder(
        courseId: string,
        amount: number,
        currency: string = 'INR'
    ) {
        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency: currency,
            receipt: `rcpt_${courseId.slice(0, 8)}_${Date.now()}`.slice(0, 40), // Ensure max 40 chars
            notes: {
                courseId: courseId
            }
        };

        console.log('Creating Razorpay order with options:', options)
        try {
            const order = await razorpay.orders.create(options);
            console.log('Razorpay order created:', order)
            return order;
        } catch (error) {
            console.error('Razorpay order creation failed:', error)
            throw error
        }
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
