import React, { useState, useEffect } from 'react';
import type { Patient, Stage } from '../types';
import { getRelativeDateWithDay } from '../utils/dateHelpers';

interface WorkflowTabProps {
  stages: Stage[];
  patients: Patient[];
  selectedStage: string | null;
  setSelectedStage: (stage: string | null) => void;
  showDropped: boolean;
  setShowDropped: (v: boolean) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  view: string;
  setView: (v: string) => void;
  openPatientDetail: (patient: Patient, mode: string) => void;
  getPatientHandler: (patient: Patient) => { type: string; name: string };
  getAssignedCTA: (patient: Patient) => string;
  assignedPatients: Record<number, string | null>;
}

const getSourceIcon = (source: string) => ({ call: '📞', fax: '📄', email: '✉️', form: '🌐' })[source] || '📄';
const getAgingStyle = (daysWaiting?: number) => {
  if (daysWaiting === undefined) return {};
  if (daysWaiting >= 5) return { borderLeft: '3px solid #ef4444' };
  if (daysWaiting >= 3) return { borderLeft: '3px solid #f59e0b' };
  if (daysWaiting >= 1) return { borderLeft: '3px solid #fcd34d' };
  return {};
};

// Insurance badge colors
const getInsuranceBadge = (insurance: string | null) => {
  if (!insurance) return null;
  const colors: Record<string, { bg: string; text: string }> = {
    'Aetna': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Blue Cross': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Blue Cross Blue Shield': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'United': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Cigna': { bg: 'bg-teal-100', text: 'text-teal-700' },
    'Medicare': { bg: 'bg-green-100', text: 'text-green-700' },
    'Medicaid': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'Humana - Tricare': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'CareFirst': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  };
  const style = colors[insurance] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  // Short names for badges
  const shortNames: Record<string, string> = {
    'Blue Cross Blue Shield': 'BCBS',
    'Blue Cross': 'BCBS',
    'United': 'UHC',
    'Humana - Tricare': 'Tricare',
  };
  return { ...style, name: shortNames[insurance] || insurance };
};

// Activity pool for dynamic updates - uses function to get dynamic dates
const getActivityPool = () => [
  { agent: 'Sarah', action: 'completed intake', detail: 'New patient' },
  { agent: 'Susan', action: 'checking benefits', detail: 'Portal lookup' },
  { agent: 'Sarah', action: 'scheduled follow-up', detail: `${getRelativeDateWithDay(1)}, 3:00 PM` },
  { agent: 'Mike', action: 'left voicemail', detail: 'Callback requested' },
  { agent: 'Sarah', action: 'verified insurance', detail: 'Aetna confirmed' },
  { agent: 'Susan', action: 'extracted data', detail: 'Fax #4892' },
  { agent: 'Sarah', action: 'booked appointment', detail: 'Dr. Williams' },
  { agent: 'Mike', action: 'sent forms', detail: 'Patient portal' },
];

