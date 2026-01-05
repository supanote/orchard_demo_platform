export interface Patient {
  id: number;
  name: string | null;
  dob: string | null;
  source: string;
  stage: string;
  stageOrder: number;
  time: string;
  status?: string;
  insurance: string | null;
  handledBy: string;
  escalated: boolean;
  escalationReason?: string;
  phone?: string;
  memberId?: string;
  reason?: string;
  sourceId?: string;
  daysWaiting?: number;
  assignedTo?: string;
  benefitsVerified?: boolean;
  copay?: string;
  providerMatch?: string;
  provider?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  droppedReason?: string;
  createdAt?: number; // Timestamp when patient was created (for dynamic time display)
}

export interface Stage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

export interface Task {
  id: string;
  patientId: number;
  patientName: string;
  type: string;
  priority: string;
  stage: string;
  reason: string;
  assignedTo: string | null;
  waitingSince: string;
  slaStatus: string;
}

export interface Agent {
  id: string;
  name: string;
  currentTask: string;
  processed: number;
  successRate: number;
}

export interface ActivityItem {
  id: number;
  agent: string;
  action: string;
  patient: string;
  time: string;
}

export interface FunnelData {
  stage: string;
  count: number;
  width: number;
  dropOff: { count: number; reasons: { reason: string; count: number }[] } | null;
}

