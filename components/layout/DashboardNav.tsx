import Link from "next/link";

export default function DashboardNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Link href="/dashboard" className="button-secondary">
        Overview
      </Link>

      <Link href="/dashboard/scores" className="button-secondary">
        Scores
      </Link>

      <Link href="/dashboard/charity" className="button-secondary">
        Charity
      </Link>

      <Link href="/account/subscription" className="button-secondary">
        Subscription
      </Link>

      <Link href="/account/payment" className="button-secondary">
        Payment
      </Link>
    </div>
  );
}