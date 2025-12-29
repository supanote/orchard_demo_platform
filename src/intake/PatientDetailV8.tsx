import React, { useState } from 'react';

interface Patient {
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
}

interface PatientDetailV8Props {
  patient: Patient;
  onBack: () => void;
  initialTab?: string;
}

const PatientDetailV8: React.FC<PatientDetailV8Props> = ({ patient, onBack, initialTab = 'extraction' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [reviewingField, setReviewingField] = useState<{ field: string; value: string; confidence: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1, 4]);
  const [expandedFunnelStage, setExpandedFunnelStage] = useState<number | null>(null);
  const [bvSourceType, setBvSourceType] = useState('edi');

  const patientData = {
    name: patient?.name || 'Sarah Chen',
    dob: patient?.dob || '03/15/1988',
    phone: patient?.phone || '(555) 123-4567',
    currentStage: patient?.stageOrder || 4,
    isEscalated: patient?.escalated || false,
  };

  const stages = [
    { id: 'extraction', name: 'Data Extraction', order: 0 },
    { id: 'outreach', name: 'Patient Outreach', order: 1 },
    { id: 'intake', name: 'Intake & Scheduling', order: 2 },
    { id: 'verification', name: 'Benefits Verification', order: 3 },
    { id: 'completed', name: 'Completed', order: 4 },
  ];

  const agentSteps = [
    { id: 1, name: 'Data Extraction', status: 'complete', time: '9:42 AM', duration: '< 1 min', activities: [{ action: 'Fax received from Austin Family Medicine', time: '9:42:01 AM', status: 'complete' }, { action: 'Document type identified: Patient Referral', time: '9:42:03 AM', status: 'complete' }, { action: 'Patient demographics extracted (4 fields)', time: '9:43:01 AM', status: 'complete' }, { action: 'Member ID flagged for review (67% confidence)', time: '9:43:30 AM', status: 'warning' }] },
    { id: 2, name: 'Patient Outreach', status: 'complete', time: '9:45 AM', duration: '33 min', activities: [{ action: 'Patient added to outreach queue', time: '9:45:00 AM', status: 'complete' }, { action: 'Outbound call initiated', time: '10:15:00 AM', status: 'complete' }, { action: 'Call connected with patient', time: '10:15:08 AM', status: 'complete' }] },
    { id: 3, name: 'Intake & Scheduling', status: 'complete', time: '10:15 AM', duration: '3 min', activities: [{ action: 'DOB verified via conversation', time: '10:15:32 AM', status: 'complete' }, { action: 'Insurance confirmed', time: '10:15:42 AM', status: 'complete' }, { action: 'Appointment booked', time: '10:19:00 AM', status: 'complete' }] },
    { id: 4, name: 'Benefits Verification', status: 'complete', time: '10:19 AM', duration: '15 sec', activities: [{ action: 'EDI 270 request sent to Aetna', time: '10:19:05 AM', status: 'complete' }, { action: 'EDI 271 response received', time: '10:19:12 AM', status: 'complete' }, { action: 'Coverage confirmed: Active, $30 copay', time: '10:19:15 AM', status: 'complete' }] },
  ];

  const referralFields = [
    { section: 'Patient', field: 'Name', value: patientData.name, confidence: 98, status: 'ok' },
    { section: 'Patient', field: 'DOB', value: patientData.dob, confidence: 99, status: 'ok' },
    { section: 'Patient', field: 'Phone', value: patientData.phone, confidence: 95, status: 'ok' },
    { section: 'Insurance', field: 'Payer', value: patient?.insurance || 'Aetna', confidence: 96, status: 'ok' },
    { section: 'Insurance', field: 'Member ID', value: patient?.memberId || 'W123456789', confidence: 67, status: 'review' },
    { section: 'Service', field: 'Reason', value: patient?.reason || 'Anxiety, Depression', confidence: 94, status: 'ok' },
  ];

  const outreachFields = [
    { field: 'DOB Verified', value: patientData.dob, source: '0:32', timestamp: 32, status: 'verified' },
    { field: 'Insurance Verified', value: patient?.insurance || 'Aetna', source: '0:42', timestamp: 42, status: 'verified' },
    { field: 'Availability', value: 'Afternoons, after 3pm', source: '1:38', timestamp: 98, status: 'extracted' },
  ];

  const transcriptLines = [
    { time: '0:00', timestamp: 0, speaker: 'AI', text: 'Hi, this is calling from Mindful Recovery Center. Am I speaking with ' + patientData.name + '?' },
    { time: '0:08', timestamp: 8, speaker: 'Patient', text: 'Yes, this is ' + (patientData.name?.split(' ')[0] || 'me') + '.' },
    { time: '0:32', timestamp: 32, speaker: 'Patient', text: patientData.dob?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3') || '', highlight: 'DOB Verified', extracted: true },
    { time: '0:42', timestamp: 42, speaker: 'Patient', text: 'Yes, I have ' + (patient?.insurance || 'Aetna') + ' through my employer.', highlight: 'Insurance Verified', extracted: true },
    { time: '1:38', timestamp: 98, speaker: 'Patient', text: 'Afternoons work best for me. I usually finish work around 3pm.', highlight: 'Availability', extracted: true },
  ];

  const matchingFunnel = [
    { stage: 'Payer Accepted', count: 13, description: 'Accept ' + (patient?.insurance || 'Aetna'), providers: ['Dr. Emily Watson', 'Dr. James Liu', 'Sarah Martinez, LCSW'] },
    { stage: 'Clinical Match', count: 8, description: 'Specialize in ' + (patient?.reason || 'Anxiety'), providers: ['Dr. Emily Watson', 'Dr. James Liu'] },
    { stage: 'Availability', count: 3, description: 'Have slots after 3pm', providers: ['Dr. Emily Watson'] },
    { stage: 'Selected', count: 1, description: 'Best match', providers: ['Dr. Emily Watson'] },
  ];

  const bvResults = { status: 'Active', payer: patient?.insurance || 'Aetna', memberId: patient?.memberId || 'W123456789', networkStatus: 'In-Network', copay: patient?.copay || '$30', coinsurance: '20%', deductible: '$500 (met)', oopMax: '$3,000', visitLimit: 'Unlimited', priorAuth: 'Not required' };

  const toggleStep = (stepId: number) => setExpandedSteps(prev => prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]);
  const getStageState = (stageOrder: number) => stageOrder < patientData.currentStage ? 'completed' : stageOrder === patientData.currentStage ? 'current' : 'pending';
  const handleReviewClick = (field: { field: string; value: string; confidence: number }) => { setReviewingField(field); setEditValue(field.value); };
  const handleSaveReview = () => { setReviewingField(null); setEditValue(''); };
  const handleTimestampClick = (timestamp: number | null) => { if (timestamp !== null) { setCurrentTime(timestamp); setIsPlaying(true); } };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const ConfidenceBadge = ({ score, status }: { score: number; status: string }) => status === 'review' ? <span className="text-xs text-gray-600 font-medium">{score}%</span> : <span className="text-xs text-gray-400">{score}%</span>;
  
  const SourceBadge = ({ type }: { type: string }) => {
    const config: Record<string, { icon: string; label: string }> = { fax: { icon: '📄', label: 'Fax' }, email: { icon: '✉️', label: 'Email' }, call: { icon: '📞', label: 'Call' }, edi: { icon: '🔌', label: 'EDI 270/271' }, portal: { icon: '🖥️', label: 'Portal' } };
    const { icon, label } = config[type] || config.fax;
    return <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm"><span>{icon}</span><span className="text-gray-600">{label}</span></div>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto w-screen">
      <header className="border-b border-gray-100">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Back to Intake</button>
              <div>
                <div className="flex items-center gap-3"><h1 className="text-lg font-medium text-gray-900">{patientData.name}</h1>{patientData.isEscalated && <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Escalated</span>}</div>
                <p className="text-sm text-gray-400">DOB: {patientData.dob}</p>
              </div>
            </div>
            <button onClick={() => setShowAgentPanel(!showAgentPanel)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg ${showAgentPanel ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Agent Activity</button>
          </div>
          <div className="flex items-center gap-3 mt-6">
            {stages.map((stage, index) => {
              const state = getStageState(stage.order);
              return (
                <React.Fragment key={stage.id}>
                  <button onClick={() => setActiveTab(stage.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${activeTab === stage.id ? 'bg-gray-900 text-white' : state === 'completed' ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300'}`}>
                    {state === 'completed' && activeTab !== stage.id && <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    {stage.name}
                  </button>
                  {index < stages.length - 1 && <svg className="w-4 h-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      <main className={`w-full transition-all ${showAgentPanel ? 'mr-80' : ''}`}>
        {/* DATA EXTRACTION TAB */}
        {activeTab === 'extraction' && (
          <div className="flex w-full h-[calc(100vh-140px)]">
            <div className="flex-[6] border-r border-gray-100 overflow-auto bg-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><SourceBadge type={patient?.source || 'fax'} /><span className="text-sm text-gray-500">from Austin Family Medicine</span><span className="text-sm text-gray-400">• Dec 26, 9:42 AM</span></div>
              </div>
              <div className="bg-white shadow-lg rounded-sm overflow-hidden" style={{ fontFamily: 'Courier, monospace' }}>
                <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 text-xs text-gray-500">
                  <div className="flex justify-between"><span>FAX TRANSMISSION</span><span>12/26/2025 09:42 AM</span></div>
                  <div className="flex justify-between mt-1"><span>FROM: AUSTIN FAMILY MEDICINE</span><span>PAGE 1 OF 1</span></div>
                </div>
                <div className="px-8 py-6 text-sm leading-relaxed">
                  <div className="text-center mb-6 pb-4 border-b border-gray-300"><p className="font-bold text-base">AUSTIN FAMILY MEDICINE</p><p className="text-xs text-gray-600">1500 Medical Parkway, Suite 200, Austin, TX 78756</p></div>
                  <p className="font-bold text-center mb-6">PATIENT REFERRAL FORM</p>
                  <div className="mb-5"><p className="font-bold text-xs mb-2 underline">PATIENT INFORMATION</p>
                    <p>Patient Name: <span className="px-0.5 bg-gray-100">{patientData.name}</span></p>
                    <p>Date of Birth: <span className="px-0.5 bg-gray-100">{patientData.dob}</span></p>
                    <p>Phone: <span className="px-0.5 bg-gray-100">{patientData.phone}</span></p>
                  </div>
                  <div className="mb-5"><p className="font-bold text-xs mb-2 underline">INSURANCE INFORMATION</p>
                    <p>Insurance: <span className="px-0.5 bg-gray-100">{patient?.insurance || 'Aetna'}</span></p>
                    <p>Member ID: <span className="px-0.5 bg-gray-100 border-b-2 border-gray-400 border-dashed">{patient?.memberId || 'W123456789'}</span><span className="text-[10px] text-gray-600 ml-1">(unclear)</span></p>
                  </div>
                  <div className="mb-5"><p className="font-bold text-xs mb-2 underline">REFERRAL DETAILS</p>
                    <p>Service Requested: <span className="px-0.5 bg-gray-100">Individual Therapy</span></p>
                    <p>Reason: <span className="px-0.5 bg-gray-100">{patient?.reason || 'Anxiety, Depression'}</span></p>
                  </div>
                  <div className="pt-4 border-t border-gray-300"><p className="italic">Electronically signed by Dr. Michael Roberts, MD</p><p className="text-xs text-gray-500">Date: 12/26/2025</p></div>
                </div>
              </div>
            </div>
            <div className="flex-[4] overflow-auto p-6">
              <div className="flex items-center justify-between mb-5"><div><span className="text-sm font-medium text-gray-900">Extracted Data</span><span className="text-xs text-gray-400 ml-2">6 fields</span></div>
                {!reviewingField && <div className="flex items-center gap-2"><span className="w-2 h-2 bg-gray-400 rounded-full"></span><span className="text-xs text-gray-600">1 needs review</span></div>}
              </div>
              {reviewingField && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3"><div><p className="text-sm font-medium text-gray-800">Review: {reviewingField.field}</p><p className="text-xs text-gray-600 mt-0.5">Low confidence ({reviewingField.confidence}%)</p></div><button onClick={() => setReviewingField(null)} className="text-gray-600 hover:text-gray-800">✕</button></div>
                  <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <div className="flex gap-2 mt-3"><button onClick={handleSaveReview} className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg">Verify & Save</button><button onClick={() => setReviewingField(null)} className="py-2 px-4 text-gray-700 text-sm rounded-lg border border-gray-300">Cancel</button></div>
                </div>
              )}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Field</th><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Value</th><th className="text-right px-4 py-2 text-xs font-medium text-gray-500 w-12">Conf.</th><th className="w-16"></th></tr></thead>
                  <tbody>
                    {referralFields.map((row, index) => {
                      const isFirstInSection = index === 0 || referralFields[index - 1].section !== row.section;
                      const isReviewing = reviewingField?.field === row.field;
                      return (
                        <React.Fragment key={index}>
                          {isFirstInSection && <tr className="bg-gray-50"><td colSpan={4} className="px-4 py-1.5 text-[10px] font-medium text-gray-400 uppercase">{row.section}</td></tr>}
                          <tr className={`border-b border-gray-50 ${row.status === 'review' && !isReviewing ? 'bg-gray-50/50' : ''} ${isReviewing ? 'bg-gray-100' : ''}`}>
                            <td className="px-4 py-2 text-gray-500">{row.field}</td>
                            <td className="px-4 py-2 text-gray-900">{row.value}</td>
                            <td className="px-4 py-2 text-right"><ConfidenceBadge score={row.confidence} status={row.status} /></td>
                            <td className="px-4 py-2 text-right">{row.status === 'review' && !isReviewing && <button onClick={() => handleReviewClick(row)} className="text-xs text-gray-600 font-medium">Review</button>}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex gap-3"><button className="flex-1 py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">Start Outreach</button><button className="py-2.5 px-4 text-gray-600 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Edit</button></div>
            </div>
          </div>
        )}

        {/* PATIENT OUTREACH TAB */}
        {activeTab === 'outreach' && (
          <div className="flex w-full h-[calc(100vh-140px)]">
            <div className="flex-[6] border-r border-gray-100 overflow-auto bg-gray-50 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><SourceBadge type="call" /><span className="text-sm text-gray-500">Dec 26, 10:15 AM</span><span className="text-sm text-gray-400">• 4:32</span></div>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span>Connected</span>
              </div>
              <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg inline-flex items-center gap-2 text-sm text-gray-700 self-start"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Contacted within 33 min • SLA met</div>
              <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
                {!showTranscript ? (
                  <div className="flex-1 flex flex-col items-center justify-center"><button onClick={() => setIsPlaying(true)} className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 mb-4"><svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></button><p className="text-sm text-gray-500">Click to play recording</p><p className="text-xs text-gray-400 mt-1">4 min 32 sec</p><button onClick={() => setShowTranscript(true)} className="mt-4 text-sm text-gray-600 hover:text-gray-700 font-medium">View Transcript</button></div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3"><button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></button><span className="text-xs text-gray-500 font-mono">{formatTime(currentTime)} / 4:32</span></div>
                      <button onClick={() => setShowTranscript(false)} className="text-xs text-gray-500">Hide Transcript</button>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                      <div className="space-y-3">
                        {transcriptLines.map((line, index) => (
                          <div key={index} className={`flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${currentTime >= line.timestamp && currentTime < (transcriptLines[index + 1]?.timestamp || 999) ? 'bg-gray-100' : ''}`} onClick={() => handleTimestampClick(line.timestamp)}>
                            <button className="text-xs text-gray-600 font-mono w-10">{line.time}</button>
                            <div className="flex-1"><span className={`text-xs font-medium ${line.speaker === 'Patient' ? 'text-gray-600' : 'text-gray-500'}`}>{line.speaker}</span><p className="text-sm text-gray-700 mt-0.5">{line.text}</p>{line.highlight && <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${line.extracted ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-600'}`}>{line.highlight}</span>}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-[4] overflow-auto p-6">
              <div className="flex items-center justify-between mb-5"><span className="text-sm font-medium text-gray-900">Collected Info</span><span className="flex items-center gap-1.5 text-xs text-gray-600"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Complete</span></div>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Field</th><th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Value</th><th className="text-right px-4 py-2 text-xs font-medium text-gray-500 w-14">Source</th></tr></thead>
                  <tbody>
                    {outreachFields.map((row, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => handleTimestampClick(row.timestamp)}>
                        <td className="px-4 py-2.5 text-gray-500"><span className="flex items-center gap-2">{row.status === 'verified' && <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}{row.status === 'extracted' && <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>}{row.field}</span></td>
                        <td className="px-4 py-2.5 text-gray-900">{row.value}</td>
                        <td className="px-4 py-2.5 text-right"><span className="text-xs text-gray-600 font-mono">{row.source}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6"><button className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">Proceed to Scheduling</button></div>
            </div>
          </div>
        )}

        {/* INTAKE & SCHEDULING TAB */}
        {activeTab === 'intake' && (
          <div className="flex w-full h-[calc(100vh-140px)]">
            <div className="flex-[6] border-r border-gray-100 overflow-auto bg-gray-50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><SourceBadge type="call" /><span className="text-sm text-gray-500">Intake call • Dec 26, 10:15 AM</span></div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Play</button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="px-4 py-3 border-b border-gray-100"><p className="text-sm font-medium text-gray-900">Patient Requirements</p></div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500 w-32">Payer</td><td className="px-4 py-2.5 text-gray-900">{patient?.insurance || 'Aetna'}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Concern</td><td className="px-4 py-2.5 text-gray-900">{patient?.reason || 'Anxiety, Depression'}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Availability</td><td className="px-4 py-2.5 text-gray-900">Afternoons, after 3pm</td></tr>
                    <tr><td className="px-4 py-2.5 text-gray-500">Modality</td><td className="px-4 py-2.5 text-gray-900">Open to telehealth or in-person</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100"><p className="text-sm font-medium text-gray-900">Provider Matching</p></div>
                <div className="p-4 space-y-1">
                  {matchingFunnel.map((step, index) => (
                    <div key={index}>
                      <button onClick={() => setExpandedFunnelStage(expandedFunnelStage === index ? null : index)} className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">{step.count}</div><div className="text-left"><p className="text-sm text-gray-900">{step.stage}</p><p className="text-xs text-gray-400">{step.description}</p></div></div>
                        <svg className={`w-4 h-4 text-gray-400 ${expandedFunnelStage === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </button>
                      {expandedFunnelStage === index && (
                        <div className="ml-12 mr-3 mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-wrap gap-2">{step.providers.map((p, i) => <span key={i} className={`px-2 py-1 text-xs rounded ${p === 'Dr. Emily Watson' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{p}</span>)}</div>
                        </div>
                      )}
                      {index < matchingFunnel.length - 1 && <div className="flex justify-center py-1"><svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-[4] overflow-auto p-6">
              <div className="flex items-center justify-between mb-5"><span className="text-sm font-medium text-gray-900">Appointment</span><span className="flex items-center gap-1.5 text-xs text-gray-600"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Booked</span></div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-start gap-4"><div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xl">📅</div><div><p className="text-base font-medium text-gray-900">{patient?.appointmentDate || 'Tue, Dec 31'}</p><p className="text-sm text-gray-600">{patient?.appointmentTime || '3:30 PM — 4:30 PM'}</p><p className="text-sm text-gray-900 mt-2">{patient?.providerMatch || 'Dr. Emily Watson'}</p><p className="text-xs text-gray-400">Individual Therapy • Telehealth</p></div></div>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Patient</p></div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500 w-24">Name</td><td className="px-4 py-2 text-gray-900">{patientData.name}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500">DOB</td><td className="px-4 py-2 text-gray-900">{patientData.dob}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500">Phone</td><td className="px-4 py-2 text-gray-900">{patientData.phone}</td></tr>
                    <tr><td className="px-4 py-2 text-gray-500">Insurance</td><td className="px-4 py-2 text-gray-900">{patient?.insurance || 'Aetna'}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Pre-Appointment</p></div>
                <div className="p-4 space-y-2">{['Patient portal invite sent', 'Intake forms sent', 'Reminder scheduled', 'Benefits verified'].map((item, i) => <div key={i} className="flex items-center gap-3"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-sm text-gray-600">{item}</span></div>)}</div>
              </div>
            </div>
          </div>
        )}

        {/* BENEFITS VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="flex w-full h-[calc(100vh-140px)]">
            <div className="flex-[6] border-r border-gray-100">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-white">
                  {[{ id: 'edi', label: 'EDI Response' }, { id: 'portal', label: 'Portal Session' }, { id: 'call', label: 'Payer Call' }, { id: 'manual', label: 'Manual Entry' }].map(s => <button key={s.id} onClick={() => setBvSourceType(s.id)} className={`px-3 py-1.5 rounded text-sm ${bvSourceType === s.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{s.label}</button>)}
                </div>
                {bvSourceType === 'edi' && (
                  <div className="flex-1 flex flex-col bg-gray-50">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white"><div className="flex items-center gap-3"><SourceBadge type="edi" /><div><p className="text-sm font-medium text-gray-900">EDI 271 Response</p><p className="text-xs text-gray-400">Aetna • Dec 26, 10:19 AM • 15 sec</p></div></div></div>
                    <div className="flex-1 overflow-auto p-6">
                      <div className="bg-white rounded border border-gray-200 font-mono text-xs overflow-auto">
                        <div className="p-4 text-gray-600 whitespace-pre leading-relaxed">{`ISA*00*          *00*          *ZZ*CLEARINGHOUSE  *ZZ*AETNA         *231226*1019*^*00501*000000001*0*P*:~
GS*HB*CLEARINGHOUSE*AETNA*20251226*1019*1*X*005010X279A1~
ST*271*0001*005010X279A1~
NM1*IL*1*${(patientData.name?.split(' ')[1] || 'CHEN').toUpperCase()}*${(patientData.name?.split(' ')[0] || 'SARAH').toUpperCase()}****MI*${patient?.memberId || 'W123456789'}~
EB*1**30**AETNA CHOICE POS II~
EB*C*IND*30*MA*30~
MSG*UNLIMITED VISITS - NO PRIOR AUTH REQUIRED~
SE*20*0001~
IEA*1*000000001~`}</div>
                      </div>
                    </div>
                  </div>
                )}
                {bvSourceType === 'portal' && (
                  <div className="flex-1 flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white"><div className="flex items-center gap-3"><SourceBadge type="portal" /><div><p className="text-sm font-medium text-gray-900">Aetna Provider Portal</p><p className="text-xs text-gray-400">Dec 26, 10:19 AM • 45 sec</p></div></div></div>
                    <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
                      <button className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"><svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></button>
                      <div className="absolute bottom-4 left-4 right-4"><div className="bg-black/60 rounded px-3 py-2 text-white text-xs">Navigating to member eligibility lookup...</div></div>
                      <div className="absolute top-4 right-4 flex items-center gap-2"><span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span><span className="text-white text-xs">REC 0:45</span></div>
                    </div>
                  </div>
                )}
                {bvSourceType === 'call' && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                    <button className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 mb-4"><svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></button>
                    <p className="text-sm text-gray-500">IVR navigation + agent verification</p>
                    <p className="text-xs text-gray-400 mt-1">8 min 32 sec</p>
                  </div>
                )}
                {bvSourceType === 'manual' && (
                  <div className="flex-1 flex flex-col bg-gray-50">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Manual Verification</p>
                          <p className="text-xs text-gray-400">Entered by Jane D. - Dec 26, 11:45 AM</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Verified by: Jane D.</p>
                            <p className="text-xs text-gray-500">Intake Coordinator</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Verification Method</p>
                          <p className="text-sm text-gray-900">Called Aetna provider line (1-800-624-0756)</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Reference Number</p>
                          <p className="text-sm text-gray-900 font-mono">REF-2024-1226-8847</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</p>
                          <p className="text-sm text-gray-700 leading-relaxed">Spoke with rep Diana (ID #44721). Confirmed active coverage under Choice POS II plan. No prior auth required for outpatient mental health. Benefits verified for dates of service through 12/31/2025.</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">Entered: Dec 26, 2025 at 11:45 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-[4] overflow-auto p-6">
              <div className="flex items-center justify-between mb-5"><span className="text-sm font-medium text-gray-900">Coverage</span><span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded">{bvResults.status}</span></div>
              <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Plan</p></div>
                <table className="w-full text-sm"><tbody>
                  <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500 w-28">Payer</td><td className="px-4 py-2 text-gray-900">{bvResults.payer}</td></tr>
                  <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500">Member ID</td><td className="px-4 py-2 text-gray-900">{bvResults.memberId}</td></tr>
                  <tr><td className="px-4 py-2 text-gray-500">Network</td><td className="px-4 py-2 text-gray-900">{bvResults.networkStatus}</td></tr>
                </tbody></table>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Cost Sharing</p></div>
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-b border-gray-100 text-center"><p className="text-xl font-medium text-gray-900">{bvResults.copay}</p><p className="text-xs text-gray-500">Copay</p></div>
                  <div className="p-4 border-b border-gray-100 text-center"><p className="text-xl font-medium text-gray-900">{bvResults.coinsurance}</p><p className="text-xs text-gray-500">Coinsurance</p></div>
                  <div className="p-4 border-r border-gray-100 text-center"><p className="text-lg font-medium text-gray-900">{bvResults.deductible}</p><p className="text-xs text-gray-500">Deductible</p></div>
                  <div className="p-4 text-center"><p className="text-lg font-medium text-gray-900">{bvResults.oopMax}</p><p className="text-xs text-gray-500">OOP Max</p></div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Limits</p></div>
                <table className="w-full text-sm"><tbody>
                  <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500 w-28">Visits</td><td className="px-4 py-2 text-gray-900">{bvResults.visitLimit}</td></tr>
                  <tr><td className="px-4 py-2 text-gray-500">Prior Auth</td><td className="px-4 py-2 text-gray-900">{bvResults.priorAuth}</td></tr>
                </tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED TAB */}
        {activeTab === 'completed' && (
          <div className="flex w-full h-[calc(100vh-140px)]">
            <div className="flex-[6] border-r border-gray-100 overflow-auto bg-gray-50 p-6">
              <div className="flex items-center justify-between mb-6"><p className="text-sm font-medium text-gray-900">Intake Journey</p><span className="text-xs text-gray-400">Completed in 37 min</span></div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {[{ stage: 'Data Extraction', time: '9:42 AM', detail: 'Fax from Austin Family Medicine', duration: '< 1 min' }, { stage: 'Patient Outreach', time: '10:15 AM', detail: 'Connected on first attempt', duration: '33 min wait' }, { stage: 'Intake & Scheduling', time: '10:17 AM', detail: 'Booked with Dr. Emily Watson', duration: '3 min' }, { stage: 'Benefits Verification', time: '10:19 AM', detail: 'Coverage verified via EDI', duration: '15 sec' }].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>{index < 3 && <div className="w-px h-12 bg-gray-200 my-1"></div>}</div>
                    <div className="flex-1 pb-6"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-900">{step.stage}</p><span className="text-xs text-gray-400">{step.time}</span></div><p className="text-sm text-gray-500 mt-0.5">{step.detail}</p><p className="text-xs text-gray-400 mt-0.5">{step.duration}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="text-xs font-medium text-gray-500 uppercase mb-3">Source Documents</p>
                <div className="space-y-2">
                  {[{ type: 'fax', name: 'Patient Referral Form' }, { type: 'call', name: 'Outreach Recording (4:32)' }, { type: 'edi', name: '271 Eligibility Response' }].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"><div className="flex items-center gap-3"><SourceBadge type={doc.type} /><span className="text-sm text-gray-900">{doc.name}</span></div><button className="text-xs text-gray-500 hover:text-gray-700">View</button></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-[4] overflow-auto p-6">
              <p className="text-sm font-medium text-gray-900 mb-5">Summary</p>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6 text-center"><div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3"><svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><p className="text-base font-medium text-gray-900">Intake Complete</p><p className="text-sm text-gray-500 mt-1">Ready for appointment</p></div>
              <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Appointment</p></div>
                <div className="p-4"><p className="text-sm font-medium text-gray-900">{patient?.appointmentDate || 'Tue, Dec 31'} at {patient?.appointmentTime || '3:30 PM'}</p><p className="text-sm text-gray-600">{patient?.providerMatch || patient?.provider || 'Dr. Emily Watson'}</p><p className="text-xs text-gray-400 mt-1">Individual Therapy • Telehealth</p></div>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Patient</p></div>
                <table className="w-full text-sm"><tbody>
                  <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500 w-24">Name</td><td className="px-4 py-2 text-gray-900">{patientData.name}</td></tr>
                  <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500">DOB</td><td className="px-4 py-2 text-gray-900">{patientData.dob}</td></tr>
                  <tr><td className="px-4 py-2 text-gray-500">Phone</td><td className="px-4 py-2 text-gray-900">{patientData.phone}</td></tr>
                </tbody></table>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Coverage</p></div>
                <table className="w-full text-sm"><tbody>
                  <tr className="border-b border-gray-50"><td className="px-4 py-2 text-gray-500 w-24">Plan</td><td className="px-4 py-2 text-gray-900">{patient?.insurance || 'Aetna'}</td></tr>
                  <tr><td className="px-4 py-2 text-gray-500">Cost</td><td className="px-4 py-2 text-gray-900">{patient?.copay || '$30'} copay</td></tr>
                </tbody></table>
              </div>
              <div className="flex gap-3"><button className="flex-1 py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">Open in EHR</button><button className="py-2 px-4 text-gray-600 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Print</button></div>
            </div>
          </div>
        )}
      </main>

      {/* Agent Activity Side Panel */}
      {showAgentPanel && (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 z-50 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><p className="text-sm font-medium text-gray-900">Agent Activity</p><button onClick={() => setShowAgentPanel(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button></div>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {agentSteps.map(step => (
                <div key={step.id} className="border border-gray-100 rounded-lg overflow-hidden">
                  <button onClick={() => toggleStep(step.id)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.status === 'complete' ? 'bg-gray-100' : 'bg-gray-50'}`}>{step.status === 'complete' && <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div><div className="text-left"><p className="text-sm font-medium text-gray-900">{step.name}</p><p className="text-xs text-gray-400">{step.time} • {step.duration}</p></div></div>
                    <svg className={`w-4 h-4 text-gray-400 ${expandedSteps.includes(step.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSteps.includes(step.id) && step.activities.length > 0 && (
                    <div className="px-4 pb-3 border-t border-gray-50">
                      <div className="ml-3 pl-6 border-l border-gray-200 space-y-2 pt-3">
                        {step.activities.map((activity, idx) => (
                          <div key={idx} className="flex items-start gap-2"><div className={`w-1.5 h-1.5 rounded-full mt-1.5 -ml-[19px] ${activity.status === 'warning' ? 'bg-gray-400' : 'bg-gray-400'}`}></div><div><p className={`text-xs ${activity.status === 'warning' ? 'text-gray-600' : 'text-gray-600'}`}>{activity.action}</p><p className="text-[10px] text-gray-400">{activity.time}</p></div></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50"><p className="text-xs text-gray-400 text-center">Powered by Supa</p></div>
        </aside>
      )}
    </div>
  );
};

export default PatientDetailV8;

