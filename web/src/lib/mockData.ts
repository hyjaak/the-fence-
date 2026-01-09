// Mock data for THE FENCE demo dashboard
// Read-only data structures - no mutations allowed

export type RiskState = 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';

export interface SystemStatus {
  state: RiskState;
  message: string;
  lastUpdate: string;
}

export interface Event {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

export interface Guardrail {
  id: string;
  name: string;
  status: 'passing' | 'warning' | 'violation';
  threshold: string;
  currentValue: string;
}

export const mockSystemStatus: SystemStatus = {
  state: 'GREEN',
  message: 'All systems nominal. Demo mode active.',
  lastUpdate: new Date().toISOString(),
};

export const mockRecentEvents: Event[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'METRIC_INGESTED',
    description: 'Performance metric captured',
    severity: 'info',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    type: 'GUARDRAIL_CHECK',
    description: 'Safety envelope validated',
    severity: 'info',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: 'AUDIT_LOG',
    description: 'Operator action recorded',
    severity: 'info',
  },
];

export const mockGuardrails: Guardrail[] = [
  {
    id: '1',
    name: 'Resource Utilization',
    status: 'passing',
    threshold: '< 80%',
    currentValue: '45%',
  },
  {
    id: '2',
    name: 'Decision Latency',
    status: 'passing',
    threshold: '< 500ms',
    currentValue: '120ms',
  },
  {
    id: '3',
    name: 'Audit Trail Continuity',
    status: 'passing',
    threshold: '100%',
    currentValue: '100%',
  },
];
