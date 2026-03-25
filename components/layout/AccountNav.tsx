import Link from "next/link";

export default function AccountNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Link href="/account/subscription" className="button-secondary">
        Subscription
      </Link>

      <Link href="/account/payment" className="button-secondary">
        Payment
      </Link>

      <Link href="/dashboard" className="button-secondary">
        Dashboard
      </Link>
    </div>
  );
}