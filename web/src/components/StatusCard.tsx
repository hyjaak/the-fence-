import { RiskState } from '@/lib/mockData';

interface StatusCardProps {
  state: RiskState;
  message: string;
  lastUpdate: string;
}

const stateColors: Record<RiskState, string> = {
  GREEN: 'bg-green-100 border-green-500 text-green-900',
  YELLOW: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  RED: 'bg-red-100 border-red-500 text-red-900',
  BLACK: 'bg-gray-900 border-gray-700 text-white',
};

export default function StatusCard({ state, message, lastUpdate }: StatusCardProps) {
  const colorClass = stateColors[state] || stateColors.GREEN;

  return (
    <div className={`border-l-4 p-6 rounded-lg shadow-md ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">System Status</h2>
        <span className="text-3xl font-black">{state}</span>
      </div>
      <p className="text-sm mb-2">{message}</p>
      <p className="text-xs opacity-75">
        Last update: {new Date(lastUpdate).toLocaleString()}
      </p>
    </div>
  );
}
