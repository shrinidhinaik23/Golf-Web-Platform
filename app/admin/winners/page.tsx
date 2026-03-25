"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/layout/AdminNav";

type WinnerRow = {
  id: string;
  match_type: string;
  prize_amount: number;
  verification_status: string;
  payout_status: string;
  user_id: string;
  proof_url?: string | null;
};

type ProfileMap = Record<string, string>;

export default function AdminWinnersPage() {
  const supabase = createClient();
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [message, setMessage] = useState("");
  const [proofInputs, setProofInputs] = useState<Record<string, string>>({});

  async function fetchWinners() {
    const { data, error } = await supabase
      .from("winners")
      .select(
        "id, user_id, match_type, prize_amount, verification_status, payout_status, proof_url"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    const winnerRows = (data as WinnerRow[]) || [];
    setWinners(winnerRows);

    const initialProofs: Record<string, string> = {};
    winnerRows.forEach((w) => {
      initialProofs[w.id] = w.proof_url || "";
    });
    setProofInputs(initialProofs);

    const userIds = [...new Set(winnerRows.map((w) => w.user_id))];
    if (userIds.length === 0) return;

    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const map: ProfileMap = {};
    (profileRows || []).forEach((p: any) => {
      map[p.id] = p.full_name;
    });
    setProfiles(map);
  }

  useEffect(() => {
    fetchWinners();
  }, []);

  async function updateWinner(
    winnerId: string,
    field: "verification_status" | "payout_status",
    value: string
  ) {
    const { error } = await supabase
      .from("winners")
      .update({ [field]: value })
      .eq("id", winnerId);

    if (error) {
      setMessage(error.message);
      return;
    }

    fetchWinners();
  }

  async function saveProof(winnerId: string) {
    const proofUrl = proofInputs[winnerId];

    const { error } = await supabase
      .from("winners")
      .update({ proof_url: proofUrl })
      .eq("id", winnerId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Proof updated successfully.");
    fetchWinners();
  }

  return (
    <main className="page-wrap">
      <AdminNav />

      <div className="card-ui p-6">
        <h1 className="text-3xl font-bold">Manage Winners</h1>
        <p className="mt-2 text-sm text-slate-400">
          Review winner verification, payout workflow, and proof records.
        </p>
        {message && <p className="mt-2 text-sm text-rose-300">{message}</p>}

        <div className="mt-6 table-wrap">
          <table className="table-ui">
            <thead>
              <tr>
                <th>User</th>
                <th>Match Type</th>
                <th>Prize</th>
                <th>Proof</th>
                <th>Verification</th>
                <th>Payout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner) => (
                <tr key={winner.id}>
                  <td>{profiles[winner.user_id] || winner.user_id}</td>
                  <td>{winner.match_type}</td>
                  <td>₹{winner.prize_amount}</td>
                  <td className="min-w-[260px]">
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="input-ui"
                        placeholder="Paste proof link"
                        value={proofInputs[winner.id] || ""}
                        onChange={(e) =>
                          setProofInputs((prev) => ({
                            ...prev,
                            [winner.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => saveProof(winner.id)}
                        className="rounded-lg bg-violet-600 px-3 py-1 text-white"
                      >
                        Save Proof
                      </button>
                    </div>
                  </td>
                  <td>{winner.verification_status}</td>
                  <td>{winner.payout_status}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          updateWinner(winner.id, "verification_status", "approved")
                        }
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateWinner(winner.id, "verification_status", "rejected")
                        }
                        className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          updateWinner(winner.id, "payout_status", "paid")
                        }
                        className="rounded-lg bg-sky-600 px-3 py-1 text-white"
                      >
                        Mark Paid
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={7}>No winners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}