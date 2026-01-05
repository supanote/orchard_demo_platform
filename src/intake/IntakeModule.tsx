import React, { useState, useEffect, useCallback } from 'react';
import type { Patient } from './types';
import { stages, patients as staticPatients, tasks, agents, activityFeed } from './data';
import { getNextMondayShort } from './utils/dateHelpers';
import SummaryTab from './components/SummaryTab';
import WorkflowTab from './components/WorkflowTab';
import TasksTab from './components/TasksTab';
import SidePanel from './components/SidePanel';
import PatientDetailV8 from './PatientDetailV8';
import SettingsTab from './components/SettingsTab';

// API URL for patient management
const API_URL = 'https://ai-staging.supa-health.ai';

// John Smith - The API-controlled patient
const JOHN_SMITH_PATIENT: Patient = {
  id: 9999,
  name: 'John Smith',
  dob: 'May 22, 1985',
  phone: '(410) 555-8923',
  insurance: 'CareFirst',
  memberId: '2452467',
  reason: 'Anxiety from work stress',
  source: 'call',
  stage: 'verification',
  stageOrder: 4,
  time: 'Just now',
  status: 'Booked',
  handledBy: 'AI',
  escalated: false,
  appointmentDate: getNextMondayShort(), // Next Monday
  appointmentTime: '9:30 AM',
  provider: 'Dr. Amanda Puckett',
  benefitsVerified: true,
  copay: '$30',
};

const IntakeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [view, setView] = useState('kanban');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('7d');
  const [showDropped, setShowDropped] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailViewMode, setDetailViewMode] = useState<string | null>(null);
  const [initialFullViewTab, setInitialFullViewTab] = useState('extraction');
  const [assignedPatients, setAssignedPatients] = useState<Record<number, string | null>>({});
  const [animatedCounts, setAnimatedCounts] = useState({ total: 0, booked: 0, inProgress: 0, avgTime: 0, escalated: 0 });
  
  // Settings panel state
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  
  // API Patient state
  const [apiPatient, setApiPatient] = useState<Patient | null>(null);
  
  // Combined patients: API patient (if exists) + static patients
  const patients = apiPatient ? [apiPatient, ...staticPatients] : staticPatients;
  
  // Summary Dashboard filters
  const [summaryTimePeriod, setSummaryTimePeriod] = useState('30d');
  const [summarySource, setSummarySource] = useState('all');
  const [summaryPayer, setSummaryPayer] = useState('all');
  const [compareToPreview, setCompareToPreview] = useState(false);

  // Listen for Practice Settings sidebar click
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettingsPanel(true);
    };
    
    window.addEventListener('openPracticeSettings', handleOpenSettings);
    return () => window.removeEventListener('openPracticeSettings', handleOpenSettings);
  }, []);

  // Poll API for patient status
  useEffect(() => {
    const checkPatientStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient`);
        const data = await res.json();
        
        if (data.patientAdded && !apiPatient) {
          setApiPatient({ ...JOHN_SMITH_PATIENT, time: 'Just now', createdAt: Date.now() });
        } else if (!data.patientAdded && apiPatient) {
          setApiPatient(null);
          // Close panel if viewing the API patient
          if (selectedPatient?.id === JOHN_SMITH_PATIENT.id) {
            setSelectedPatient(null);
            setDetailViewMode(null);
          }
        }
      } catch {
        // API not available, ignore
      }
    };
    
    // Check immediately on mount
    checkPatientStatus();
    
    // Then poll every 2 seconds
    const interval = setInterval(checkPatientStatus, 2000);
    return () => clearInterval(interval);
  }, [apiPatient, selectedPatient]);
  
  // Listen for settings panel open event from sidebar
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettingsPanel(true);
    };
    
    window.addEventListener('openSettings', handleOpenSettings);
    return () => window.removeEventListener('openSettings', handleOpenSettings);
  }, []);

  // Delete API patient function (for Settings tab)
  const deleteApiPatient = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/patient`, { method: 'DELETE' });
      setApiPatient(null);
      if (selectedPatient?.id === JOHN_SMITH_PATIENT.id) {
        setSelectedPatient(null);
        setDetailViewMode(null);
      }
    } catch (e) {
      console.error('Failed to delete patient:', e);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const targets = { total: 47, booked: 23, inProgress: 12, avgTime: 2.3, escalated: 3 };
    const duration = 1500, steps = 30;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setAnimatedCounts({
        total: Math.round(targets.total * eased),
        booked: Math.round(targets.booked * eased),
        inProgress: Math.round(targets.inProgress * eased),
        avgTime: Math.round(targets.avgTime * eased * 10) / 10,
        escalated: Math.round(targets.escalated * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const openPatientDetail = (patient: Patient, mode = 'panel', initialTab: string | null = null) => { 
    setSelectedPatient(patient); 
    setDetailViewMode(mode); 
    if (mode === 'full') {
      setInitialFullViewTab(initialTab || 'extraction');
    }
  };
  
  const closeDetail = () => { 
    setSelectedPatient(null); 
    setDetailViewMode(null); 
  };

  const getEscalationTab = (patient: Patient) => {
    switch (patient.stage) {
      case 'extraction': return 'extraction';
      case 'outreach': return 'outreach';
      case 'intake': return 'intake';
      case 'verification': return 'verification';
      default: return 'extraction';
    }
  };

  const handleEscalatedCTA = (patient: Patient) => {
    const targetTab = getEscalationTab(patient);
    openPatientDetail(patient, 'full', targetTab);
  };

  const handleTakeOver = (patientId: number) => {
    setAssignedPatients(prev => ({ ...prev, [patientId]: 'Jane D.' }));
  };

  const handleHandBack = (patientId: number) => {
    setAssignedPatients(prev => ({ ...prev, [patientId]: null }));
  };

  const getPatientHandler = (patient: Patient) => {
    if (assignedPatients[patient.id] !== undefined) {
      return assignedPatients[patient.id] ? { type: 'human', name: assignedPatients[patient.id]! } : { type: 'AI', name: 'AI' };
    }
    return patient.handledBy === 'AI' ? { type: 'AI', name: 'AI' } : { type: 'human', name: patient.assignedTo || '' };
  };

  const getAssignedCTA = (patient: Patient) => {
    switch (patient.stage) {
      case 'extraction': return 'Review Document';
      case 'outreach': return 'Call Patient';
      case 'intake': return 'Find Provider';
      case 'verification': return 'Verify Benefits';
      default: return 'Continue';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Intake</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Zendesk
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync EHR
            </button>
            <span className="text-sm text-gray-500">Orchard Mental Health</span>
          </div>
        </div>
        <div className="px-6 flex gap-1">
          {['summary', 'workflow', 'tasks'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 text-sm font-medium border-b-2 capitalize flex items-center gap-2 ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
            >
              {tab}
              {tab === 'tasks' && tasks.filter(t => !t.assignedTo).length > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {tasks.filter(t => !t.assignedTo).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {activeTab === 'summary' && (
          <SummaryTab
            summaryTimePeriod={summaryTimePeriod}
            setSummaryTimePeriod={setSummaryTimePeriod}
            summarySource={summarySource}
            setSummarySource={setSummarySource}
            summaryPayer={summaryPayer}
            setSummaryPayer={setSummaryPayer}
            compareToPreview={compareToPreview}
            setCompareToPreview={setCompareToPreview}
            animatedCounts={animatedCounts}
            tasks={tasks}
            agents={agents}
            activityFeed={activityFeed}
            patients={patients}
            setActiveTab={setActiveTab}
            openPatientDetail={openPatientDetail}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowTab
            stages={stages}
            patients={patients}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            showDropped={showDropped}
            setShowDropped={setShowDropped}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            view={view}
            setView={setView}
            openPatientDetail={openPatientDetail}
            getPatientHandler={getPatientHandler}
            getAssignedCTA={getAssignedCTA}
            assignedPatients={assignedPatients}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            patients={patients}
            openPatientDetail={openPatientDetail}
          />
        )}

      </div>

      {/* Settings Side Panel */}
      {showSettingsPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowSettingsPanel(false)}></div>
          <aside className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <button onClick={() => setShowSettingsPanel(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <SettingsTab
                apiPatient={apiPatient}
                onDeletePatient={deleteApiPatient}
                apiUrl={API_URL}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Side Panel */}
      {selectedPatient && detailViewMode === 'panel' && (
        <SidePanel
          patient={selectedPatient}
          closeDetail={closeDetail}
          setDetailViewMode={setDetailViewMode}
          getAssignedCTA={getAssignedCTA}
          handleEscalatedCTA={handleEscalatedCTA}
          assignedPatients={assignedPatients}
          handleTakeOver={handleTakeOver}
          handleHandBack={handleHandBack}
        />
      )}

      {/* Full Page Detail */}
      {selectedPatient && detailViewMode === 'full' && (
        <PatientDetailV8 patient={selectedPatient} onBack={closeDetail} initialTab={initialFullViewTab} />
      )}
    </div>
  );
};

export default IntakeModule;

