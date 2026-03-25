import Link from "next/link";

export default function AdminNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Link href="/admin" className="button-secondary">
        Overview
      </Link>
      <Link href="/admin/users" className="button-secondary">
        Users
      </Link>
      <Link href="/admin/draws" className="button-secondary">
        Draws
      </Link>
      <Link href="/admin/winners" className="button-secondary">
        Winners
      </Link>
    </div>
  );
}