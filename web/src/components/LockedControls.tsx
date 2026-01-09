'use client';

import { useState } from 'react';
import type { Role } from '@/lib/types';

interface LockedControlsProps {
  role: Role;
  demoMode: boolean;
  onActionComplete?: () => void;
}

export default function LockedControls({ role, demoMode, onActionComplete }: LockedControlsProps) {
  const [actionResult, setActionResult] = useState<string>('');
  const [loading, setLoading] = useState<string>('');

  const canExecute = role === 'OPERATOR' || role === 'ADMIN';
  const canOverride = role === 'OPERATOR' || role === 'ADMIN';
  const canConfig = role === 'ADMIN';
  const canDeploy = role === 'ADMIN';

  const getButtonTitle = (action: 'execute' | 'override' | 'config' | 'deploy'): string => {
    switch (action) {
      case 'execute':
      case 'override':
        if (role === 'VIEWER') return 'VIEWER - read only';
        return 'Demo-safe action';
      case 'config':
      case 'deploy':
        if (role !== 'ADMIN') return 'Requires ADMIN';
        return 'Demo-safe action';
      default:
        return 'Action';
    }
  };

  const handleAction = async (action: string, endpoint: string) => {
    setLoading(action);
    setActionResult('');

    try {
      const response = await fetch(endpoint, { 
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setActionResult(`✓ Action completed successfully`);
        if (onActionComplete) {
          setTimeout(() => onActionComplete(), 500);
        }
      } else {
        setActionResult(`✗ ${data.error || 'Action failed'}`);
      }
    } catch (error) {
      setActionResult('✗ Network error');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Control Panel</h2>
      
      {demoMode ? (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-4">
          <p className="text-sm text-yellow-800 font-semibold">
            ⚠️ DEMO MODE - All controls locked
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            No write operations permitted in demo mode, regardless of role.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-300 rounded p-3 mb-4">
          <p className="text-sm text-blue-800 font-semibold">
            ✓ Controls enabled based on role
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Actions available to {role} users are unlocked below.
          </p>
        </div>
      )}

      {actionResult && (
        <div className={`mb-4 p-3 rounded text-sm ${
          actionResult.startsWith('✓') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionResult}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={!canExecute || loading !== ''}
          onClick={() => handleAction('execute', '/api/actions/execute')}
          className={`px-4 py-2 rounded font-medium transition-colors relative ${
            canExecute
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:bg-blue-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={getButtonTitle('execute')}
        >
          {loading === 'execute' ? '⏳' : canExecute ? '▶️' : '🔒'} Execute Action
        </button>

        <button
          disabled={!canConfig || loading !== ''}
          onClick={() => handleAction('config', '/api/actions/modify-config')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            canConfig
              ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer disabled:bg-purple-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={getButtonTitle('config')}
        >
          {loading === 'config' ? '⏳' : canConfig ? '⚙️' : '🔒'} Modify Config
        </button>

        <button
          disabled={!canOverride || loading !== ''}
          onClick={() => handleAction('override', '/api/actions/override-guard')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            canOverride
              ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer disabled:bg-orange-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={getButtonTitle('override')}
        >
          {loading === 'override' ? '⏳' : canOverride ? '⚡' : '🔒'} Override Guard
        </button>

        <button
          disabled={!canDeploy || loading !== ''}
          onClick={() => handleAction('deploy', '/api/actions/deploy-change')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            canDeploy
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:bg-red-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={getButtonTitle('deploy')}
        >
          {loading === 'deploy' ? '⏳' : canDeploy ? '🚀' : '🔒'} Deploy Change
        </button>
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
        <span>
          Role: <span className={`font-semibold ${
            role === 'ADMIN' ? 'text-purple-600' :
            role === 'OPERATOR' ? 'text-blue-600' :
            'text-gray-600'
          }`}>{role}</span>
        </span>
        <span className="text-right">
          {demoMode ? 'Demo mode active' : 'All actions are demo-safe simulations'}
        </span>
      </div>
    </div>
  );
}
