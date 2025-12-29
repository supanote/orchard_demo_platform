import type { Patient, Stage, Task, Agent, ActivityItem, FunnelData } from './types';

export const stages: Stage[] = [
  { id: 'extraction', name: 'Extracting', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'outreach', name: 'Awaiting Patient', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'intake', name: 'Matching', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'verification', name: 'Booked', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'completed', name: 'Booked', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'dropped', name: 'Dropped', color: '#ef4444', bgColor: '#fef2f2' },
];

export const funnelData: FunnelData[] = [
  { stage: 'Received', count: 47, width: 100, dropOff: null },
  { stage: 'Extracted', count: 44, width: 93, dropOff: { count: 3, reasons: [{ reason: 'Unreadable document', count: 2 }, { reason: 'Missing required fields', count: 1 }]}},
  { stage: 'Contacted', count: 35, width: 74, dropOff: { count: 9, reasons: [{ reason: 'No answer (3+ attempts)', count: 5 }, { reason: 'Wrong number', count: 2 }, { reason: 'Patient declined', count: 2 }]}},
  { stage: 'Matched', count: 28, width: 59, dropOff: { count: 7, reasons: [{ reason: 'No in-network providers', count: 4 }, { reason: 'No availability match', count: 2 }, { reason: 'Patient rescheduling', count: 1 }]}},
  { stage: 'Booked', count: 23, width: 48, dropOff: { count: 5, reasons: [{ reason: 'Insurance not accepted', count: 3 }, { reason: 'Patient cancelled', count: 2 }]}},
];

export const patients: Patient[] = [
  { id: 1, name: 'Sarah Chen', dob: 'Mar 15, 1988', source: 'fax', stage: 'extraction', stageOrder: 1, time: '2 min ago', status: 'Pending', insurance: 'Aetna', handledBy: 'AI', escalated: false, phone: '(555) 123-4567', memberId: 'AE123456789', reason: 'Anxiety' },
  { id: 2, name: null, dob: null, source: 'fax', stage: 'extraction', stageOrder: 1, time: '8 min ago', status: 'Pending', insurance: null, handledBy: 'AI', escalated: false, sourceId: 'Fax #4821' },
  { id: 3, name: 'Emily Watson', dob: 'Nov 3, 1992', source: 'email', stage: 'extraction', stageOrder: 1, time: '12 min ago', status: 'Pending', insurance: null, handledBy: 'AI', escalated: true, escalationReason: 'Unreadable document', phone: '(555) 234-5678' },
  { id: 4, name: 'James Liu', dob: 'Feb 28, 1980', source: 'fax', stage: 'outreach', stageOrder: 2, time: '1 hr ago', daysWaiting: 0, insurance: 'Cigna', handledBy: 'AI', escalated: false, phone: '(555) 345-6789', memberId: 'CG456789012', reason: 'Depression' },
  { id: 5, name: 'Amanda Foster', dob: 'Sep 14, 1995', source: 'fax', stage: 'outreach', stageOrder: 2, time: '3 hrs ago', daysWaiting: 0, insurance: 'Blue Cross', handledBy: 'AI', escalated: false, phone: '(555) 456-7890', memberId: 'BC123456789', reason: 'Anxiety, PTSD' },
  { id: 6, name: 'Robert Kim', dob: 'Dec 1, 1970', source: 'fax', stage: 'outreach', stageOrder: 2, time: '1 day ago', daysWaiting: 1, insurance: 'Medicare', handledBy: 'AI', escalated: false, phone: '(555) 567-8901', memberId: 'MC987654321', reason: 'Grief counseling' },
  { id: 7, name: 'Lisa Martinez', dob: 'Apr 18, 1988', source: 'fax', stage: 'outreach', stageOrder: 2, time: '2 days ago', daysWaiting: 2, insurance: 'Aetna', handledBy: 'AI', escalated: true, escalationReason: 'Patient requested callback', phone: '(555) 678-9012', memberId: 'AE567890123', reason: 'Couples therapy' },
  { id: 8, name: 'David Brown', dob: 'Aug 7, 1965', source: 'email', stage: 'outreach', stageOrder: 2, time: '4 days ago', daysWaiting: 4, insurance: 'United', handledBy: 'AI', escalated: false, phone: '(555) 789-0123', memberId: 'UH234567890', reason: 'Substance abuse' },
  { id: 9, name: 'Jennifer Park', dob: 'Jan 30, 1990', source: 'fax', stage: 'outreach', stageOrder: 2, time: '6 days ago', daysWaiting: 6, insurance: 'Cigna', handledBy: 'AI', escalated: false, phone: '(555) 890-1234', memberId: 'CG345678901', reason: 'ADHD evaluation' },
  { id: 10, name: 'Thomas Anderson', dob: 'May 12, 1982', source: 'call', stage: 'intake', stageOrder: 3, time: '25 min ago', insurance: 'Blue Cross', handledBy: 'AI', escalated: false, phone: '(555) 901-2345', memberId: 'BC234567890', reason: 'Anxiety', benefitsVerified: true, copay: '$25', providerMatch: 'Dr. Williams' },
  { id: 11, name: 'Maria Garcia', dob: 'Oct 9, 1978', source: 'form', stage: 'intake', stageOrder: 3, time: '45 min ago', insurance: 'Aetna', handledBy: 'AI', escalated: true, escalationReason: 'No in-network providers available', phone: '(555) 012-3456', memberId: 'AE678901234', reason: 'Family therapy', benefitsVerified: true, copay: '$40' },
  { id: 12, name: 'Kevin Wright', dob: 'Jun 25, 1993', source: 'call', stage: 'intake', stageOrder: 3, time: '1 hr ago', insurance: 'United', handledBy: 'Human', assignedTo: 'Jane D.', escalated: false, phone: '(555) 123-4567', memberId: 'UH345678901', reason: 'Depression', benefitsVerified: true, copay: '$30', providerMatch: 'Dr. Chen' },
  { id: 13, name: 'Rachel Green', dob: 'Mar 8, 1985', source: 'fax', stage: 'verification', stageOrder: 4, time: '30 min ago', insurance: 'Cigna', provider: 'Dr. Williams', handledBy: 'AI', escalated: false, phone: '(555) 234-5678', memberId: 'CG456789012', reason: 'Anxiety', benefitsVerified: true, copay: '$25', appointmentDate: 'Dec 27, 2025', appointmentTime: '2:00 PM' },
  { id: 14, name: 'Daniel Lee', dob: 'Jul 17, 1972', source: 'call', stage: 'verification', stageOrder: 4, time: '1 hr ago', insurance: 'Blue Cross', provider: 'Dr. Smith', handledBy: 'AI', escalated: false, phone: '(555) 345-6789', memberId: 'BC567890123', reason: 'Depression', benefitsVerified: true, copay: '$25', appointmentDate: 'Dec 28, 2025', appointmentTime: '10:00 AM' },
  { id: 15, name: 'Sophie Turner', dob: 'Nov 22, 1991', source: 'email', stage: 'verification', stageOrder: 4, time: '2 hrs ago', insurance: 'Aetna', provider: 'Dr. Johnson', handledBy: 'Human', assignedTo: 'Mike R.', escalated: false, phone: '(555) 456-7890', memberId: 'AE789012345', reason: 'PTSD', benefitsVerified: true, copay: '$40', appointmentDate: 'Dec 29, 2025', appointmentTime: '3:30 PM' },
  { id: 16, name: 'Chris Evans', dob: 'Feb 14, 1980', source: 'form', stage: 'verification', stageOrder: 4, time: '3 hrs ago', insurance: 'United', provider: 'Dr. Davis', handledBy: 'AI', escalated: false, phone: '(555) 567-8901', memberId: 'UH890123456', reason: 'Anxiety', benefitsVerified: true, copay: '$30', appointmentDate: 'Dec 30, 2025', appointmentTime: '11:00 AM' },
  { id: 17, name: 'Nancy Drew', dob: 'Sep 5, 1988', source: 'fax', stage: 'dropped', stageOrder: 0, time: '2 hrs ago', insurance: 'Medicaid', handledBy: 'AI', escalated: false, phone: '(555) 111-2222', droppedReason: 'Insurance not accepted' },
  { id: 18, name: 'Peter Parker', dob: 'Aug 10, 1995', source: 'fax', stage: 'dropped', stageOrder: 0, time: '4 hrs ago', insurance: 'Aetna', handledBy: 'AI', escalated: false, phone: '(555) 333-4444', droppedReason: 'Patient cancelled' },
];

