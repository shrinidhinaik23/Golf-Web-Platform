"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Charity = {
  id: string;
  name: string;
};

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("monthly");
  const [charityId, setCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchCharities() {
      const { data, error } = await supabase
        .from("charities")
        .select("id, name")
        .eq("active", true);

      if (!error && data) {
        setCharities(data);
        if (data.length > 0) setCharityId(data[0].id);
      }
    }

    fetchCharities();
  }, [supabase]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (charityPercentage < 10) {
      setMessage("Charity percentage must be at least 10.");
      setLoading(false);
      return;
    }

    // 1) create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;

    if (!user) {
      setMessage("Signup succeeded, but user data was not returned.");
      setLoading(false);
      return;
    }

    // 2) create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      email,
      role: "user",
      selected_charity_id: charityId || null,
      charity_percentage: charityPercentage,
    });

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    const amount = plan === "monthly" ? 1000 : 10000;

    // 3) create order on server
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

    // 4) open razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Golf Charity Platform",
      description: `${plan} subscription`,
      order_id: orderData.id,
      prefill: {
        name: fullName,
        email,
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
            charityId,
            charityPercentage,
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          setMessage(verifyData.error || "Payment verification failed.");
          setLoading(false);
          return;
        }

        setLoading(false);
        router.push("/dashboard");
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
    <main className="page-wrap flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="card-ui h-full p-8">
            <span className="badge-ui">Create your account</span>
            <h1 className="mt-4 text-4xl font-bold">
              Join the premium golf charity experience.
            </h1>
            <p className="mt-4 text-slate-300">
              Subscribe, manage your latest 5 scores, join monthly draws, and
              support a charity with every plan.
            </p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="card-ui p-8">
          <h2 className="text-3xl font-bold">Sign Up</h2>
          <p className="mt-2 text-sm text-slate-400">
            Create your account and complete payment to activate subscription.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Full name"
              className="input-ui"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              className="input-ui"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="input-ui"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              className="input-ui"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="monthly">Monthly Plan - ₹1000</option>
              <option value="yearly">Yearly Plan - ₹10000</option>
            </select>

            <select
              className="input-ui"
              value={charityId}
              onChange={(e) => setCharityId(e.target.value)}
            >
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={10}
              className="input-ui"
              value={charityPercentage}
              onChange={(e) => setCharityPercentage(Number(e.target.value))}
              placeholder="Charity contribution %"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full"
            >
              {loading ? "Processing..." : "Create Account & Pay"}
            </button>

            {message && <p className="text-sm text-rose-300">{message}</p>}

            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-white underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}