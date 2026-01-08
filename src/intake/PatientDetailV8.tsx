import React, { useState, useRef, useEffect } from 'react';
import { getTimestampToday, getRelativeDateWithDay, getDateTimeString, getPastDateWithTime, getFaxDateFormat, getEdiShortDate, getEdiLongDate, getNextMonday, getNextMondayShort, getAvailabilityFromTime, getAvailabilitySlotDescription } from './utils/dateHelpers';

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
  createdAt?: number; // Timestamp when patient was created
}

// Helper to format timestamp based on patient creation time (for John Smith dynamic timestamps)
const formatDynamicTimestamp = (createdAt: number | undefined, offsetMinutes: number = 0): string => {
  if (!createdAt) return getTimestampToday(0, 0);
  const date = new Date(createdAt + offsetMinutes * 60 * 1000);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${month} ${day}, ${time}`;
};

const formatDynamicTime = (createdAt: number | undefined, offsetMinutes: number = 0): string => {
  if (!createdAt) return '0:00';
  const date = new Date(createdAt + offsetMinutes * 60 * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

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
  const [audioDuration, setAudioDuration] = useState(272); // 4:32 default
  const [reviewingField, setReviewingField] = useState<{ field: string; value: string; confidence: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1, 4]);
  const [expandedFunnelStage, setExpandedFunnelStage] = useState<number | null>(null);
  const [bvSourceType, setBvSourceType] = useState('edi');
  
  // Media player refs and state
  const intakeAudioRef = useRef<HTMLAudioElement>(null);
  const bvVideoRef = useRef<HTMLVideoElement>(null);
  const bvAudioRef = useRef<HTMLAudioElement>(null);
  const [bvVideoPlaying, setBvVideoPlaying] = useState(false);
  const [bvVideoTime, setBvVideoTime] = useState(0);
  const [bvVideoDuration, setBvVideoDuration] = useState(45); // 45 sec default
  const [bvAudioPlaying, setBvAudioPlaying] = useState(false);
  const [bvAudioTime, setBvAudioTime] = useState(0);
  const [bvAudioDuration, setBvAudioDuration] = useState(512); // 8:32 default
  
  // Activity video state (for John Smith)
  const activityVideoRef = useRef<HTMLVideoElement>(null);
  const [activityVideoPlaying, setActivityVideoPlaying] = useState(false);
  const [activityVideoTime, setActivityVideoTime] = useState(0);
  const [activityVideoDuration, setActivityVideoDuration] = useState(0);
  
  // Check if this is John Smith
  const isJohnSmith = patient.id === 9999;

  // Handle intake audio play/pause
  const toggleIntakeAudio = () => {
    if (intakeAudioRef.current) {
      if (isPlaying) {
        intakeAudioRef.current.pause();
      } else {
        intakeAudioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle BV video play/pause
  const toggleBvVideo = () => {
    if (bvVideoRef.current) {
      if (bvVideoPlaying) {
        bvVideoRef.current.pause();
      } else {
        bvVideoRef.current.play();
      }
      setBvVideoPlaying(!bvVideoPlaying);
    }
  };

  // Handle BV audio play/pause
  const toggleBvAudio = () => {
    if (bvAudioRef.current) {
      if (bvAudioPlaying) {
        bvAudioRef.current.pause();
      } else {
        bvAudioRef.current.play();
      }
      setBvAudioPlaying(!bvAudioPlaying);
    }
  };
  
  // Handle activity video play/pause
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
  
  // Seek handler for activity video
  const handleActivityVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setActivityVideoTime(newTime);
    if (activityVideoRef.current) {
      activityVideoRef.current.currentTime = newTime;
    }
  };

  // Seek handler for intake audio
  const handleIntakeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime); // Update UI immediately for responsiveness
    if (intakeAudioRef.current) {
      intakeAudioRef.current.currentTime = newTime;
    }
  };

  // Seek handler for BV audio
  const handleBvAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setBvAudioTime(newTime); // Update UI immediately for responsiveness
    if (bvAudioRef.current) {
      bvAudioRef.current.currentTime = newTime;
    }
  };

  // Seek handler for BV video
  const handleBvVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setBvVideoTime(newTime); // Update UI immediately for responsiveness
    if (bvVideoRef.current) {
      bvVideoRef.current.currentTime = newTime;
    }
  };

  // Update audio time for intake call
  useEffect(() => {
    const audio = intakeAudioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration || 272);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update audio time for BV call
  // Re-run effect when bvSourceType changes (audio element only exists when call tab is active)
  useEffect(() => {
    if (bvSourceType !== 'call') return;
    
    const audio = bvAudioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => setBvAudioTime(audio.currentTime);
    const handleLoadedMetadata = () => setBvAudioDuration(audio.duration || 512);
    const handleEnded = () => setBvAudioPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [bvSourceType]);

  // Update video time for BV portal session
  // Re-run effect when bvSourceType changes (video element only exists when portal tab is active)
  useEffect(() => {
    if (bvSourceType !== 'portal') return;
    
    const video = bvVideoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => setBvVideoTime(video.currentTime);
    const handleLoadedMetadata = () => setBvVideoDuration(video.duration || 45);
    const handleEnded = () => setBvVideoPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [bvSourceType]);
  
  // Update video time for Activity tab (John Smith only)
  useEffect(() => {
    if (activeTab !== 'activity' || !isJohnSmith) return;
    
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
  }, [activeTab, isJohnSmith]);

  const patientData = {
    name: patient?.name || 'Sarah Chen',
    dob: patient?.dob || '03/15/1988',
    phone: patient?.phone || '(555) 123-4567',
    currentStage: patient?.stageOrder || 4,
    isEscalated: patient?.escalated || false,
  };

  const stages = [
    { id: 'extraction', name: 'Data Extraction', order: 0 },
    { id: 'outreach', name: 'Patient Contact', order: 1 },
    { id: 'intake', name: 'Intake & Scheduling', order: 2 },
    { id: 'verification', name: 'Benefits Verification', order: 3 },
    { id: 'completed', name: 'Booked/ Completed', order: 4 },
  ];

  // Different agent steps for John Smith (phone call intake) vs other patients (fax referral)
  // Note: isJohnSmith is already declared above
  
  // Helper to get dynamic time for John Smith workflow steps
  const getJohnSmithTime = (offsetMinutes: number) => patient?.createdAt ? formatDynamicTime(patient.createdAt, offsetMinutes) : '9:30 AM';
  const getJohnSmithActivityTime = (offsetSeconds: number) => {
    if (!patient?.createdAt) return '9:30:00 AM';
    const date = new Date(patient.createdAt + offsetSeconds * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  };
  
  const agentSteps = isJohnSmith ? [
    { id: 1, name: 'Data Extraction', status: 'complete', time: getJohnSmithTime(0), duration: 'N/A', activities: [{ action: 'Inbound call received', time: getJohnSmithActivityTime(0), status: 'complete' }, { action: 'No document extraction needed (phone intake)', time: getJohnSmithActivityTime(1), status: 'complete' }] },
    { id: 2, name: 'Patient Outreach', status: 'complete', time: getJohnSmithTime(0), duration: '4 min', activities: [{ action: 'Inbound call answered', time: getJohnSmithActivityTime(0), status: 'complete' }, { action: 'Patient identity verified', time: getJohnSmithActivityTime(15), status: 'complete' }, { action: 'Patient intake completed via call', time: getJohnSmithActivityTime(240), status: 'complete' }] },
    { id: 3, name: 'Intake & Scheduling', status: 'complete', time: getJohnSmithTime(4), duration: '2 min', activities: [{ action: 'DOB verified via conversation', time: getJohnSmithActivityTime(250), status: 'complete' }, { action: 'Insurance confirmed: CareFirst', time: getJohnSmithActivityTime(270), status: 'complete' }, { action: 'Appointment booked for ' + getNextMondayShort() + ' at 9:30 AM', time: getJohnSmithActivityTime(360), status: 'complete' }] },
    { id: 4, name: 'Benefits Verification', status: 'complete', time: getJohnSmithTime(6), duration: '15 sec', activities: [{ action: 'EDI 270 request sent to CareFirst', time: getJohnSmithActivityTime(365), status: 'complete' }, { action: 'EDI 271 response received', time: getJohnSmithActivityTime(372), status: 'complete' }, { action: 'Coverage confirmed: Active, $30 copay', time: getJohnSmithActivityTime(375), status: 'complete' }] },
  ] : [
    { id: 1, name: 'Data Extraction', status: 'complete', time: '9:42 AM', duration: '< 1 min', activities: [{ action: 'Fax received from Austin Family Medicine', time: '9:42:01 AM', status: 'complete' }, { action: 'Document type identified: Patient Referral', time: '9:42:03 AM', status: 'complete' }, { action: 'Patient demographics extracted (4 fields)', time: '9:43:01 AM', status: 'complete' }, { action: 'Member ID flagged for review (67% confidence)', time: '9:43:30 AM', status: 'warning' }] },
    { id: 2, name: 'Patient Outreach', status: 'complete', time: '9:45 AM', duration: '33 min', activities: [{ action: 'Patient added to outreach queue', time: '9:45:00 AM', status: 'complete' }, { action: 'Outbound call initiated', time: '10:15:00 AM', status: 'complete' }, { action: 'Call connected with patient', time: '10:15:08 AM', status: 'complete' }] },
    { id: 3, name: 'Intake & Scheduling', status: 'complete', time: '10:15 AM', duration: '3 min', activities: [{ action: 'DOB verified via conversation', time: '10:15:32 AM', status: 'complete' }, { action: 'Insurance confirmed', time: '10:15:42 AM', status: 'complete' }, { action: 'Appointment booked', time: '10:19:00 AM', status: 'complete' }] },
    { id: 4, name: 'Benefits Verification', status: 'complete', time: '10:19 AM', duration: '15 sec', activities: [{ action: 'EDI 270 request sent to Aetna', time: '10:19:05 AM', status: 'complete' }, { action: 'EDI 271 response received', time: '10:19:12 AM', status: 'complete' }, { action: 'Coverage confirmed: Active, $30 copay', time: '10:19:15 AM', status: 'complete' }] },
  ];

  const referralFields = isJohnSmith ? [
    { section: 'Patient', field: 'Name', value: 'John Smith', confidence: 100, status: 'ok' },
    { section: 'Patient', field: 'DOB', value: 'May 22, 1985', confidence: 100, status: 'ok' },
    { section: 'Patient', field: 'Phone', value: '(410) 555-8923', confidence: 100, status: 'ok' },
    { section: 'Insurance', field: 'Payer', value: 'CareFirst', confidence: 100, status: 'ok' },
    { section: 'Insurance', field: 'Member ID', value: '2452467', confidence: 100, status: 'ok' },
    { section: 'Service', field: 'Reason', value: 'Anxiety from work stress', confidence: 100, status: 'ok' },
  ] : [
    { section: 'Patient', field: 'Name', value: patientData.name, confidence: 98, status: 'ok' },
    { section: 'Patient', field: 'DOB', value: patientData.dob, confidence: 99, status: 'ok' },
    { section: 'Patient', field: 'Phone', value: patientData.phone, confidence: 95, status: 'ok' },
    { section: 'Insurance', field: 'Payer', value: patient?.insurance || 'Aetna', confidence: 96, status: 'ok' },
    { section: 'Insurance', field: 'Member ID', value: patient?.memberId || 'W123456789', confidence: 67, status: 'review' },
    { section: 'Service', field: 'Reason', value: patient?.reason || 'Anxiety, Depression', confidence: 94, status: 'ok' },
  ];

  const outreachFields = isJohnSmith ? [
    { field: 'DOB Verified', value: patientData.dob, source: '0:15', timestamp: 15, status: 'verified' },
    { field: 'Insurance Verified', value: 'CareFirst', source: '0:30', timestamp: 30, status: 'verified' },
    { field: 'Chief Complaint', value: 'Anxiety from work stress', source: '0:48', timestamp: 48, status: 'extracted' },
    { field: 'Availability', value: getAvailabilityFromTime(patient?.appointmentTime), source: '1:15', timestamp: 75, status: 'extracted' },
    { field: 'Modality', value: 'In-person preferred', source: '1:28', timestamp: 88, status: 'extracted' },
  ] : [
    { field: 'DOB Verified', value: patientData.dob, source: '0:32', timestamp: 32, status: 'verified' },
    { field: 'Insurance Verified', value: patient?.insurance || 'Aetna', source: '0:42', timestamp: 42, status: 'verified' },
    { field: 'Chief Complaint', value: patient?.reason || 'Anxiety, stress affecting sleep and work', source: '1:02', timestamp: 62, status: 'extracted' },
    { field: 'Availability', value: getAvailabilityFromTime(patient?.appointmentTime), source: '1:38', timestamp: 98, status: 'extracted' },
    { field: 'Modality', value: 'Open to telehealth or in-person', source: '1:52', timestamp: 112, status: 'extracted' },
  ];

  const transcriptLines = isJohnSmith ? [
    { time: '0:00', timestamp: 0, speaker: 'AI', text: 'Thank you for calling Mindful Recovery Center. My name is Ava, how can I help you today?' },
    { time: '0:06', timestamp: 6, speaker: 'Patient', text: 'Hi, I\'d like to schedule an appointment. I\'ve been dealing with some anxiety lately.' },
    { time: '0:12', timestamp: 12, speaker: 'AI', text: 'I\'m sorry to hear that, but I\'m glad you reached out. I\'d be happy to help you get scheduled. May I have your name please?' },
    { time: '0:18', timestamp: 18, speaker: 'Patient', text: 'John Smith.' },
    { time: '0:20', timestamp: 20, speaker: 'AI', text: 'Thank you, John. For verification purposes, can you please confirm your date of birth?' },
    { time: '0:25', timestamp: 25, speaker: 'Patient', text: 'May 22nd, 1985.', highlight: 'DOB Verified', extracted: true },
    { time: '0:28', timestamp: 28, speaker: 'AI', text: 'Perfect, thank you. And what insurance do you have?' },
    { time: '0:32', timestamp: 32, speaker: 'Patient', text: 'CareFirst, through my employer.', highlight: 'Insurance Verified', extracted: true },
    { time: '0:36', timestamp: 36, speaker: 'AI', text: 'Great, we\'re in-network with CareFirst. Can you tell me a little more about what you\'re experiencing?' },
    { time: '0:44', timestamp: 44, speaker: 'Patient', text: 'I\'ve been having a lot of anxiety from work stress. It\'s affecting my sleep and concentration.', highlight: 'Chief Complaint', extracted: true },
    { time: '0:56', timestamp: 56, speaker: 'AI', text: 'I understand. That sounds really challenging. We have therapists who specialize in work-related anxiety. What times work best for you?' },
    { time: '1:08', timestamp: 68, speaker: 'Patient', text: 'Mornings are best for me, ideally before 10am.', highlight: 'Availability', extracted: true },
    { time: '1:15', timestamp: 75, speaker: 'AI', text: 'Mornings before 10am, got it. Do you prefer in-person or telehealth?' },
    { time: '1:22', timestamp: 82, speaker: 'Patient', text: 'In-person would be better for me.', highlight: 'Modality Preference', extracted: true },
    { time: '1:28', timestamp: 88, speaker: 'AI', text: `Let me check our availability. I have Dr. Amanda Puckett available ${getNextMonday('9:30 AM')} for an in-person session. She specializes in anxiety and stress management. Would that work?` },
    { time: '1:48', timestamp: 108, speaker: 'Patient', text: 'Monday at 9:30 works great!' },
    { time: '1:52', timestamp: 112, speaker: 'AI', text: `Excellent! I've got you booked with Dr. Amanda Puckett for ${getNextMonday('9:30 AM')}. You'll receive a confirmation text with the address and some intake forms.` },
    { time: '2:08', timestamp: 128, speaker: 'Patient', text: 'Thank you so much for your help.' },
    { time: '2:12', timestamp: 132, speaker: 'AI', text: 'You\'re welcome, John. We look forward to seeing you Monday. Take care!' },
    { time: '2:18', timestamp: 138, speaker: 'Patient', text: 'Thanks, goodbye!' },
  ] : [
    { time: '0:00', timestamp: 0, speaker: 'AI', text: 'Hi, this is calling from Mindful Recovery Center. Am I speaking with ' + patientData.name + '?' },
    { time: '0:08', timestamp: 8, speaker: 'Patient', text: 'Yes, this is ' + (patientData.name?.split(' ')[0] || 'me') + '.' },
    { time: '0:12', timestamp: 12, speaker: 'AI', text: 'Great! I\'m reaching out because we received a referral from your doctor. We\'d love to help get you scheduled for an initial consultation. Do you have a few minutes to go over some information?' },
    { time: '0:24', timestamp: 24, speaker: 'Patient', text: 'Sure, that works for me.' },
    { time: '0:27', timestamp: 27, speaker: 'AI', text: 'Perfect. For verification purposes, can you please confirm your date of birth?' },
    { time: '0:32', timestamp: 32, speaker: 'Patient', text: patientData.dob?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3') || '', highlight: 'DOB Verified', extracted: true },
    { time: '0:35', timestamp: 35, speaker: 'AI', text: 'Thank you for confirming. And can you tell me what insurance you have?' },
    { time: '0:42', timestamp: 42, speaker: 'Patient', text: 'Yes, I have ' + (patient?.insurance || 'Aetna') + ' through my employer.', highlight: 'Insurance Verified', extracted: true },
    { time: '0:48', timestamp: 48, speaker: 'AI', text: 'Great, we\'re in-network with ' + (patient?.insurance || 'Aetna') + '. I\'ll verify your specific benefits and coverage shortly. Now, I\'d like to understand what brings you in today. Can you tell me a little about what you\'re experiencing?' },
    { time: '1:02', timestamp: 62, speaker: 'Patient', text: 'I\'ve been dealing with some ' + (patient?.reason || 'anxiety and stress') + ' lately. It\'s been affecting my sleep and work performance. My doctor thought it would be good to talk to someone.', highlight: 'Chief Complaint', extracted: true },
    { time: '1:18', timestamp: 78, speaker: 'AI', text: 'I understand, and I\'m sorry to hear you\'ve been going through that. You\'ve taken an important step by reaching out. We have several experienced therapists who specialize in exactly these areas. What times generally work best for you for appointments?' },
    { time: '1:38', timestamp: 98, speaker: 'Patient', text: 'Afternoons work best for me. I usually finish work around 3pm.', highlight: 'Availability', extracted: true },
    { time: '1:45', timestamp: 105, speaker: 'AI', text: 'Afternoons after 3pm, got it. Do you have a preference for in-person sessions or telehealth video visits?' },
    { time: '1:52', timestamp: 112, speaker: 'Patient', text: 'I\'m open to either, honestly. Whatever is easier to get started.', highlight: 'Modality Preference', extracted: true },
    { time: '1:58', timestamp: 118, speaker: 'AI', text: `That flexibility helps! Let me check our availability. I have ${patient?.provider || 'Dr. Emily Watson'} available this Tuesday at 3:30 PM for a telehealth session. ${patient?.provider === 'Dr. Amanda Puckett' ? 'She' : 'They'} has great experience with anxiety and has wonderful patient reviews. Would that work for you?` },
    { time: '2:15', timestamp: 135, speaker: 'Patient', text: 'Tuesday at 3:30 sounds perfect actually.' },
    { time: '2:19', timestamp: 139, speaker: 'AI', text: `Excellent! I've got you booked with ${patient?.provider?.split(' ').pop() ? 'Dr. ' + patient.provider.split(' ').pop() : 'Dr. Watson'} for ${getDateTimeString(2, '3:30 PM')} via telehealth. You'll receive a confirmation email shortly with the video link and some intake forms to complete before your appointment.` },
    { time: '2:35', timestamp: 155, speaker: 'Patient', text: 'Great, thank you so much for helping me get this set up.' },
    { time: '2:40', timestamp: 160, speaker: 'AI', text: 'You\'re very welcome! Is there anything else I can help you with today?' },
    { time: '2:45', timestamp: 165, speaker: 'Patient', text: 'No, I think that covers everything.' },
    { time: '2:48', timestamp: 168, speaker: 'AI', text: 'Perfect. We look forward to seeing you on Tuesday. Take care and have a great rest of your day!' },
    { time: '2:53', timestamp: 173, speaker: 'Patient', text: 'Thanks, you too. Goodbye!' },
  ];

  const matchingFunnel = isJohnSmith ? [
    { stage: 'Payer Accepted', count: 2, description: 'Accept CareFirst', providers: ['Dr. Amanda Puckett', 'Dr. Naomi Lee'] },
    { stage: 'Clinical Match', count: 2, description: 'Specialize in Anxiety', providers: ['Dr. Amanda Puckett', 'Dr. Naomi Lee'] },
    { stage: 'Availability', count: 1, description: getAvailabilitySlotDescription(patient?.appointmentTime, patient?.appointmentDate), providers: ['Dr. Amanda Puckett'] },
    { stage: 'Selected', count: 1, description: 'Best match', providers: ['Dr. Amanda Puckett'] },
  ] : [
    { stage: 'Payer Accepted', count: 13, description: 'Accept ' + (patient?.insurance || 'Aetna'), providers: ['Dr. Emily Watson', 'Dr. James Liu', 'Sarah Martinez, LCSW'] },
    { stage: 'Clinical Match', count: 8, description: 'Specialize in ' + (patient?.reason || 'Anxiety'), providers: ['Dr. Emily Watson', 'Dr. James Liu'] },
    { stage: 'Availability', count: 3, description: getAvailabilitySlotDescription(patient?.appointmentTime, patient?.appointmentDate), providers: ['Dr. Emily Watson'] },
    { stage: 'Selected', count: 1, description: 'Best match', providers: ['Dr. Emily Watson'] },
  ];

  const bvResults = { status: 'Active', payer: patient?.insurance || 'Aetna', memberId: patient?.memberId || 'W123456789', networkStatus: 'In-Network', copay: patient?.copay || '$30', coinsurance: isJohnSmith ? '0%' : '20%', deductible: '$500', oopMax: '$3,000', visitLimit: 'Unlimited', priorAuth: 'Not required' };

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
            {/* Activity tab for John Smith only */}
            {isJohnSmith && (
              <>
                <svg className="w-4 h-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${activeTab === 'activity' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  Activity
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`w-full transition-all ${showAgentPanel ? 'mr-80' : ''}`}>
        {/* DATA EXTRACTION TAB */}
        {activeTab === 'extraction' && (
          <div className="flex w-full h-[calc(100vh-140px)]">
            <div className="flex-[6] border-r border-gray-100 overflow-auto bg-gray-100 p-6">
              {isJohnSmith ? (
                /* Phone call intake - no document to extract */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Phone Intake</h3>
                  <p className="text-sm text-gray-500 max-w-md">This patient was added via inbound phone call. No document extraction was required - all information was collected during the conversation.</p>
                  <div className="mt-6 px-4 py-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span>Patient contact completed</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fax referral - show document */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><SourceBadge type={patient?.source || 'fax'} /><span className="text-sm text-gray-500">from Austin Family Medicine</span><span className="text-sm text-gray-400">• {getTimestampToday(2, 18)}</span></div>
                  </div>
                  <div className="bg-white shadow-lg rounded-sm overflow-hidden" style={{ fontFamily: 'Courier, monospace' }}>
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 text-xs text-gray-500">
                      <div className="flex justify-between"><span>FAX TRANSMISSION</span><span>{getFaxDateFormat(2)}</span></div>
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
                      <div className="pt-4 border-t border-gray-300"><p className="italic">Electronically signed by Dr. Michael Roberts, MD</p><p className="text-xs text-gray-500">Date: {getFaxDateFormat(2).split(' ')[0]}</p></div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-[4] overflow-auto p-6">
              <div className="flex items-center justify-between mb-5"><div><span className="text-sm font-medium text-gray-900">{isJohnSmith ? 'Patient Information' : 'Extracted Data'}</span><span className="text-xs text-gray-400 ml-2">6 fields</span></div>
                {!reviewingField && !isJohnSmith && <div className="flex items-center gap-2"><span className="w-2 h-2 bg-gray-400 rounded-full"></span><span className="text-xs text-gray-600">1 needs review</span></div>}
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
            {/* Hidden audio element */}
            <audio ref={intakeAudioRef} src="/intake_call.wav" preload="metadata" />
            
            <div className="flex-[6] border-r border-gray-100 overflow-auto bg-gray-50 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><SourceBadge type="call" /><span className="text-sm text-gray-500">{isJohnSmith && patient?.createdAt ? formatDynamicTimestamp(patient.createdAt, 0) : getTimestampToday(1, 45)}</span><span className="text-sm text-gray-400">• {formatTime(audioDuration)}</span></div>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Connected</span>
              </div>
              <div className="mb-4 px-3 py-2 bg-emerald-50 rounded-lg inline-flex items-center gap-2 text-sm text-emerald-700 self-start"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Contacted within 33 min • SLA met</div>
              
              {/* Call Transcript Preview Card */}
              {patient?.handledBy === 'AI' && (
                <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="9" cy="10" r="2" fill="currentColor"/>
                        <circle cx="15" cy="10" r="2" fill="currentColor"/>
                        <path d="M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Supa AI intake call</p>
                      <p className="text-xs text-gray-500">Duration: {formatTime(audioDuration)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Call Transcript</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-blue-600">Patient:</span> "...yes, I've been feeling {patient?.reason?.toLowerCase().includes('anxiety') ? 'anxious' : patient?.reason?.toLowerCase().includes('depression') ? 'down' : 'unwell'} for about {isJohnSmith ? '3 weeks' : 'a few weeks'} now..."
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">Supa:</span> "I understand. Let me get you scheduled with one of our therapists who specializes in {patient?.reason?.toLowerCase().split(',')[0] || 'this area'}..."
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
                {!showTranscript ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <button onClick={toggleIntakeAudio} className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 mb-4 transition-transform hover:scale-105">
                      {isPlaying ? (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                      ) : (
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      )}
                    </button>
                    <p className="text-sm text-gray-500">{isPlaying ? 'Playing...' : 'Click to play recording'}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(currentTime)} / {formatTime(audioDuration)}</p>
                    {/* Draggable Progress bar */}
                    <div className="w-64 mt-4 relative">
                      <input
                        type="range"
                        min="0"
                        max={audioDuration || 272}
                        step="0.5"
                        value={currentTime}
                        onInput={handleIntakeSeek}
                        onChange={handleIntakeSeek}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900 
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                          [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-md
                          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gray-900 
                          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                        style={{
                          background: `linear-gradient(to right, #111827 0%, #111827 ${(currentTime / (audioDuration || 272)) * 100}%, #e5e7eb ${(currentTime / (audioDuration || 272)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                    <button onClick={() => setShowTranscript(true)} className="mt-6 text-sm text-gray-600 hover:text-gray-700 font-medium">View Transcript</button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={toggleIntakeAudio} className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800">
                          {isPlaying ? (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                          ) : (
                            <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-mono">{formatTime(currentTime)} / {formatTime(audioDuration)}</span>
                          {/* Mini draggable progress bar */}
                          <input
                            type="range"
                            min="0"
                            max={audioDuration || 272}
                            step="0.5"
                            value={currentTime}
                            onInput={handleIntakeSeek}
                            onChange={handleIntakeSeek}
                            className="w-32 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                              [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-gray-900 
                              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                            style={{
                              background: `linear-gradient(to right, #111827 0%, #111827 ${(currentTime / (audioDuration || 272)) * 100}%, #e5e7eb ${(currentTime / (audioDuration || 272)) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                      </div>
                      <button onClick={() => setShowTranscript(false)} className="text-xs text-gray-500">Hide Transcript</button>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                      <div className="space-y-3">
                        {transcriptLines.map((line, index) => (
                          <div 
                            key={index} 
                            className={`flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${currentTime >= line.timestamp && currentTime < (transcriptLines[index + 1]?.timestamp || 999) ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`} 
                            onClick={() => {
                              if (intakeAudioRef.current) {
                                intakeAudioRef.current.currentTime = line.timestamp;
                                if (!isPlaying) {
                                  intakeAudioRef.current.play();
                                  setIsPlaying(true);
                                }
                              }
                            }}
                          >
                            <button className="text-xs text-gray-600 font-mono w-10">{line.time}</button>
                            <div className="flex-1"><span className={`text-xs font-medium ${line.speaker === 'Patient' ? 'text-blue-600' : 'text-gray-500'}`}>{line.speaker}</span><p className="text-sm text-gray-700 mt-0.5">{line.text}</p>{line.highlight && <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${line.extracted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{line.highlight}</span>}</div>
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
                <div className="flex items-center gap-3"><SourceBadge type="call" /><span className="text-sm text-gray-500">Intake call • {isJohnSmith && patient?.createdAt ? formatDynamicTimestamp(patient.createdAt, 0) : getTimestampToday(1, 45)}</span></div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Play</button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="px-4 py-3 border-b border-gray-100"><p className="text-sm font-medium text-gray-900">Patient Requirements</p></div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500 w-32">Payer</td><td className="px-4 py-2.5 text-gray-900">{patient?.insurance || 'Aetna'}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Concern</td><td className="px-4 py-2.5 text-gray-900">{patient?.reason || 'Anxiety, Depression'}</td></tr>
                    <tr className="border-b border-gray-50"><td className="px-4 py-2.5 text-gray-500">Availability</td><td className="px-4 py-2.5 text-gray-900">{getAvailabilityFromTime(patient?.appointmentTime)}</td></tr>
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
                          <div className="flex flex-wrap gap-2">{step.providers.map((p, i) => <span key={i} className={`px-2 py-1 text-xs rounded ${p === (patient?.provider || 'Dr. Emily Watson') ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{p}</span>)}</div>
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
                <div className="flex items-start gap-4"><div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xl">📅</div><div><p className="text-base font-medium text-gray-900">{patient?.appointmentDate || getRelativeDateWithDay(2)}</p><p className="text-sm text-gray-600">{patient?.appointmentTime || '3:30 PM — 4:30 PM'}</p><p className="text-sm text-gray-900 mt-2">{patient?.providerMatch || patient?.provider || 'Dr. Emily Watson'}</p><p className="text-xs text-gray-400">Individual Therapy • Telehealth</p></div></div>
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
                  {(isJohnSmith 
                    ? [{ id: 'edi', label: 'EDI Response' }]
                    : [{ id: 'edi', label: 'EDI Response' }, { id: 'portal', label: 'Portal Session' }, { id: 'call', label: 'Payer Call' }, { id: 'manual', label: 'Manual Entry' }]
                  ).map(s => <button key={s.id} onClick={() => setBvSourceType(s.id)} className={`px-3 py-1.5 rounded text-sm ${bvSourceType === s.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{s.label}</button>)}
                </div>
                {bvSourceType === 'edi' && (
                  <div className="flex-1 flex flex-col bg-gray-50">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white"><div className="flex items-center gap-3"><SourceBadge type="edi" /><div><p className="text-sm font-medium text-gray-900">EDI 271 Response</p><p className="text-xs text-gray-400">{patient?.insurance || 'Payer'} • {isJohnSmith && patient?.createdAt ? formatDynamicTimestamp(patient.createdAt, 4) : getTimestampToday(1, 41)} • 15 sec</p></div></div></div>
                    <div className="flex-1 overflow-auto p-6">
                      <div className="bg-white rounded border border-gray-200 font-mono text-xs overflow-auto max-h-[500px]">
                        <div className="p-4 text-gray-600 whitespace-pre leading-relaxed text-[10px]">{`ISA*00*          *00*          *ZZ*STEDI          *01*117151744      *${getEdiShortDate()}*2124*^*00501*844362682*0*P*:~
GS*HB*STEDI*117151744*${getEdiLongDate()}*1525*844362682*X*005010X279A1~
ST*271*844362682*005010X279A1~
BHT*0022*11*01KCQ37DAR0NWXCBWTTVPAGH29*${getEdiLongDate()}*162501~
HL*1**20*1~
NM1*PR*2*${(patient?.insurance || 'PAYER').toUpperCase().replace(/ /g, '')}*****PI*87726~
PER*IC**UR*WWW.${(patient?.insurance || 'PAYER').toUpperCase().replace(/ /g, '')}.COM~
HL*2*1*21*1~
NM1*1P*2*FARNSWORTH HEALTH SERVICES*****XX*1841707668~
HL*3*2*22*1~
NM1*IL*1*${(patientData.name?.split(' ')[1] || 'DOE').toUpperCase()}*${(patientData.name?.split(' ')[0] || 'JOHN').toUpperCase()}****MI*${patient?.memberId || '916206339'}~
REF*6P*936173*PERDUE FARMS, INC~
N3*136 ARENA ROAD~
N4*PERRY*GA*31069~
DMG*D8*19760706*M~
HL*4*3*23*0~
TRN*1*01KCQ37DC7BNCS4HNSV1THNK1X*3117151744~
NM1*03*1*${(patientData.name?.split(' ')[1] || 'DOE').toUpperCase()}*${(patientData.name?.split(' ')[0] || 'JOHN').toUpperCase()}~
REF*18*0087 0087~
DMG*D8*19720309*F~
INS*N*01*001*25~
DTP*291*RD8*${new Date().getFullYear()}0101-${new Date().getFullYear()}1231~
EB*1**30*C1*${(patient?.insurance || 'PAYER').toUpperCase()} CHOICE PLUS~
MSG*PROVIDER IS IN NETWORK FOR MEMBER~
MSG*FUNDING TYPE = SELF INSURED - LARGE GROUP~
LS*2120~
NM1*PR*2*${(patient?.insurance || 'PAYER').toUpperCase().replace(/ /g, '')}*****PI*87726~
N3*P.O. BOX 740800~
N4*ATLANTA*GA*303740800~
PER*IC**UR*WWW.${(patient?.insurance || 'PAYER').toUpperCase().replace(/ /g, '')}.COM~
LE*2120~
EB*C*FAM*30***23*0*****Y~
MSG*HIGHEST BENEFIT~
EB*C*IND*30***23*0*****Y~
MSG*HIGHEST BENEFIT~
EB*G*FAM*30*C1**23*0*****Y~
MSG*HIGHEST BENEFIT~
EB*G*IND*30*C1**23*0*****Y~
MSG*HIGHEST BENEFIT~
EB*C*FAM*30***24*0*****Y~
MSG*HIGHEST BENEFIT~
EB*C*IND*30***24*0*****Y~
MSG*HIGHEST BENEFIT~
EB*C*FAM*30***29*0*****Y~
MSG*HIGHEST BENEFIT~
EB*C*IND*30***29*0*****Y~
MSG*HIGHEST BENEFIT~
EB*1**A4^A5^A6^A7^A8^AI^AJ^AK*********Y~
MSG*HIGHEST BENEFIT~
EB*1**A6*********Y~
MSG*ABLETO FULLY FUNDED~
EB*A*IND*A4^A8^AI^AJ^AK***27**0****Y~
MSG*HIGHEST BENEFIT~
EB*A*IND*A5^A7***27**.1****Y~
EB*B*IND*A5^A7***27*0*****Y~
MSG*HIGHEST BENEFIT~
EB*B*IND*A4^A8^AI^AJ^AK***27*30*****Y~
MSG*HIGHEST BENEFIT~
EB*X~
LS*2120~
NM1*1P*2*FARNSWORTH HEALTH SERVICES*****XX*1841707668~
LE*2120~
SE*145*844362682~
GE*1*844362682~
IEA*1*844362682~`}</div>
                      </div>
                    </div>
                  </div>
                )}
                {bvSourceType === 'portal' && (
                  <div className="flex-1 flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white"><div className="flex items-center gap-3"><SourceBadge type="portal" /><div><p className="text-sm font-medium text-gray-900">Provider Portal</p><p className="text-xs text-gray-400">{getTimestampToday(1, 41)} • Screen Recording</p></div></div></div>
                    <div className="flex-1 bg-gray-900 flex flex-col">
                      {/* Video element */}
                      <div className="flex-1 min-h-0 flex items-center justify-center relative">
                        <video 
                          ref={bvVideoRef}
                          src="/BV_video.mp4"
                          className="w-full h-full object-contain"
                          onClick={toggleBvVideo}
                          onPlay={() => setBvVideoPlaying(true)}
                          onPause={() => setBvVideoPlaying(false)}
                          onEnded={() => setBvVideoPlaying(false)}
                        />
                        {!bvVideoPlaying && (
                          <button 
                            onClick={toggleBvVideo}
                            className="absolute w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
                          >
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </button>
                        )}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${bvVideoPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          <span className="text-white text-xs">{bvVideoPlaying ? 'PLAYING' : 'PAUSED'}</span>
                        </div>
                      </div>
                      {/* Video controls with draggable seek bar */}
                      <div className="flex-shrink-0 bg-black/80 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={toggleBvVideo} className="p-1.5 hover:bg-white/10 rounded transition-colors">
                            {bvVideoPlaying ? (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                            ) : (
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                          </button>
                          <span className="text-white text-xs font-mono w-20">{formatTime(Math.floor(bvVideoTime))} / {formatTime(Math.floor(bvVideoDuration))}</span>
                          <input
                            type="range"
                            min="0"
                            max={bvVideoDuration || 45}
                            step="0.1"
                            value={bvVideoTime}
                            onInput={handleBvVideoSeek}
                            onChange={handleBvVideoSeek}
                            className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                              [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-md
                              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white 
                              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                            style={{
                              background: `linear-gradient(to right, #fff 0%, #fff ${(bvVideoTime / (bvVideoDuration || 45)) * 100}%, rgba(255,255,255,0.3) ${(bvVideoTime / (bvVideoDuration || 45)) * 100}%, rgba(255,255,255,0.3) 100%)`
                            }}
                          />
                        </div>
                        <p className="text-white/60 text-xs mt-2">{bvVideoPlaying ? 'AI navigating portal to verify benefits...' : 'Click to play screen recording'}</p>
                      </div>
                    </div>
                  </div>
                )}
                {bvSourceType === 'call' && (
                  <div className="flex-1 flex flex-col bg-gray-50">
                    {/* Hidden audio element for BV call */}
                    <audio ref={bvAudioRef} src="/BV_call.mp3" preload="auto" />
                    
                    <div className="px-6 py-4 border-b border-gray-100 bg-white">
                      <div className="flex items-center gap-3">
                        <SourceBadge type="call" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payer Verification Call</p>
                          <p className="text-xs text-gray-400">{patient?.insurance || 'Payer'} IVR + Agent • {getTimestampToday(1, 41)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      {/* Waveform visualization */}
                      <div className="w-full max-w-md mb-8">
                        <div className="flex items-center justify-center gap-1 h-20">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div 
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${bvAudioPlaying ? 'bg-gray-900' : 'bg-gray-300'}`}
                              style={{ 
                                height: `${Math.sin(i * 0.5) * 30 + 40 + (bvAudioPlaying ? Math.random() * 20 : 0)}%`,
                                opacity: bvAudioPlaying ? 0.8 + Math.random() * 0.2 : 0.5
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={toggleBvAudio}
                        className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 mb-4 transition-transform hover:scale-105"
                      >
                        {bvAudioPlaying ? (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                        ) : (
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                      </button>
                      
                      <p className="text-sm text-gray-500">{bvAudioPlaying ? 'Playing IVR + agent call...' : 'IVR navigation + agent verification'}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(bvAudioTime)} / {formatTime(bvAudioDuration)}</p>
                      
                      {/* Draggable Progress bar */}
                      <div className="w-64 mt-4 relative">
                        <input
                          type="range"
                          min="0"
                          max={bvAudioDuration || 512}
                          step="0.5"
                          value={bvAudioTime}
                          onInput={handleBvAudioSeek}
                          onChange={handleBvAudioSeek}
                          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                            [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab
                            [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-md
                            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gray-900 
                            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0"
                          style={{
                            background: `linear-gradient(to right, #111827 0%, #111827 ${(bvAudioTime / (bvAudioDuration || 512)) * 100}%, #e5e7eb ${(bvAudioTime / (bvAudioDuration || 512)) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                      
                      {/* Call stages indicator */}
                      <div className="mt-8 w-full max-w-sm">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span>IVR Navigation</span>
                          <span>Agent Verification</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-gray-400 to-gray-900 rounded-full transition-all"
                            style={{ width: `${(bvAudioTime / bvAudioDuration) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
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
                          <p className="text-xs text-gray-400">Entered by Jane D. - {getTimestampToday(0, 15)}</p>
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
                          <p className="text-sm text-gray-900">Called {patient?.insurance || 'payer'} provider line</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Reference Number</p>
                          <p className="text-sm text-gray-900 font-mono">REF-{new Date().getFullYear()}-{getEdiShortDate()}-8847</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</p>
                          <p className="text-sm text-gray-700 leading-relaxed">Spoke with rep Diana (ID #44721). Confirmed active coverage under Choice POS II plan. No prior auth required for outpatient mental health. Benefits verified for dates of service through end of year.</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">Entered: {getPastDateWithTime(0, '11:45 AM')}</p>
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
                {[{ stage: 'Data Extraction', time: '9:42 AM', detail: 'Fax from Austin Family Medicine', duration: '< 1 min' }, { stage: 'Patient Outreach', time: '10:15 AM', detail: 'Connected on first attempt', duration: '33 min wait' }, { stage: 'Intake & Scheduling', time: '10:17 AM', detail: `Booked with ${patient?.provider || 'Dr. Emily Watson'}`, duration: '3 min' }, { stage: 'Benefits Verification', time: '10:19 AM', detail: 'Coverage verified via EDI', duration: '15 sec' }].map((step, index) => (
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
                <div className="p-4"><p className="text-sm font-medium text-gray-900">{patient?.appointmentDate || getRelativeDateWithDay(2)} at {patient?.appointmentTime || '3:30 PM'}</p><p className="text-sm text-gray-600">{patient?.providerMatch || patient?.provider || 'Dr. Emily Watson'}</p><p className="text-xs text-gray-400 mt-1">Individual Therapy • Telehealth</p></div>
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

        {/* ACTIVITY TAB - John Smith only */}
        {activeTab === 'activity' && isJohnSmith && (
          <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="px-8 py-4 border-b border-gray-100 bg-white">
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
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Video controls */}
              <div className="flex-shrink-0 bg-black/80 px-6 py-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleActivityVideo}
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
                    onInput={handleActivityVideoSeek}
                    onChange={handleActivityVideoSeek}
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
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                AI agent navigating AdvancedMD to create patient record and schedule appointment...
              </p>
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

