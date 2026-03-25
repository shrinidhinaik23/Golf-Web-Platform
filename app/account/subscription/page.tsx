"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AccountNav from "@/components/layout/AccountNav";

type Subscription = {
  id: string;
  plan: string;
  status: string;
  start_date: string;
  renewal_date: string;
  amount: number;
};

export default function AccountSubscriptionPage() {
  const supabase = createClient();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [message, setMessage] = useState("");

  async function fetchSubscription() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, plan, status, start_date, renewal_date, amount")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      return;
    }

    setSubscription(data);
  }

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function handleCancelSubscription() {
    if (!subscription) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscription.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Subscription cancelled successfully.");
    fetchSubscription();
  }

  return (
    <main className="page-wrap">
      <AccountNav />

      <div className="card-ui max-w-4xl p-6">
        <h1 className="text-3xl font-bold">Subscription Details</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your subscription lifecycle, renewal, and access status.
        </p>

        <div className="mt-6">
          {message && <p className="mb-4 text-sm text-rose-300">{message}</p>}

          {!subscription ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                No subscription found for this account.
              </p>
              <Link href="/account/payment" className="button-primary inline-block">
                Complete Payment
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="card-ui p-5">
                  <p className="text-sm text-slate-400">Plan</p>
                  <h2 className="mt-2 text-2xl font-semibold">{subscription.plan}</h2>
                </div>

                <div className="card-ui p-5">
                  <p className="text-sm text-slate-400">Status</p>
                  <h2 className="mt-2 text-2xl font-semibold">{subscription.status}</h2>
                </div>

                <div className="card-ui p-5">
                  <p className="text-sm text-slate-400">Start Date</p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {subscription.start_date}
                  </h2>
                </div>

                <div className="card-ui p-5">
                  <p className="text-sm text-slate-400">Renewal Date</p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {subscription.renewal_date}
                  </h2>
                </div>

                <div className="card-ui p-5 md:col-span-2">
                  <p className="text-sm text-slate-400">Amount</p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    ₹{subscription.amount}
                  </h2>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {subscription.status === "active" && (
                  <button
                    onClick={handleCancelSubscription}
                    className="rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white"
                  >
                    Cancel Subscription
                  </button>
                )}

                {(subscription.status === "cancelled" ||
                  subscription.status === "lapsed") && (
                  <Link
                    href="/account/payment"
                    className="button-primary inline-block"
                  >
                    Renew / Reactivate
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}