'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusCard from '@/components/StatusCard';
import RecentEvents from '@/components/RecentEvents';
import GuardrailsSummary from '@/components/GuardrailsSummary';
import LockedControls from '@/components/LockedControls';
import LogoutButton from '@/components/LogoutButton';
import type { Role } from '@/lib/types';
import type { RiskState, Event, Guardrail } from '@/lib/mockData';

interface DashboardData {
  systemState: {
    state: RiskState;
    message: string;
    lastUpdate: string;
  };
  events: Event[];
  guardrails: Guardrail[];
  user: {
    username: string;
    role: Role;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/summary', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to load dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700">{error || 'Failed to load data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const demoMode = false;

  return (
    <div className="min-h-screen bg-gray-50">{demoMode && (
      <div className="bg-yellow-500 text-black px-4 py-2 text-center font-bold sticky top-0 z-50">
        ⚠️ DEMO MODE ACTIVE - MVP with Local Database - No Production Capability
      </div>
      )}

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black">THE FENCE Dashboard</h1>
            <p className="text-sm text-gray-600">System Observability & Governance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Signed in as: <span className="font-semibold text-slate-900">{data.user.username}</span>
              </p>
              <p className="text-xs">
                Role:{' '}
                <span
                  className={`font-bold ${
                    data.user.role === 'ADMIN'
                      ? 'text-purple-600'
                      : data.user.role === 'OPERATOR'
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {data.user.role}
                </span>
              </p>
            </div>
            <LogoutButton />
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <StatusCard
            state={data.systemState.state}
            message={data.systemState.message}
            lastUpdate={data.systemState.lastUpdate}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <RecentEvents events={data.events} />
            <GuardrailsSummary guardrails={data.guardrails} />
          </div>

          <LockedControls role={data.user.role} demoMode={demoMode} onActionComplete={fetchDashboardData} />
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Dashboard displaying live data from Supabase PostgreSQL.</p>
          <p className="mt-1">All actions are governed by THE FENCE protocol. Audit trail active.</p>
        </div>
      </main>
    </div>
  );
}
