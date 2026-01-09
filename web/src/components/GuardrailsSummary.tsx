import { Guardrail } from '@/lib/mockData';

interface GuardrailsSummaryProps {
  guardrails: Guardrail[];
}

const statusColors = {
  passing: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  violation: 'text-red-600 bg-red-50',
};

export default function GuardrailsSummary({ guardrails }: GuardrailsSummaryProps) {
  if (!guardrails || guardrails.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Guardrails</h2>
        <p className="text-gray-500">No guardrails configured</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Guardrails</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Threshold</th>
              <th className="text-left py-2 px-2">Current</th>
            </tr>
          </thead>
          <tbody>
            {guardrails.map((guardrail) => (
              <tr key={guardrail.id} className="border-b">
                <td className="py-2 px-2 font-medium">{guardrail.name}</td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      statusColors[guardrail.status] || statusColors.passing
                    }`}
                  >
                    {guardrail.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-600">{guardrail.threshold}</td>
                <td className="py-2 px-2 font-semibold">{guardrail.currentValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
