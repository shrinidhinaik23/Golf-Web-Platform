"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/layout/DashboardNav";

type ScoreRow = {
  id: string;
  score: number;
  played_on: string;
  created_at: string;
};

export default function ScoresPage() {
  const supabase = createClient();

  const [score, setScore] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchScores() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { data, error } = await supabase
      .from("scores")
      .select("id, score, played_on, created_at")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setScores(data || []);
  }

  useEffect(() => {
    fetchScores();
  }, []);

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const numericScore = Number(score);

    if (!playedOn) {
      setMessage("Please select the played date.");
      setLoading(false);
      return;
    }

    if (numericScore < 1 || numericScore > 45) {
      setMessage("Score must be between 1 and 45.");
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

    const { error: insertError } = await supabase.from("scores").insert({
      user_id: user.id,
      score: numericScore,
      played_on: playedOn,
    });

    if (insertError) {
      setMessage(insertError.message);
      setLoading(false);
      return;
    }

    const { data: allScores, error: fetchError } = await supabase
      .from("scores")
      .select("id, played_on, created_at")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setMessage(fetchError.message);
      setLoading(false);
      return;
    }

    if (allScores && allScores.length > 5) {
      const extraIds = allScores.slice(5).map((item) => item.id);
      if (extraIds.length > 0) {
        await supabase.from("scores").delete().in("id", extraIds);
      }
    }

    setScore("");
    setPlayedOn("");
    setMessage("Score added successfully.");
    setLoading(false);
    fetchScores();
  }

  return (
    <main className="page-wrap">
      <DashboardNav />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={handleAddScore} className="card-ui p-6">
          <h1 className="text-2xl font-bold">Add New Score</h1>
          <p className="mt-2 text-sm text-slate-400">
            Only your latest 5 scores are retained automatically.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="number"
              min={1}
              max={45}
              placeholder="Enter score (1 to 45)"
              className="input-ui"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />

            <input
              type="date"
              className="input-ui"
              value={playedOn}
              onChange={(e) => setPlayedOn(e.target.value)}
              required
            />

            <button type="submit" disabled={loading} className="button-primary w-full">
              {loading ? "Saving..." : "Add Score"}
            </button>

            {message && <p className="text-sm text-rose-300">{message}</p>}
          </div>
        </form>

        <div className="card-ui p-6">
          <h2 className="text-2xl font-bold">Latest Scores</h2>

          {scores.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No scores added yet.</p>
          ) : (
            <div className="mt-4 table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Score</th>
                    <th>Played On</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((item) => (
                    <tr key={item.id}>
                      <td>{item.score}</td>
                      <td>{item.played_on}</td>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}