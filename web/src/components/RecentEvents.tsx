import { Event } from '@/lib/mockData';

interface RecentEventsProps {
  events: Event[];
}

const severityColors = {
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200',
  error: 'bg-red-50 border-red-200',
};

export default function RecentEvents({ events }: RecentEventsProps) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Events</h2>
        <p className="text-gray-500">No events to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Events</h2>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border-l-2 p-3 rounded ${severityColors[event.severity] || severityColors.info}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">{event.type}</span>
              <span className="text-xs text-gray-600">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
