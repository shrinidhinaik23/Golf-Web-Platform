import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      amount,
      charityId,
      charityPercentage,
    } = body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const renewalDate = new Date();
    if (plan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          start_date: new Date().toISOString().split("T")[0],
          renewal_date: renewalDate.toISOString().split("T")[0],
          amount: Number(amount),
        })
        .eq("id", existingSub.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan,
        status: "active",
        start_date: new Date().toISOString().split("T")[0],
        renewal_date: renewalDate.toISOString().split("T")[0],
        amount: Number(amount),
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (charityId && Number(charityPercentage) > 0) {
      const donationAmount =
        Number(amount) * (Number(charityPercentage) / 100);

      await supabase.from("donations").insert({
        user_id: user.id,
        charity_id: charityId,
        amount: donationAmount,
        source: "subscription",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}