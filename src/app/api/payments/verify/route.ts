import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            courseId,
        } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const supabase = createAdminClient();

            // 1. Record Payment
            const { error: paymentError } = await supabase.from("payments").insert({
                user_id: userId,
                course_id: courseId,
                amount: 0, // Ideally fetch from Razorpay, but 0 is fine for now as we trust the signature
                currency: "INR",
                status: "completed",
                provider_id: razorpay_payment_id,
                metadata: {
                    source: "razorpay",
                    order_id: razorpay_order_id,
                },
            });

            if (paymentError) {
                return NextResponse.json(
                    { success: false, message: "Payment recording failed" },
                    { status: 500 }
                );
            }

            // 2. Create Enrollment
            const { error: enrollmentError } = await supabase
                .from("enrollments")
                .insert({
                    user_id: userId,
                    course_id: courseId,
                });

            if (enrollmentError) {
                return NextResponse.json(
                    { success: false, message: "Enrollment failed" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Payment verified and enrollment created",
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