export const tasks: Task[] = [
  { id: 't1', patientId: 3, patientName: 'Emily Watson', type: 'Escalated', priority: 'P1', stage: 'Data Extraction', reason: 'Unreadable document', assignedTo: null, waitingSince: '12 min', slaStatus: 'ok' },
  { id: 't2', patientId: 7, patientName: 'Lisa Martinez', type: 'Escalated', priority: 'P2', stage: 'Patient Outreach', reason: 'Patient requested callback', assignedTo: null, waitingSince: '2 days', slaStatus: 'breached' },
  { id: 't3', patientId: 11, patientName: 'Maria Garcia', type: 'Escalated', priority: 'P1', stage: 'Intake & Scheduling', reason: 'No in-network providers', assignedTo: null, waitingSince: '45 min', slaStatus: 'ok' },
  { id: 't4', patientId: 13, patientName: 'Rachel Green', type: 'Approval', priority: 'P2', stage: 'Benefits Verification', reason: 'Ready to push to EHR', assignedTo: null, waitingSince: '30 min', slaStatus: 'ok' },
];

export const agents: Agent[] = [
  { id: 'intake', name: 'Supa Intake', currentTask: 'Processing fax #4821', processed: 47, successRate: 94 },
  { id: 'verify', name: 'Supa Verify', currentTask: 'Verifying Thomas Anderson', processed: 38, successRate: 97 },
];

export const activityFeed: ActivityItem[] = [
  { id: 1, agent: 'Supa Intake', action: 'extracted patient info', patient: 'Fax #4821', time: 'Just now' },
  { id: 2, agent: 'Supa Intake', action: 'initiated outbound call', patient: 'James Liu', time: '30s ago' },
  { id: 3, agent: 'Supa Verify', action: 'verified benefits', patient: 'Thomas Anderson', time: '1m ago' },
  { id: 4, agent: 'Supa Intake', action: 'left voicemail', patient: 'Amanda Foster', time: '2m ago' },
];

