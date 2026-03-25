import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, renewal_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    redirect("/account/payment");
  }

  if (
    subscription.status === "active" &&
    subscription.renewal_date &&
    subscription.renewal_date < today
  ) {
    await supabase
      .from("subscriptions")
      .update({ status: "lapsed" })
      .eq("id", subscription.id);

    redirect("/account/payment");
  }

  if (subscription.status !== "active") {
    redirect("/account/payment");
  }

  return <>{children}</>;
}