import React, { useState, useEffect } from 'react';
import type { Patient } from './types';
import { stages, patients, tasks, agents, activityFeed } from './data';
import SummaryTab from './components/SummaryTab';
import WorkflowTab from './components/WorkflowTab';
import TasksTab from './components/TasksTab';
import SidePanel from './components/SidePanel';
import PatientDetailV8 from './PatientDetailV8';

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
  
  // Summary Dashboard filters
  const [summaryTimePeriod, setSummaryTimePeriod] = useState('30d');
  const [summarySource, setSummarySource] = useState('all');
  const [summaryPayer, setSummaryPayer] = useState('all');
  const [compareToPreview, setCompareToPreview] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-gray-900 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 font-bold text-lg mb-8">S</div>
        <nav className="flex-1 space-y-2">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Intake</h1>
            <span className="text-sm text-gray-500">Orchard Mental Health</span>
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
      </main>

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

