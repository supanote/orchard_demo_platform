import React, { useState, useRef, useEffect } from 'react';
import type { Patient } from '../types';

interface SidePanelProps {
  patient: Patient;
  closeDetail: () => void;
  setDetailViewMode: (mode: string) => void;
  getAssignedCTA: (patient: Patient) => string;
  handleEscalatedCTA: (patient: Patient) => void;
  assignedPatients: Record<number, string | null>;
  handleTakeOver: (patientId: number) => void;
  handleHandBack: (patientId: number) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  patient, closeDetail, setDetailViewMode, getAssignedCTA,
  handleEscalatedCTA, assignedPatients, handleTakeOver, handleHandBack
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState('summary');
  const [showTakeOverModal, setShowTakeOverModal] = useState(false);
  const [showHandBackModal, setShowHandBackModal] = useState(false);
  
  // Activity video state (for John Smith)
  const activityVideoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const [activityVideoPlaying, setActivityVideoPlaying] = useState(false);
  const [activityVideoTime, setActivityVideoTime] = useState(0);
  const [activityVideoDuration, setActivityVideoDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Check if this is John Smith (API patient)
  const isJohnSmith = patient.id === 9999;
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Video controls
  const toggleActivityVideo = () => {
    if (activityVideoRef.current) {
      if (activityVideoPlaying) {
        activityVideoRef.current.pause();
      } else {
        activityVideoRef.current.play();
      }
      setActivityVideoPlaying(!activityVideoPlaying);
    }
  };
  
  const handleActivityVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setActivityVideoTime(newTime);
    if (activityVideoRef.current) {
      activityVideoRef.current.currentTime = newTime;
    }
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.currentTime = newTime;
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Entering fullscreen - sync time from inline video
      setIsFullscreen(true);
      setTimeout(() => {
        if (fullscreenVideoRef.current && activityVideoRef.current) {
          fullscreenVideoRef.current.currentTime = activityVideoRef.current.currentTime;
          if (activityVideoPlaying) {
            fullscreenVideoRef.current.play();
          }
        }
      }, 50);
    } else {
      // Exiting fullscreen - sync time back to inline video
      if (activityVideoRef.current && fullscreenVideoRef.current) {
        activityVideoRef.current.currentTime = fullscreenVideoRef.current.currentTime;
        if (activityVideoPlaying) {
          activityVideoRef.current.play();
        }
      }
      setIsFullscreen(false);
    }
  };
  
  // Toggle video play for fullscreen
  const toggleFullscreenVideo = () => {
    if (fullscreenVideoRef.current) {
      if (activityVideoPlaying) {
        fullscreenVideoRef.current.pause();
        if (activityVideoRef.current) activityVideoRef.current.pause();
      } else {
        fullscreenVideoRef.current.play();
        if (activityVideoRef.current) activityVideoRef.current.play();
      }
      setActivityVideoPlaying(!activityVideoPlaying);
    }
  };
  
  // Handle fullscreen video seek
  const handleFullscreenVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setActivityVideoTime(newTime);
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.currentTime = newTime;
    }
    if (activityVideoRef.current) {
      activityVideoRef.current.currentTime = newTime;
    }
  };
  
  // Video time update effect
  useEffect(() => {
    if (activeDetailTab !== 'activity') return;
    
    const video = activityVideoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => setActivityVideoTime(video.currentTime);
    const handleLoadedMetadata = () => setActivityVideoDuration(video.duration || 0);
    const handleEnded = () => setActivityVideoPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeDetailTab]);
  
  // Fullscreen video time update effect
  useEffect(() => {
    if (!isFullscreen) return;
    
    const video = fullscreenVideoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => setActivityVideoTime(video.currentTime);
    const handleLoadedMetadata = () => setActivityVideoDuration(video.duration || 0);
    const handleEnded = () => setActivityVideoPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isFullscreen]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={closeDetail}></div>
      <aside className="relative w-full max-w-2xl bg-white shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{patient.name || patient.sourceId}</h2>
              {patient.escalated && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-medium rounded">Escalated</span>}
            </div>
            {patient.dob && <p className="text-sm text-gray-500">DOB: {patient.dob}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDetailViewMode('full')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
            </button>
            <button onClick={closeDetail} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200 flex gap-1">
          {(isJohnSmith ? ['summary', 'detailed', 'activity'] : ['summary', 'detailed']).map(tab => (
            <button key={tab} onClick={() => setActiveDetailTab(tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize ${activeDetailTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {/* Summary Tab */}
          {activeDetailTab === 'summary' && (
            <div className="p-6 space-y-5">
              {/* Status Banner - contextual */}
              {patient.stage === 'dropped' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Dropped: {patient.droppedReason || 'Unknown reason'}</p>
                      <p className="text-xs text-red-600 mt-1">{patient.time}</p>
                    </div>
                  </div>
                </div>
              ) : patient.escalated ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">{patient.escalationReason || 'Needs attention'}</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleEscalatedCTA(patient)} className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">{getAssignedCTA(patient)}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : patient.stage === 'completed' ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm font-medium text-gray-700">Intake complete</span>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">Open in EHR</button>
                  </div>
                </div>
              ) : patient.stage === 'verification' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Appointment booked</p>
                        <p className="text-xs text-emerald-600">{patient.appointmentDate} at {patient.appointmentTime}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">Open in EHR</button>
                  </div>
                </div>
              ) : assignedPatients[patient.id] ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <span className="text-sm font-medium text-blue-800">Assigned to {assignedPatients[patient.id]}</span>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">{getAssignedCTA(patient)}</button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">AI processing</span>
                    <span className="text-xs text-gray-400 ml-auto">No action needed</span>
                  </div>
                </div>
              )}

              {/* Patient Info */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Patient</p></div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500 w-28">Name</td><td className="px-4 py-2.5 text-gray-900">{patient.name || '—'}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">DOB</td><td className="px-4 py-2.5 text-gray-900">{patient.dob || '—'}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Phone</td><td className="px-4 py-2.5 text-gray-900">{patient.phone || '—'}</td></tr>
                    {patient.reason && <tr><td className="px-4 py-2.5 text-gray-500">Reason</td><td className="px-4 py-2.5 text-gray-900">{patient.reason}</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Insurance */}
              {patient.insurance && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Insurance</p></div>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500 w-28">Payer</td><td className="px-4 py-2.5 text-gray-900">{patient.insurance}</td></tr>
                      {patient.memberId && <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Member ID</td><td className="px-4 py-2.5 text-gray-900">{patient.memberId}</td></tr>}
                      {patient.benefitsVerified && <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Network</td><td className="px-4 py-2.5 text-gray-900">In-Network</td></tr>}
                      {patient.copay && <tr><td className="px-4 py-2.5 text-gray-500">Copay</td><td className="px-4 py-2.5 text-gray-900">{patient.copay}</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Appointment */}
              {(patient.provider || patient.providerMatch) && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 uppercase">Appointment</p></div>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500 w-28">Provider</td><td className="px-4 py-2.5 text-gray-900">{patient.provider || patient.providerMatch}</td></tr>
                      {patient.appointmentDate && <tr><td className="px-4 py-2.5 text-gray-500">Date</td><td className="px-4 py-2.5 text-gray-900">{patient.appointmentDate} at {patient.appointmentTime}</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Secondary actions */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button onClick={() => setDetailViewMode('full')} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-lg">Open full view →</button>
                {!patient.escalated && !['completed', 'verification', 'dropped'].includes(patient.stage) && (
                  assignedPatients[patient.id] ? (
                    <button onClick={() => setShowHandBackModal(true)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 hover:bg-gray-50 rounded-lg">Hand back to AI</button>
                  ) : (
                    <button onClick={() => setShowTakeOverModal(true)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 hover:bg-gray-50 rounded-lg">Take over</button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Detailed Tab */}
          {activeDetailTab === 'detailed' && (
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { id: 1, name: 'Data Extraction', status: patient.stageOrder >= 1 ? 'complete' : 'pending', time: '9:42 AM', duration: '< 1 min', activities: [{ action: 'Document received via ' + patient.source, time: '9:42:01 AM', status: 'complete' }, { action: 'Document type identified: Patient Referral', time: '9:42:03 AM', status: 'complete' }, { action: 'Patient demographics extracted', time: '9:43:01 AM', status: 'complete' }] },
                  { id: 2, name: 'Patient Outreach', status: patient.stageOrder >= 2 ? 'complete' : 'pending', time: '9:45 AM', duration: '33 min', activities: [{ action: 'Added to outreach queue', time: '9:45:00 AM', status: 'complete' }, { action: 'Outbound call initiated', time: '10:15:00 AM', status: 'complete' }] },
                  { id: 3, name: 'Intake & Scheduling', status: patient.stageOrder >= 3 ? 'complete' : 'pending', time: '10:15 AM', duration: '3 min', activities: [{ action: 'DOB verified via conversation', time: '10:15:32 AM', status: 'complete' }, { action: 'Appointment booked', time: '10:19:00 AM', status: 'complete' }] },
                  { id: 4, name: 'Benefits Verification', status: patient.stageOrder >= 4 ? 'complete' : 'pending', time: '10:19 AM', duration: '15 sec', activities: [{ action: 'EDI 270 request sent', time: '10:19:05 AM', status: 'complete' }, { action: 'Coverage confirmed', time: '10:19:15 AM', status: 'complete' }] },
                ].map(step => (
                  <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.status === 'complete' ? 'bg-gray-200' : 'bg-gray-100'}`}>
                          {step.status === 'complete' && <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div><p className="text-sm font-medium text-gray-900">{step.name}</p><p className="text-xs text-gray-400">{step.time} • {step.duration}</p></div>
                      </div>
                    </div>
                    {step.status === 'complete' && (
                      <div className="px-4 py-3 border-t border-gray-100">
                        <div className="ml-3 pl-6 border-l border-gray-200 space-y-2">
                          {step.activities.map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 -ml-[19px] ${a.status === 'warning' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                              <div><p className={`text-xs ${a.status === 'warning' ? 'text-amber-600' : 'text-gray-600'}`}>{a.action}</p><p className="text-[10px] text-gray-400">{a.time}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full text-left text-sm text-gray-500 hover:text-gray-700 flex items-center justify-between py-2">
                  <span>View source documents</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* Activity Tab - Only for John Smith */}
          {activeDetailTab === 'activity' && isJohnSmith && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Browser Agent Activity</p>
                    <p className="text-xs text-gray-400">AdvancedMD EHR Session</p>
                  </div>
                </div>
              </div>
              
              {/* Video Player */}
              <div className="flex-1 bg-gray-900 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 flex items-center justify-center relative">
                  <video 
                    ref={activityVideoRef}
                    src="/advancedMD.mp4"
                    className="w-full h-full object-contain"
                    onClick={toggleActivityVideo}
                    onPlay={() => setActivityVideoPlaying(true)}
                    onPause={() => setActivityVideoPlaying(false)}
                    preload="auto"
                  />
                  {/* Play button overlay when paused */}
                  {!activityVideoPlaying && (
                    <button 
                      onClick={toggleActivityVideo}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    >
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
                
                {/* Video controls */}
                <div className="flex-shrink-0 bg-black/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={toggleActivityVideo}
                      className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                    >
                      {activityVideoPlaying ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <span className="text-xs text-white font-mono w-20">
                      {formatTime(activityVideoTime)} / {formatTime(activityVideoDuration)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={activityVideoDuration || 100}
                      step="0.1"
                      value={activityVideoTime}
                      onInput={handleActivityVideoSeek}
                      onChange={handleActivityVideoSeek}
                      className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-md
                        [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                      style={{
                        background: `linear-gradient(to right, #fff 0%, #fff ${(activityVideoTime / (activityVideoDuration || 1)) * 100}%, rgba(255,255,255,0.3) ${(activityVideoTime / (activityVideoDuration || 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    />
                    {/* Fullscreen button */}
                    <button 
                      onClick={toggleFullscreen}
                      className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 ml-2"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  AI agent navigating AdvancedMD to create patient record and schedule appointment...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Take Over Modal */}
        {showTakeOverModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowTakeOverModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-80">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Take over this intake?</h3>
              <p className="text-sm text-gray-500 mb-5">AI processing will pause and this will be assigned to you.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowTakeOverModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={() => { handleTakeOver(patient.id); setShowTakeOverModal(false); }} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg">Take over</button>
              </div>
            </div>
          </div>
        )}

        {/* Hand Back Modal */}
        {showHandBackModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowHandBackModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-80">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Hand back to AI?</h3>
              <p className="text-sm text-gray-500 mb-5">AI will resume processing from where you left off.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowHandBackModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={() => { handleHandBack(patient.id); setShowHandBackModal(false); }} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg">Hand back</button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Video Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 z-[70] bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Browser Agent Activity</p>
                  <p className="text-xs text-gray-400">AdvancedMD EHR Session</p>
                </div>
              </div>
              <button 
                onClick={toggleFullscreen}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Video */}
            <div className="flex-1 flex items-center justify-center relative">
              <video 
                ref={fullscreenVideoRef}
                src="/advancedMD.mp4"
                className="max-w-full max-h-full object-contain"
                onClick={toggleFullscreenVideo}
                onPlay={() => setActivityVideoPlaying(true)}
                onPause={() => setActivityVideoPlaying(false)}
                preload="auto"
              />
              {/* Play button overlay when paused */}
              {!activityVideoPlaying && (
                <button 
                  onClick={toggleFullscreenVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
            
            {/* Controls */}
            <div className="bg-black/80 px-6 py-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleFullscreenVideo}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  {activityVideoPlaying ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-white font-mono w-24">
                  {formatTime(activityVideoTime)} / {formatTime(activityVideoDuration)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={activityVideoDuration || 100}
                  step="0.1"
                  value={activityVideoTime}
                  onInput={handleFullscreenVideoSeek}
                  onChange={handleFullscreenVideoSeek}
                  className="flex-1 h-2 bg-white/30 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                    [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-md
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                  style={{
                    background: `linear-gradient(to right, #fff 0%, #fff ${(activityVideoTime / (activityVideoDuration || 1)) * 100}%, rgba(255,255,255,0.3) ${(activityVideoTime / (activityVideoDuration || 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
                <button 
                  onClick={toggleFullscreen}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                  title="Exit fullscreen"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default SidePanel;

