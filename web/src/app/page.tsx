import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Demo Mode Banner */}
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg mb-8 text-center font-bold">
            ⚠️ DEMO MODE ACTIVE - Read-Only Display - No Production Capability
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-black text-white mb-4">THE FENCE</h1>
            <p className="text-2xl text-slate-300 mb-2">
              Governance-First Decision Execution System
            </p>
            <p className="text-slate-400">
              Human authority preserved. Actions bounded. Decisions audited.
            </p>
          </div>

          {/* Principles */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Core Principles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Human Decision Authority
                </h3>
                <p className="text-slate-300 text-sm">
                  Every consequential action requires explicit operator consent
                </p>
              </div>
              <div className="bg-white/5 rounded p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Safety Envelopes
                </h3>
                <p className="text-slate-300 text-sm">
                  Automatic termination when guardrails breach thresholds
                </p>
              </div>
              <div className="bg-white/5 rounded p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Immutable Audit Trail
                </h3>
                <p className="text-slate-300 text-sm">
                  Complete history of all decisions and state transitions
                </p>
              </div>
              <div className="bg-white/5 rounded p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Bounded Execution
                </h3>
                <p className="text-slate-300 text-sm">
                  Time, resource, and scope limits on all operations
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-colors shadow-lg"
            >
              View Dashboard →
            </Link>
            <p className="text-slate-400 text-sm mt-4">
              Read-only demonstration of system observability
            </p>
          </div>

          {/* Footer Notice */}
          <div className="mt-16 text-center text-slate-500 text-sm">
            <p>
              This demo displays simulated data only. No production execution, write
              operations, or external integrations are enabled.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

