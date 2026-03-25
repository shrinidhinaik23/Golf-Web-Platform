"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AccountNav from "@/components/layout/AccountNav";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Profile = {
  full_name: string;
  email: string;
  selected_charity_id: string | null;
  charity_percentage: number;
};

export default function PaymentPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, selected_charity_id, charity_percentage")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      setProfile(data);
    }

    fetchProfile();
  }, [supabase]);

  async function handlePayment() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !profile) {
      setMessage("User session or profile not found.");
      setLoading(false);
      return;
    }

    const amount = plan === "monthly" ? 1000 : 10000;

    const orderRes = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        plan,
        userId: user.id,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      setMessage(orderData.error || "Failed to create Razorpay order.");
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Golf Charity Platform",
      description: `${plan} subscription`,
      order_id: orderData.id,
      prefill: {
        name: profile.full_name,
        email: profile.email,
      },
      theme: {
        color: "#a78bfa",
      },
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
            amount,
            charityId: profile.selected_charity_id,
            charityPercentage: profile.charity_percentage,
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          setMessage(verifyData.error || "Payment verification failed.");
          setLoading(false);
          return;
        }

        setLoading(false);
        window.location.href = "/account/subscription";
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setMessage("Payment was cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <main className="page-wrap">
      <AccountNav />

      <div className="card-ui max-w-3xl p-6">
        <h1 className="text-3xl font-bold">Payment</h1>
        <p className="mt-2 text-sm text-slate-400">
          Complete payment to activate, renew, or reactivate your subscription.
        </p>

        <div className="mt-6 space-y-4">
          <select
            className="input-ui"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="monthly">Monthly Plan - ₹1000</option>
            <option value="yearly">Yearly Plan - ₹10000</option>
          </select>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="button-primary w-full"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>

          {message && <p className="text-sm text-rose-300">{message}</p>}
        </div>
      </div>
    </main>
  );
}