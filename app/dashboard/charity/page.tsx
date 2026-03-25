"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/layout/DashboardNav";

type Charity = {
  id: string;
  name: string;
  description: string | null;
};

type Profile = {
  selected_charity_id: string | null;
  charity_percentage: number;
};

export default function CharityPage() {
  const supabase = createClient();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [currentCharityName, setCurrentCharityName] = useState("Not selected");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data: charityList, error: charityError } = await supabase
        .from("charities")
        .select("id, name, description")
        .eq("active", true);

      if (charityError) {
        setMessage(charityError.message);
        return;
      }

      setCharities(charityList || []);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("selected_charity_id, charity_percentage")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setMessage(profileError.message);
        return;
      }

      const profile = profileData as Profile;
      setSelectedCharityId(profile.selected_charity_id || "");
      setCharityPercentage(profile.charity_percentage || 10);

      if (profile.selected_charity_id) {
        const found = charityList?.find((item) => item.id === profile.selected_charity_id);
        if (found) setCurrentCharityName(found.name);
      }
    }

    fetchData();
  }, [supabase]);

  async function handleUpdateCharity(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (charityPercentage < 10) {
      setMessage("Charity percentage must be at least 10.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        selected_charity_id: selectedCharityId || null,
        charity_percentage: charityPercentage,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const selectedCharity = charities.find((c) => c.id === selectedCharityId);
    setCurrentCharityName(selectedCharity?.name || "Not selected");
    setMessage("Charity details updated successfully.");
    setLoading(false);
  }

  return (
    <main className="page-wrap">
      <DashboardNav />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="card-ui p-6">
          <h1 className="text-2xl font-bold">Current Charity Selection</h1>
          <div className="mt-5 space-y-3 text-slate-300">
            <p><span className="font-medium text-white">Selected Charity:</span> {currentCharityName}</p>
            <p><span className="font-medium text-white">Contribution:</span> {charityPercentage}%</p>
          </div>
        </div>

        <form onSubmit={handleUpdateCharity} className="card-ui p-6">
          <h2 className="text-2xl font-bold">Update Charity</h2>
          <div className="mt-5 space-y-4">
            <select
              className="input-ui"
              value={selectedCharityId}
              onChange={(e) => setSelectedCharityId(e.target.value)}
            >
              <option value="">Select Charity</option>
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
              required
            />

            <button type="submit" disabled={loading} className="button-primary w-full">
              {loading ? "Updating..." : "Update Charity"}
            </button>

            {message && <p className="text-sm text-rose-300">{message}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}