import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, plan, userId } = body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys are missing in .env.local" },
        { status: 500 }
      );
    }

    if (!amount || !plan || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, plan, userId" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`, // fixed: short receipt under 40 chars
      notes: {
        plan,
        userId,
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);

    return NextResponse.json(
      {
        error:
          error?.error?.description ||
          error?.message ||
          "Failed to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}