const WorkflowTab: React.FC<WorkflowTabProps> = ({
  stages, patients, selectedStage, setSelectedStage, showDropped, setShowDropped,
  dateFilter, setDateFilter, view, setView, openPatientDetail, getPatientHandler, getAssignedCTA, assignedPatients
}) => {
  const filteredPatients = selectedStage ? patients.filter(p => p.stage === selectedStage) : patients.filter(p => showDropped || p.stage !== 'dropped');

  // Live call simulation state
  const [liveCallTime, setLiveCallTime] = useState(152); // Start at 2:32
  const [showLiveActivity, setShowLiveActivity] = useState(true);
  
  // Activity feed state
  const [activities, setActivities] = useState([
    { id: 1, agent: 'Sarah', action: 'completed intake', detail: 'New patient · Emily Chen', time: 'now', isNew: true },
    { id: 2, agent: 'Susan', action: 'checking benefits', detail: 'Portal lookup · Cigna', time: '1m', isNew: false },
    { id: 3, agent: 'Sarah', action: 'scheduled follow-up', detail: `${getRelativeDateWithDay(1)}, 3:00 PM`, time: '2m', isNew: false },
    { id: 4, agent: 'Sarah', action: 'completed intake', detail: 'New patient · Emily Chen', time: '3m', isNew: false },
  ]);

  // Simulated AI activity on columns
  const [columnActivity, setColumnActivity] = useState({
    extraction: { active: false, action: '' },
    outreach: { active: true, action: 'TAKING CALL' },
    intake: { active: false, action: '' },
    verification: { active: true, action: 'CHECKING BV' },
  });

  // Update live call timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCallTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate column activity
  useEffect(() => {
    const activities = [
      { extraction: { active: true, action: 'EXTRACTING' }, outreach: { active: false, action: '' }, intake: { active: false, action: '' }, verification: { active: true, action: 'CHECKING BV' } },
      { extraction: { active: false, action: '' }, outreach: { active: true, action: 'TAKING CALL' }, intake: { active: false, action: '' }, verification: { active: true, action: 'VERIFYING' } },
      { extraction: { active: false, action: '' }, outreach: { active: true, action: 'DIALING' }, intake: { active: true, action: 'MATCHING' }, verification: { active: false, action: '' } },
      { extraction: { active: true, action: 'PROCESSING' }, outreach: { active: true, action: 'ON CALL' }, intake: { active: false, action: '' }, verification: { active: false, action: '' } },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % activities.length;
      setColumnActivity(activities[idx]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add new activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const pool = getActivityPool();
      const randomActivity = pool[Math.floor(Math.random() * pool.length)];
      const newActivity = {
        id: Date.now(),
        agent: randomActivity.agent,
        action: randomActivity.action,
        detail: randomActivity.detail,
        time: 'now',
        isNew: true,
      };
      
      setActivities(prev => {
        // Update times of existing activities
        const updated = prev.map((a, idx) => ({
          ...a,
          isNew: false,
          time: idx === 0 ? '1m' : idx === 1 ? '2m' : idx === 2 ? '3m' : `${idx + 1}m`
        }));
        // Add new one at top and keep only 4
        return [newActivity, ...updated].slice(0, 4);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatCallTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full">
      {/* Main content */}
      <div className="p-6 overflow-auto h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedStage(null)} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${!selectedStage ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>All <span className={`text-xs ${!selectedStage ? 'text-gray-300' : 'text-gray-400'}`}>{patients.filter(p => showDropped || p.stage !== 'dropped').length}</span></button>
            {stages.filter(s => s.id !== 'dropped' && s.id !== 'completed' && s.id !== 'verification').map(stage => {
              const count = patients.filter(p => p.stage === stage.id).length;
              const stageColor = stage.id === 'extraction' ? 'bg-blue-500' : stage.id === 'outreach' ? 'bg-amber-500' : stage.id === 'intake' ? 'bg-blue-500' : 'bg-emerald-500';
              return (
                <button key={stage.id} onClick={() => setSelectedStage(stage.id)} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${selectedStage === stage.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedStage === stage.id ? 'bg-white' : stageColor}`}></span>
                  {stage.name} <span className={`text-xs ${selectedStage === stage.id ? 'text-gray-300' : 'text-gray-400'}`}>{count}</span>
                </button>
              );
            })}
            <button onClick={() => setSelectedStage('verification')} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${selectedStage === 'verification' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              <span className={`w-2 h-2 rounded-full ${selectedStage === 'verification' ? 'bg-white' : 'bg-emerald-500'}`}></span>
              Booked <span className={`text-xs ${selectedStage === 'verification' ? 'text-gray-300' : 'text-gray-400'}`}>{patients.filter(p => p.stage === 'verification').length}</span>
            </button>
            {showDropped && (
              <button onClick={() => setSelectedStage('dropped')} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${selectedStage === 'dropped' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <span className={`w-2 h-2 rounded-full ${selectedStage === 'dropped' ? 'bg-white' : 'bg-red-500'}`}></span>
                Dropped <span className={`text-xs ${selectedStage === 'dropped' ? 'text-gray-300' : 'text-gray-400'}`}>{patients.filter(p => p.stage === 'dropped').length}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={showDropped} onChange={(e) => setShowDropped(e.target.checked)} className="rounded border-gray-300" />Show dropped</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-600">
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button onClick={() => setView('kanban')} className={`p-1.5 rounded ${view === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-500'}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg></button>
              <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg></button>
            </div>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Patient</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 w-12">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Handler</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Insurance</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.filter(p => !selectedStage || p.stage === selectedStage).map(patient => {
                  const handler = getPatientHandler(patient);
                  const stageColor = patient.stage === 'extraction' ? 'bg-blue-500' : patient.stage === 'outreach' ? 'bg-amber-500' : patient.stage === 'intake' ? 'bg-blue-500' : patient.stage === 'verification' ? 'bg-emerald-500' : 'bg-red-400';
                  const stageName = patient.stage === 'extraction' ? 'Data Extraction' : patient.stage === 'outreach' ? 'Patient Contact' : patient.stage === 'intake' ? 'Intake & Scheduling' : patient.stage === 'verification' ? 'Booked' : patient.stage === 'dropped' ? 'Dropped' : patient.stage;
                  
                  const getProposedAction = () => {
                    if (patient.stage === 'dropped') return { label: 'View Details', style: 'border border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50' };
                    if (patient.stage === 'verification') return { label: 'View in EHR', style: 'border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50' };
                    if (patient.escalated) return { label: getAssignedCTA(patient), style: 'border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50' };
                    if (patient.daysWaiting && patient.daysWaiting >= 3) return { label: 'Take Over', style: 'border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50' };
                    if (assignedPatients[patient.id]) return { label: getAssignedCTA(patient), style: 'border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50' };
                    return null;
                  };
                  const proposedAction = getProposedAction();
                  
                  return (
                    <tr key={patient.id} className={`border-b border-gray-100 hover:bg-gray-50 ${patient.stage === 'dropped' ? 'bg-gray-50 opacity-75' : ''}`} style={patient.stage !== 'dropped' ? getAgingStyle(patient.daysWaiting) : {}}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${patient.stage === 'dropped' ? 'text-gray-500' : 'text-gray-900'}`}>{patient.name || patient.sourceId}</span>
                          {patient.escalated && <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        </div>
                        <p className="text-xs text-gray-400">{patient.dob || '—'}</p>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-400">{getSourceIcon(patient.source)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          <span className={`w-1.5 h-1.5 rounded-full ${stageColor}`}></span>
                          {stageName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {patient.stage === 'verification' || patient.stage === 'dropped' ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : handler.type === 'AI' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            AI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {handler.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{patient.insurance || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{patient.time}</td>
                      <td className="px-4 py-3">
                        {patient.stage === 'dropped' ? (
                          <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">{patient.droppedReason}</span>
                        ) : patient.stage === 'verification' && patient.appointmentDate ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {patient.appointmentDate?.replace(/, \d{4}$/, '')}
                          </span>
                        ) : patient.escalated ? (
                          <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded">Escalated</span>
                        ) : patient.daysWaiting && patient.daysWaiting >= 5 ? (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Stale</span>
                        ) : patient.daysWaiting && patient.daysWaiting >= 3 ? (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">At risk</span>
                        ) : (
                          <span className="text-xs text-gray-400">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {proposedAction ? (
                          <button onClick={() => openPatientDetail(patient, 'panel')} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${proposedAction.style}`}>
                            {proposedAction.label}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className={`${selectedStage ? '' : 'flex gap-4 overflow-x-auto'}`}>
            {['extraction', 'outreach', 'intake', 'verification'].map(stageId => {
              if (selectedStage && selectedStage !== stageId) return null;
              const stagePatients = patients.filter(p => p.stage === stageId);
              const stageColor = stageId === 'extraction' ? 'bg-blue-500' : stageId === 'outreach' ? 'bg-amber-500' : stageId === 'intake' ? 'bg-blue-500' : 'bg-emerald-500';
              const stageName = stageId === 'extraction' ? 'NEW' : stageId === 'outreach' ? 'CONTACTING' : stageId === 'intake' ? 'SCHEDULING' : 'COMPLETED';
              const activity = columnActivity[stageId as keyof typeof columnActivity];
              
              return (
                <div key={stageId} className={selectedStage ? '' : 'flex-1 min-w-[280px]'}>
                  {/* Column Header with Live Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stageColor}`}></span>
                      <h3 className="text-xs font-semibold text-gray-700 tracking-wide">{stageName}</h3>
                      {activity.active && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full animate-pulse-soft">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-medium text-emerald-700">{activity.action}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{stagePatients.length}</span>
                  </div>
                  
                  <div className={`space-y-2 ${selectedStage ? 'grid grid-cols-4 gap-2 space-y-0' : ''}`}>
                    {stagePatients.map((patient, idx) => {
                      const handler = getPatientHandler(patient);
                      const insuranceBadge = getInsuranceBadge(patient.insurance);
                      const isActiveCard = activity.active && idx === 0;
                      
                      const getCardCTA = () => {
                        if (stageId === 'verification') return null;
                        if (patient.escalated) return getAssignedCTA(patient);
                        if (patient.daysWaiting && patient.daysWaiting >= 3) return 'Take Over';
                        if (assignedPatients[patient.id]) return getAssignedCTA(patient);
                        return null;
                      };
                      const cardCTA = getCardCTA();
                      
                      return (
                        <div 
                          key={patient.id} 
                          onClick={() => openPatientDetail(patient, 'panel')} 
                          className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200
                            ${patient.escalated ? 'border-amber-300 border-l-4 border-l-amber-400' : 'border-gray-200 hover:border-gray-300'}
                            ${isActiveCard ? 'ring-2 ring-emerald-200 animate-card-highlight' : ''}`} 
                          style={getAgingStyle(patient.daysWaiting)}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate">{patient.name || patient.sourceId}</span>
                              {handler.type === 'AI' && (
                                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">AI</span>
                              )}
                              {patient.escalated && <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">{patient.time}</span>
                          </div>
                          
                          {/* Card Content */}
                          <div className="text-xs text-gray-500 mb-2">
                            {patient.source === 'call' && 'Phone call'} 
                            {patient.source === 'fax' && 'Referral'} 
                            {patient.source === 'form' && 'Web form'} 
                            {patient.source === 'email' && 'Email'}
                            {patient.reason && <span className="text-gray-400"> • {patient.reason}</span>}
                          </div>

                          {/* Active AI Progress */}
                          {isActiveCard && stageId === 'outreach' && (
                            <div className="mb-3 px-2 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">📞</span>
                                <span className="text-xs text-gray-600">AI on call</span>
                                <span className="text-xs text-gray-400 font-mono">• {formatCallTime(liveCallTime)}</span>
                              </div>
                              {/* Waveform animation */}
                              <div className="flex items-center gap-0.5 mt-2 justify-center">
                                {[...Array(12)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="w-1 bg-gray-300 rounded-full animate-wave"
                                    style={{ 
                                      height: `${8 + Math.sin(i * 0.5) * 6}px`,
                                      animationDelay: `${i * 0.1}s`
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          )}

                          {isActiveCard && stageId === 'verification' && (
                            <div className="mb-3 px-2 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-gray-400">🔄</span>
                                <span className="text-xs text-gray-600">Verifying {patient.insurance || 'insurance'}</span>
                              </div>
                              {/* Progress bar animation */}
                              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full animate-progress"></div>
                              </div>
                            </div>
                          )}

                          {/* Tags Row */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {insuranceBadge && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${insuranceBadge.bg} ${insuranceBadge.text}`}>
                                {insuranceBadge.name}
                              </span>
                            )}
                            {patient.reason && patient.reason.includes('In-person') && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">In-person pref</span>
                            )}
                            {patient.reason && patient.reason.includes('Telehealth') && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Telehealth</span>
                            )}
                            {patient.daysWaiting && patient.daysWaiting >= 5 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Stale</span>
                            )}
                            {patient.daysWaiting && patient.daysWaiting >= 3 && patient.daysWaiting < 5 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">At risk</span>
                            )}
                            {!patient.name && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">New patient</span>
                            )}
                          </div>

                          {/* Status Row */}
                          <div className="flex items-center justify-between text-xs">
                            {stageId === 'verification' && patient.appointmentDate ? (
                              <>
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                  All set
                                </span>
                                <span className="text-gray-500">Appt: {patient.appointmentDate?.replace(/, \d{4}$/, '')}</span>
                              </>
                            ) : patient.escalated ? (
                              <>
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px]">Needs attention</span>
                              </>
                            ) : (
                              <>
                                {patient.status && (
                                  <span className="text-gray-500">{patient.status}</span>
                                )}
                              </>
                            )}
                          </div>

                          {cardCTA && (
                            <div className="flex justify-end mt-2">
                              <button onClick={(e) => { e.stopPropagation(); openPatientDetail(patient, 'panel'); }} className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                {cardCTA}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {showDropped && (!selectedStage || selectedStage === 'dropped') && (
              <div className={`${selectedStage ? '' : 'flex-1 min-w-[280px]'} ${!selectedStage ? 'ml-2 pl-4 border-l-2 border-dashed border-gray-200' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <h3 className="text-xs font-semibold text-gray-500 tracking-wide">DROPPED</h3>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{patients.filter(p => p.stage === 'dropped').length}</span>
                </div>
                <div className={`space-y-2 ${selectedStage ? 'grid grid-cols-4 gap-2 space-y-0' : ''}`}>
                  {patients.filter(p => p.stage === 'dropped').map(patient => (
                    <div key={patient.id} onClick={() => openPatientDetail(patient, 'panel')} className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 opacity-75">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 truncate">{patient.name || patient.sourceId}</span>
                        <span className="text-xs text-gray-400">{patient.time}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{patient.dob || '—'}</div>
                      <div className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">{patient.droppedReason || 'Unknown reason'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Live Activity Panel - Bottom Right Floating */}
      {view === 'kanban' && (
        <div className={`fixed bottom-6 right-6 bg-white border border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden transition-all duration-300 ${showLiveActivity ? 'w-80' : 'w-auto'}`}>
          <div 
            className={`px-4 py-3 flex items-center justify-between bg-gray-50/80 cursor-pointer hover:bg-gray-100/80 transition-colors ${showLiveActivity ? 'border-b border-gray-100' : ''}`}
            onClick={() => setShowLiveActivity(!showLiveActivity)}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-900">Live Activity</span>
            </div>
            <div className="p-1 text-gray-400">
              <svg className={`w-4 h-4 transition-transform duration-200 ${showLiveActivity ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          
          {showLiveActivity && (
            <div className="max-h-64 overflow-auto p-3">
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-all duration-500 ${activity.isNew ? 'bg-emerald-50 animate-slideIn' : 'bg-gray-50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.isNew ? 'bg-emerald-500 animate-status-blink' : 'bg-amber-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.agent}</span>
                        <span className="text-gray-500"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {activity.isNew && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium animate-bounce-subtle">now</span>
                      )}
                      {!activity.isNew && (
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowTab;
