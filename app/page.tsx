import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="page-wrap pt-12 md:pt-20">
        <div className="card-ui overflow-hidden p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="badge-ui">Golf × Charity × Rewards</span>

              <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
                Play. Win.{" "}
                <span className="bg-gradient-to-r from-violet-300 to-emerald-300 bg-clip-text text-transparent">
                  Give Back.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base text-slate-300 md:text-lg">
                A premium subscription platform where players track their latest
                Stableford scores, enter monthly draws, and contribute part of
                every subscription to a chosen charity.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup" className="button-primary">
                  Get Started
                </Link>
                <Link href="/login" className="button-secondary">
                  Login
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="card-ui p-6">
                <p className="text-sm text-slate-400">Monthly Draw</p>
                <h3 className="mt-2 text-2xl font-semibold">
                  3 / 4 / 5 Match Tiers
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  Users are evaluated based on their latest 5 submitted scores
                  against monthly draw numbers.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="card-ui p-6">
                  <p className="text-sm text-slate-400">Charity Contribution</p>
                  <h3 className="mt-2 text-2xl font-semibold">Minimum 10%</h3>
                </div>
                <div className="card-ui p-6">
                  <p className="text-sm text-slate-400">Score Rule</p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    Latest 5 Retained
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card-ui p-6">
            <h2 className="text-xl font-semibold">1. Subscribe</h2>
            <p className="mt-3 text-sm text-slate-300">
              Choose a monthly or yearly plan and access the platform.
            </p>
          </div>
          <div className="card-ui p-6">
            <h2 className="text-xl font-semibold">2. Add Scores</h2>
            <p className="mt-3 text-sm text-slate-300">
              Enter your Stableford scores with validation from 1 to 45.
            </p>
          </div>
          <div className="card-ui p-6">
            <h2 className="text-xl font-semibold">3. Support a Cause</h2>
            <p className="mt-3 text-sm text-slate-300">
              Select a charity and contribute at least 10% of your subscription.
            </p>
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <div className="card-ui p-8">
          <h2 className="text-3xl font-bold">How the Draw Works</h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Every month, the platform generates 5 draw numbers. Each active
            subscriber is evaluated using only their latest 5 Stableford scores.
            Matching 3, 4, or 5 numbers qualifies the player for a prize tier.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Step 1</p>
              <h3 className="mt-2 text-xl font-semibold">Subscribe</h3>
              <p className="mt-2 text-sm text-slate-300">
                Activate a monthly or yearly plan.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Step 2</p>
              <h3 className="mt-2 text-xl font-semibold">Submit Scores</h3>
              <p className="mt-2 text-sm text-slate-300">
                The system keeps only your latest 5 valid scores.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Step 3</p>
              <h3 className="mt-2 text-xl font-semibold">Monthly Draw</h3>
              <p className="mt-2 text-sm text-slate-300">
                Admin runs the draw and generates 5 random numbers.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Step 4</p>
              <h3 className="mt-2 text-xl font-semibold">Win & Verify</h3>
              <p className="mt-2 text-sm text-slate-300">
                Winners are grouped into 3, 4, and 5 match tiers.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">3 Match</p>
              <h3 className="mt-2 text-2xl font-semibold">Standard Tier</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">4 Match</p>
              <h3 className="mt-2 text-2xl font-semibold">Strong Tier</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">5 Match</p>
              <h3 className="mt-2 text-2xl font-semibold">Premium Tier</h3>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}