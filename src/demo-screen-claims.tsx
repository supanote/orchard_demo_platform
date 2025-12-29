import React, { useState } from 'react';

const ClaimsModule = () => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [workflowView, setWorkflowView] = useState('kanban'); // 'kanban' or 'table'
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [detailPanelExpanded, setDetailPanelExpanded] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('details');
  const [showFullCMS1500, setShowFullCMS1500] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('Last 7 days');

  // Sample claims data
  const claims = [
    // New Charges
    { 
      id: 1, 
      patient: 'Sarah Chen', 
      dob: '03/15/1988',
      serviceDate: '12/24/2024',
      provider: 'Dr. Williams',
      facility: 'Main Office',
      mode: 'In-Person',
      cpt: ['90834'],
      modifiers: [],
      icd10: ['F41.1'],
      amount: 150,
      payer: 'Aetna',
      stage: 'new',
      status: 'Queued for AI review',
      timeInStage: '15m',
      isResubmission: false
    },
    { 
      id: 2, 
      patient: 'Michael Rodriguez', 
      dob: '07/22/1975',
      serviceDate: '12/23/2024',
      provider: 'Dr. Chen',
      facility: 'Downtown Clinic',
      mode: 'Telehealth',
      cpt: ['90791'],
      modifiers: ['-95'],
      icd10: ['F32.9'],
      amount: 250,
      payer: 'United',
      stage: 'new',
      status: 'Queued for AI review',
      timeInStage: '1h',
      isResubmission: false
    },
    
    // AI Review
    { 
      id: 3, 
      patient: 'Jennifer Park', 
      dob: '01/30/1990',
      serviceDate: '12/24/2024',
      provider: 'Dr. Williams',
      facility: 'Main Office',
      mode: 'In-Person',
      cpt: ['90837'],
      modifiers: [],
      icd10: ['F43.10'],
      amount: 200,
      payer: 'Cigna',
      stage: 'ai-review',
      status: 'Analyzing...',
      timeInStage: '5m',
      isResubmission: false
    },
    { 
      id: 4, 
      patient: 'David Thompson', 
      dob: '11/08/1982',
      serviceDate: '12/23/2024',
      provider: 'Dr. Smith',
      facility: 'North Campus',
      mode: 'Telehealth',
      cpt: ['90834'],
      modifiers: ['-GT'],
      icd10: ['F41.9'],
      amount: 150,
      payer: 'Blue Cross',
      stage: 'ai-review',
      status: 'Review complete',
      timeInStage: '12m',
      isResubmission: false
    },
    
    // Pending Review
    { 
      id: 5, 
      patient: 'Amanda Foster', 
      dob: '09/14/1995',
      serviceDate: '12/22/2024',
      provider: 'Dr. Williams',
      facility: 'Main Office',
      mode: 'Telehealth',
      cpt: ['90834'],
      modifiers: [],
      icd10: ['F41.1'],
      amount: 150,
      payer: 'Aetna',
      stage: 'pending',
      status: '3 AI suggestions',
      aiSuggestions: [
        { type: 'cpt', from: '90834', to: '90837', reason: 'Session duration: 52 min requires 90837' },
        { type: 'modifier', add: '-GT', reason: 'Telehealth service indicator missing' },
        { type: 'icd10', from: 'F41.1', to: 'F41.9', reason: 'Better matches clinical documentation' }
      ],
      timeInStage: '2h',
      isResubmission: false
    },
    { 
      id: 6, 
      patient: 'James Liu', 
      dob: '02/28/1980',
      serviceDate: '12/23/2024',
      provider: 'Dr. Chen',
      facility: 'Downtown Clinic',
      mode: 'Telehealth',
      cpt: ['90837'],
      modifiers: [],
      icd10: ['F32.9'],
      amount: 200,
      payer: 'Medicare',
      stage: 'pending',
      status: '1 AI suggestion',
      aiSuggestions: [
        { type: 'modifier', add: '-95', reason: 'Telehealth modifier required for Medicare' }
      ],
      timeInStage: '4h',
      isResubmission: false
    },
    { 
      id: 7, 
      patient: 'Lisa Martinez', 
      dob: '04/18/1988',
      serviceDate: '12/20/2024',
      provider: 'Dr. Williams',
      facility: 'Main Office',
      mode: 'Telehealth',
      cpt: ['90834'],
      modifiers: ['-GT'],
      icd10: ['F43.12'],
      amount: 150,
      payer: 'United',
      stage: 'pending',
      status: 'Changes Applied',
      approvedBy: 'Sarah M.',
      approvedAt: '2:34 PM',
      aiSuggestions: [
        { type: 'cpt', from: '90834', to: '90837', reason: 'Session duration: 52 min requires 90837', approved: true },
        { type: 'modifier', add: '-GT', reason: 'Telehealth service indicator missing', approved: true }
      ],
      timeInStage: '6h',
      isResubmission: false
    },
    { 
      id: 8, 
      patient: 'Robert Kim', 
      dob: '12/01/1970',
      serviceDate: '12/19/2024',
      provider: 'Dr. Smith',
      facility: 'North Campus',
      mode: 'Telehealth',
      cpt: ['90791'],
      modifiers: ['-GT'],
      icd10: ['F32.1'],
      amount: 250,
      payer: 'Cigna',
      stage: 'pending',
      status: 'Partially approved (1/2)',
      approvedBy: 'Mike R.',
      approvedAt: '1:15 PM',
      aiSuggestions: [
        { type: 'modifier', add: '-GT', reason: 'Telehealth service indicator', approved: true },
        { type: 'icd10', from: 'F32.1', to: 'F32.2', reason: 'Severity adjustment', approved: false }
      ],
      timeInStage: '1d',
      isResubmission: false
    },
    { 
      id: 9, 
      patient: 'Emily Watson', 
      dob: '11/03/1992',
      serviceDate: '12/18/2024',
      provider: 'Dr. Chen',
      facility: 'Downtown Clinic',
      mode: 'In-Person',
      cpt: ['90834'],
      modifiers: [],
      icd10: ['F41.0'],
      amount: 150,
      payer: 'Aetna',
      stage: 'pending',
      status: '⚠️ Resubmission - Attempt 2',
      aiSuggestions: [
        { type: 'modifier', add: '-59', reason: 'Distinct procedural service' }
      ],
      timeInStage: '3h',
      isResubmission: true,
      resubmissionAttempt: 2,
      previousRejection: 'Missing modifier -59'
    },
    
    // Submitted
    { 
      id: 10, 
      patient: 'Thomas Anderson', 
      dob: '05/12/1982',
      serviceDate: '12/21/2024',
      provider: 'Dr. Williams',
      facility: 'Main Office',
      mode: 'In-Person',
      cpt: ['90837'],
      modifiers: [],
      icd10: ['F41.1'],
      amount: 200,
      payer: 'Blue Cross',
      stage: 'submitted',
      status: 'In transit',
      submittedAt: 'Dec 26, 10:30 AM',
      clearinghouse: 'Change Healthcare',
      timeInStage: '4h',
      isResubmission: false
    },
    { 
      id: 11, 
      patient: 'Maria Garcia', 
      dob: '10/09/1978',
      serviceDate: '12/20/2024',
      provider: 'Dr. Smith',
      facility: 'North Campus',
      mode: 'Telehealth',
      cpt: ['90834'],
      modifiers: ['-95'],
      icd10: ['F43.10'],
      amount: 150,
      payer: 'Cigna',
      stage: 'submitted',
      status: 'Accepted',
      submittedAt: 'Dec 25, 3:45 PM',
      acceptedAt: 'Dec 26, 9:15 AM',
      clearinghouse: 'Waystar',
      timeInStage: '1d',
      isResubmission: false
    },
    { 
      id: 12, 
      patient: 'Kevin Wright', 
      dob: '06/25/1993',
      serviceDate: '12/19/2024',
      provider: 'Dr. Chen',
      facility: 'Downtown Clinic',
      mode: 'In-Person',
      cpt: ['90791'],
      modifiers: [],
      icd10: ['F32.9'],
      amount: 250,
      payer: 'United',
      stage: 'submitted',
      status: 'Accepted',
      submittedAt: 'Dec 24, 2:20 PM',
      acceptedAt: 'Dec 25, 11:30 AM',
      clearinghouse: 'Change Healthcare',
      timeInStage: '2d',
      isResubmission: false
    },
    { 
      id: 13, 
      patient: 'Rachel Green', 
      dob: '03/08/1985',
      serviceDate: '12/18/2024',
      provider: 'Dr. Williams',
      facility: 'Main Office',
      mode: 'In-Person',
      cpt: ['90834'],
      modifiers: [],
      icd10: ['F41.9'],
      amount: 150,
      payer: 'Aetna',
      stage: 'submitted',
      status: 'Rejected',
      submittedAt: 'Dec 23, 4:15 PM',
      rejectedAt: 'Dec 25, 3:42 PM',
      rejectionReason: 'Missing coordination of benefits information',
      rejectionCode: 'COB-123',
      clearinghouse: 'Change Healthcare',
      timeInStage: '3d',
      isResubmission: false
    },
    { 
      id: 14, 
      patient: 'Daniel Lee', 
      dob: '07/17/1972',
      serviceDate: '12/17/2024',
      provider: 'Dr. Smith',
      facility: 'North Campus',
      mode: 'Telehealth',
      cpt: ['90837'],
      modifiers: ['-95', '-GT'],
      icd10: ['F32.1'],
      amount: 200,
      payer: 'Medicare',
      stage: 'submitted',
      status: 'Rejected',
      submittedAt: 'Dec 22, 1:30 PM',
      rejectedAt: 'Dec 24, 10:20 AM',
      rejectionReason: 'Invalid modifier combination',
      rejectionCode: 'MOD-456',
      clearinghouse: 'Waystar',
      timeInStage: '4d',
      isResubmission: false
    }
  ];

  const stages = [
    { id: 'new', name: 'New Charges', color: '#6b7280', bgColor: '#f9fafb' },
    { id: 'ai-review', name: 'AI Review', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 'pending', name: 'Human Approval', color: '#f59e0b', bgColor: '#fffbeb' },
    { id: 'submitted', name: 'Claim Submitted', color: '#10b981', bgColor: '#ecfdf5' }
  ];

  const toggleRowExpansion = (claimId) => {
    setExpandedRows(prev => 
      prev.includes(claimId) 
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  const toggleClaimSelection = (claimId) => {
    setSelectedClaims(prev =>
      prev.includes(claimId)
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  const toggleAllClaims = () => {
    if (selectedClaims.length === claims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(claims.map(c => c.id));
    }
  };

  // Sample tasks data
  const tasks = [
    {
      id: 't1',
      claimId: 13,
      patient: 'Rachel Green',
      dob: '03/08/1985',
      payer: 'Aetna',
      amount: 150,
      type: 'rejected',
      stage: 'Claim Submitted',
      reason: 'COB-123: Missing coordination of benefits',
      priority: 'P1',
      waiting: '3d',
      waitingMinutes: 4320,
      assignedTo: null,
      slaBreached: true
    },
    {
      id: 't2',
      claimId: 5,
      patient: 'Amanda Foster',
      dob: '09/14/1995',
      payer: 'Aetna',
      amount: 150,
      type: 'human-review',
      stage: 'Human Approval',
      reason: '3 AI suggestions to review',
      priority: 'P1',
      waiting: '4h',
      waitingMinutes: 240,
      assignedTo: null,
      slaBreached: false
    },
    {
      id: 't3',
      claimId: 14,
      patient: 'Daniel Lee',
      dob: '07/17/1972',
      payer: 'Medicare',
      amount: 200,
      type: 'rejected',
      stage: 'Claim Submitted',
      reason: 'MOD-456: Invalid modifier combination',
      priority: 'P1',
      waiting: '4d',
      waitingMinutes: 5760,
      assignedTo: 'Sarah M.',
      slaBreached: true
    },
    {
      id: 't4',
      claimId: 6,
      patient: 'James Liu',
      dob: '02/28/1980',
      payer: 'Medicare',
      amount: 200,
      type: 'human-review',
      stage: 'Human Approval',
      reason: '1 AI suggestion to review',
      priority: 'P2',
      waiting: '4h',
      waitingMinutes: 240,
      assignedTo: null,
      slaBreached: false
    },
    {
      id: 't5',
      claimId: 9,
      patient: 'Emily Watson',
      dob: '11/03/1992',
      payer: 'Aetna',
      amount: 150,
      type: 'expert-review',
      stage: 'Human Approval',
      reason: 'AI low confidence - complex modifier scenario',
      priority: 'P2',
      waiting: '3h',
      waitingMinutes: 180,
      assignedTo: 'Mike R.',
      slaBreached: false
    },
    {
      id: 't6',
      claimId: 7,
      patient: 'Lisa Martinez',
      dob: '04/18/1988',
      payer: 'United',
      amount: 150,
      type: 'ready-submit',
      stage: 'Human Approval',
      reason: 'Changes approved - Ready to submit',
      priority: 'P2',
      waiting: '6h',
      waitingMinutes: 360,
      assignedTo: 'Sarah M.',
      slaBreached: false
    },
    {
      id: 't7',
      claimId: 8,
      patient: 'Robert Kim',
      dob: '12/01/1970',
      payer: 'Cigna',
      amount: 250,
      type: 'ready-submit',
      stage: 'Human Approval',
      reason: 'Partial approval - Ready to submit',
      priority: 'P2',
      waiting: '1d',
      waitingMinutes: 1440,
      assignedTo: null,
      slaBreached: false
    }
  ];

  const teamMembers = ['Sarah M.', 'Mike R.', 'Jane D.', 'Tom S.'];

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(t => t.id));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Claims & Charge Review</h1>
            <p className="text-sm text-gray-500 mt-0.5">Automated charge review and claims submission</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Workflow
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              Tasks
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {tasks.length}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'summary' && (
          <div className="h-full overflow-auto bg-gray-50">
            {/* Filter Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Left Side - Empty for now */}
                <div></div>
                
                {/* Right Side - Filters */}
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedTimePeriod}
                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900"
                  >
                    <option>Last 7 days</option>
                    <option>Today</option>
                    <option>Last 30 days</option>
                    <option>This month</option>
                    <option>Last month</option>
                    <option>Custom range</option>
                  </select>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Payers</option>
                    <option>Aetna</option>
                    <option>United</option>
                    <option>Blue Cross</option>
                    <option>Cigna</option>
                    <option>Medicare</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Providers</option>
                    <option>Dr. Williams</option>
                    <option>Dr. Smith</option>
                    <option>Dr. Johnson</option>
                    <option>Dr. Lee</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Service Types</option>
                    <option>Individual Therapy</option>
                    <option>Group Therapy</option>
                    <option>Intake Assessment</option>
                    <option>Family Therapy</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Locations</option>
                    <option>Main Office</option>
                    <option>Downtown Clinic</option>
                    <option>North Campus</option>
                  </select>
                  <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Time Period Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{selectedTimePeriod}</p>
                <button className="text-xs text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-5 gap-4">
                {/* 1. Total Claims */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Total Claims</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-gray-900">147</p>
                    <p className="text-sm text-gray-600">$22,050</p>
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">↑ 12% vs last week</p>
                </div>

                {/* 2. Clean Claims Rate */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Clean Claims Rate</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-semibold text-gray-900">96%</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">4% rejection rate</p>
                </div>

                {/* 3. Timely Filing Rate */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Timely Filing Rate</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-semibold text-gray-900">98%</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <p className="text-xs text-emerald-600">↑ 3% vs last week</p>
                </div>

                {/* 4. Average Processing Time */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Avg. Processing Time</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <p className="text-2xl font-semibold text-gray-900">2.1</p>
                    <p className="text-sm text-gray-500">h</p>
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">↓ 18% faster</p>
                </div>

                {/* 5. AI Enhancement + Revenue Impact */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Claims Enhanced by AI</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-gray-900">38%</p>
                    <p className="text-sm text-gray-600">$3,450</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Revenue impact</p>
                </div>
              </div>

              {/* Main Content - Two Column Layout */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="col-span-2 space-y-6">
                  {/* Top Rejection Reasons */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-900">Top Rejection Reasons</h3>
                      <p className="text-xs text-gray-500">{selectedTimePeriod}</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                      {/* COB Issues */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-40 flex-shrink-0">COB Issues</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-10 flex items-center px-4">
                            <span className="text-sm font-medium text-gray-900">12</span>
                          </div>
                        </div>
                      </div>

                      {/* Invalid Modifiers */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-40 flex-shrink-0">Invalid Modifiers</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full h-10 flex items-center px-4" style={{ width: '75%' }}>
                            <span className="text-sm font-medium text-gray-900">9</span>
                          </div>
                        </div>
                      </div>

                      {/* Missing Authorization */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-40 flex-shrink-0">Missing Authorization</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full h-10 flex items-center px-4" style={{ width: '50%' }}>
                            <span className="text-sm font-medium text-gray-900">6</span>
                          </div>
                        </div>
                      </div>

                      {/* Coding Errors */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-40 flex-shrink-0">Coding Errors</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full h-10 flex items-center px-4" style={{ width: '25%' }}>
                            <span className="text-sm font-medium text-gray-900">3</span>
                          </div>
                        </div>
                      </div>

                      {/* Documentation Issues */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-40 flex-shrink-0">Documentation Issues</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full h-10 flex items-center px-4" style={{ width: '17%' }}>
                            <span className="text-sm font-medium text-gray-900">2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Needs Attention */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 h-[340px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-900">Needs Attention</h3>
                      <button 
                        onClick={() => setActiveTab('tasks')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all →
                      </button>
                    </div>
                    
                    <div className="space-y-2 overflow-auto flex-1">
                      {tasks.slice(0, 5).map((task) => (
                        <div 
                          key={task.id}
                          onClick={() => {
                            const claim = claims.find(c => c.id === task.claimId);
                            setSelectedClaim(claim);
                          }}
                          className="flex items-center justify-between py-3 px-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                              task.priority === 'P1' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{task.patient}</p>
                              <p className="text-xs text-gray-500 truncate">{task.reason}</p>
                            </div>
                          </div>
                          <span className={`text-sm flex-shrink-0 ml-4 ${
                            task.slaBreached ? 'text-red-600 font-medium' : 'text-gray-500'
                          }`}>
                            {task.waiting}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                  {/* AI Agents */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 h-[400px] flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex-shrink-0">AI Agents</h3>
                    
                    <div className="space-y-3 overflow-auto flex-1">
                      {/* Claims Coordinator */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">Claims Coordinator</p>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Orchestrating claim #C-2847</p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-900 font-medium">147 today</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-emerald-600">98% success</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Charge Review Agent */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">Charge Review</p>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Analyzing Amanda Foster</p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-900 font-medium">56 today</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-emerald-600">94% accuracy</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Claims Filer */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">Claims Filer</p>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Submitting batch CH-001</p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-900 font-medium">23 today</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-emerald-600">96% clean</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Activity */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 h-[340px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-900">Live Activity</h3>
                      <button className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Live
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto space-y-3">
                      {/* Activity Items */}
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Charge Review</span> identified 3 suggestions
                          </p>
                          <p className="text-gray-500">Amanda Foster • Just now</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Claims Filer</span> submitted claim
                          </p>
                          <p className="text-gray-500">Claim #C-2845 • 45s ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Claims Coordinator</span> routed to AI review
                          </p>
                          <p className="text-gray-500">Lisa Martinez • 1m ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Charge Review</span> validated CPT codes
                          </p>
                          <p className="text-gray-500">Robert Kim • 2m ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Claims Filer</span> received 999 ACK
                          </p>
                          <p className="text-gray-500">Claim #C-2841 • 3m ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Claims Coordinator</span> approved changes
                          </p>
                          <p className="text-gray-500">Sarah Chen • 4m ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Charge Review</span> flagged modifier issue
                          </p>
                          <p className="text-gray-500">James Liu • 5m ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">Claims Filer</span> batch submitted
                          </p>
                          <p className="text-gray-500">Batch CH-001 • 6m ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="h-full flex flex-col">
            {/* Workflow Controls */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Left Side - Search or Batch Actions */}
                <div className="flex items-center gap-3">
                  {workflowView === 'table' && selectedClaims.length > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">✓ {selectedClaims.length} selected</span>
                      <button className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                        Approve Selected
                      </button>
                      <button className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                        Submit Batch
                      </button>
                      <button 
                        onClick={() => setSelectedClaims([])}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Search claims..."
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 w-64"
                    />
                  )}
                </div>
                
                {/* Right Side - Filters and View Toggle */}
                <div className="flex items-center gap-3">
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Stages</option>
                    <option>New Charges</option>
                    <option>AI Review</option>
                    <option>Human Approval</option>
                    <option>Claim Submitted</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Payers</option>
                    <option>Aetna</option>
                    <option>United</option>
                    <option>Blue Cross</option>
                    <option>Cigna</option>
                    <option>Medicare</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Dates</option>
                    <option>Today</option>
                    <option>Yesterday</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Custom Range</option>
                  </select>
                  
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setWorkflowView('kanban')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        workflowView === 'kanban'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Kanban
                    </button>
                    <button
                      onClick={() => setWorkflowView('table')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        workflowView === 'table'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban View */}
            {workflowView === 'kanban' && (
              <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-4 h-full min-w-max">
                  {stages.map(stage => {
                    const stageClaims = claims.filter(c => c.stage === stage.id);
                    return (
                      <div key={stage.id} className="flex-1 min-w-80 flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">{stage.name}</h3>
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                              {stageClaims.length}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-3 overflow-y-auto">
                          {stageClaims.map(claim => (
                            <div
                              key={claim.id}
                              onClick={() => setSelectedClaim(claim)}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all min-h-[180px] flex flex-col"
                            >
                              {/* Header - Patient + Amount */}
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900">{claim.patient}</p>
                                <span className="text-sm font-semibold text-gray-900">${claim.amount}</span>
                              </div>
                              
                              {/* Key Info - Compact 2-column layout */}
                              <div className="space-y-1 mb-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">DOS {claim.serviceDate.replace('12/', '12/')}</span>
                                  <span className="text-gray-900">{claim.payer}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  CPT {claim.cpt[0]}
                                </div>
                              </div>
                              
                              {/* Resubmission Warning */}
                              {claim.isResubmission && (
                                <div className="mb-2 flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-700">
                                  ⚠️ Attempt {claim.resubmissionAttempt}
                                </div>
                              )}
                              
                              {/* Status Badge - flex-grow pushes footer down */}
                              <div className="mb-2 flex-grow">
                                {claim.stage === 'pending' && claim.aiSuggestions && !claim.approvedBy && (
                                  <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                                    {claim.aiSuggestions.length} AI suggestion{claim.aiSuggestions.length > 1 ? 's' : ''}
                                  </span>
                                )}
                                
                                {claim.stage === 'pending' && claim.approvedBy && (
                                  <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                                    Changes Applied
                                  </span>
                                )}
                                
                                {claim.stage === 'submitted' && claim.status === 'In transit' && (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span>In transit</span>
                                  </div>
                                )}
                                
                                {claim.stage === 'submitted' && claim.status === 'Accepted' && (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Accepted</span>
                                  </div>
                                )}
                                
                                {claim.stage === 'submitted' && claim.status === 'Rejected' && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1 text-xs text-red-600">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                      </svg>
                                      <span className="font-medium">Rejected - {claim.rejectionCode}</span>
                                    </div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); }}
                                      className="w-full px-2 py-1 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded hover:bg-gray-50"
                                    >
                                      Correct & Resubmit
                                    </button>
                                  </div>
                                )}
                                
                                {claim.stage === 'ai-review' && (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span>{claim.status}</span>
                                  </div>
                                )}
                                
                                {claim.stage === 'new' && (
                                  <span className="text-xs text-gray-500">{claim.status}</span>
                                )}
                              </div>
                              
                              {/* Footer - Time in stage - always at bottom */}
                              <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 mt-auto">
                                {claim.timeInStage} in stage
                              </div>
                            </div>
                          ))}
                          
                          {stageClaims.length === 0 && (
                            <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                              <p className="text-sm text-gray-400">No claims</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table View */}
            {workflowView === 'table' && (
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedClaims.length === claims.length}
                          onChange={toggleAllClaims}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOS</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modifiers</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ICD-10</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {claims.map(claim => (
                      <React.Fragment key={claim.id}>
                        <tr 
                          className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedClaims.includes(claim.id)}
                              onChange={() => toggleClaimSelection(claim.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{claim.patient}</p>
                              <p className="text-xs text-gray-500">{claim.dob}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{claim.serviceDate}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{claim.payer}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">${claim.amount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{claim.provider}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{claim.facility}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              claim.mode === 'Telehealth' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {claim.mode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">{claim.cpt.join(', ')}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{claim.modifiers.length > 0 ? claim.modifiers.join(', ') : '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">{claim.icd10.join(', ')}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              claim.stage === 'new' ? 'bg-gray-100 text-gray-700' :
                              claim.stage === 'ai-review' ? 'bg-blue-50 text-blue-700' :
                              claim.stage === 'pending' ? 'bg-amber-50 text-amber-700' :
                              'bg-emerald-50 text-emerald-700'
                            }`}>
                              {stages.find(s => s.id === claim.stage)?.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {claim.isResubmission && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-700">
                                  ⚠️ Attempt {claim.resubmissionAttempt}
                                </span>
                              )}
                              
                              {claim.stage === 'pending' && claim.aiSuggestions && !claim.approvedBy && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(claim.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium hover:bg-amber-100"
                                >
                                  {claim.aiSuggestions.length} AI suggestion{claim.aiSuggestions.length > 1 ? 's' : ''}
                                  <svg className={`w-3 h-3 transition-transform ${expandedRows.includes(claim.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              )}
                              
                              {claim.stage === 'pending' && claim.approvedBy && (
                                <span className="text-xs text-emerald-600">Changes Applied</span>
                              )}
                              
                              {claim.stage === 'submitted' && claim.status === 'In transit' && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  In transit
                                </span>
                              )}
                              
                              {claim.stage === 'submitted' && claim.status === 'Accepted' && (
                                <span className="text-xs text-emerald-600">✓ Accepted</span>
                              )}
                              
                              {claim.stage === 'submitted' && claim.status === 'Rejected' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(claim.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                                >
                                  ⚠️ Rejected - {claim.rejectionCode}
                                  <svg className={`w-3 h-3 transition-transform ${expandedRows.includes(claim.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              )}
                              
                              {claim.stage === 'ai-review' && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                  {claim.status}
                                </span>
                              )}
                              
                              {claim.stage === 'new' && (
                                <span className="text-xs text-gray-500">{claim.status}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{claim.timeInStage}</td>
                          <td className="px-4 py-3">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Content */}
                        {expandedRows.includes(claim.id) && (
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <td colSpan="12" className="px-4 py-4">
                              {claim.aiSuggestions && claim.stage === 'pending' && (
                                <div className="ml-12 space-y-3">
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-3">AI Suggestions</p>
                                  {claim.aiSuggestions.map((suggestion, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                      <input type="checkbox" defaultChecked className="mt-0.5 rounded border-gray-300" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">
                                          {suggestion.type === 'cpt' && `Change CPT ${suggestion.from} → ${suggestion.to}`}
                                          {suggestion.type === 'modifier' && `Add modifier ${suggestion.add}`}
                                          {suggestion.type === 'icd10' && `Update ICD-10 ${suggestion.from} → ${suggestion.to}`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{suggestion.reason}</p>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex gap-2 mt-4">
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                                      Approve All
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                      Approve Selected
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                      Reject All
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {claim.status === 'Rejected' && claim.stage === 'submitted' && (
                                <div className="ml-12 space-y-3">
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-3">Rejection Details</p>
                                  <div className="p-4 bg-white border border-red-200 rounded-lg">
                                    <p className="text-sm font-medium text-red-900 mb-2">Error {claim.rejectionCode}: {claim.rejectionReason}</p>
                                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                                      <p>Clearinghouse: {claim.clearinghouse}</p>
                                      <p>Rejected: {claim.rejectedAt}</p>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                                      Correct & Resubmit
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="h-full flex flex-col">
            {/* Tasks Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Left Side - Title or Bulk Actions */}
                <div className="flex items-center gap-4">
                  {selectedTasks.length > 0 ? (
                    <>
                      <span className="text-sm text-gray-600">✓ {selectedTasks.length} selected</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Assign to:</span>
                        <select className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                          <option value="">Select team member</option>
                          {teamMembers.map(member => (
                            <option key={member} value={member}>{member}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={() => setSelectedTasks([])}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <h2 className="text-base font-semibold text-gray-900">Action Required ({tasks.length})</h2>
                  )}
                </div>
                
                {/* Right Side - Filters */}
                <div className="flex items-center gap-3">
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Types</option>
                    <option>Human Review</option>
                    <option>Rejected Claims</option>
                    <option>Expert Review</option>
                    <option>Ready to Submit</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Priorities</option>
                    <option>P1 - Critical</option>
                    <option>P2 - Standard</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option>All Assignments</option>
                    <option>Unassigned</option>
                    <option>Assigned to Me</option>
                    <option>Assigned to Others</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === tasks.length}
                        onChange={toggleAllTasks}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiting</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {tasks.map(task => {
                    const claim = claims.find(c => c.id === task.claimId);
                    return (
                      <tr 
                        key={task.id}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{task.patient}</p>
                            <p className="text-xs text-gray-500">{task.dob}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{task.payer}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">${task.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.type === 'human-review' ? 'bg-amber-50 text-amber-700' :
                            task.type === 'rejected' ? 'bg-red-50 text-red-700' :
                            task.type === 'expert-review' ? 'bg-purple-50 text-purple-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {task.type === 'human-review' && 'Human Review'}
                            {task.type === 'rejected' && 'Rejected'}
                            {task.type === 'expert-review' && 'Expert Review'}
                            {task.type === 'ready-submit' && 'Ready to Submit'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{task.stage}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            task.priority === 'P1' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${task.slaBreached ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {task.waiting}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={() => setAssignDropdownOpen(assignDropdownOpen === task.id ? null : task.id)}
                              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                            >
                              {task.assignedTo || 'Unassigned'}
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                            
                            {assignDropdownOpen === task.id && (
                              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <div className="py-1">
                                  <button 
                                    onClick={() => setAssignDropdownOpen(null)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Unassigned
                                  </button>
                                  {teamMembers.map(member => (
                                    <button
                                      key={member}
                                      onClick={() => setAssignDropdownOpen(null)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      {member}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            Open
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Claim Detail Side Panel */}
      {selectedClaim && (
        <aside className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col transition-all ${
          detailPanelExpanded ? 'w-full' : 'w-[680px]'
        }`}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedClaim.stage === 'new' ? 'bg-gray-100 text-gray-700' :
                    selectedClaim.stage === 'ai-review' ? 'bg-blue-50 text-blue-700' :
                    selectedClaim.stage === 'pending' ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {stages.find(s => s.id === selectedClaim.stage)?.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedClaim.patient}</h2>
                  <span className="text-lg font-semibold text-gray-900">${selectedClaim.amount}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span>{selectedClaim.payer}</span>
                  <span className="text-gray-300">•</span>
                  <span>DOS {selectedClaim.serviceDate}</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-mono">CPT {selectedClaim.cpt[0]}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedClaim.stage === 'pending' && selectedClaim.aiSuggestions && !selectedClaim.approvedBy && 
                    `${selectedClaim.aiSuggestions.length} AI suggestions awaiting approval`}
                  {selectedClaim.stage === 'pending' && selectedClaim.approvedBy && 
                    `Changes approved - Ready to submit`}
                  {selectedClaim.stage === 'ai-review' && selectedClaim.status}
                  {selectedClaim.stage === 'new' && 'Ready for AI review'}
                  {selectedClaim.stage === 'submitted' && selectedClaim.status}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setDetailPanelExpanded(!detailPanelExpanded)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  title={detailPanelExpanded ? "Collapse" : "Expand to full page"}
                >
                  {detailPanelExpanded ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedClaim(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Removed primary CTAs from header - they appear in relevant tabs instead */}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveDetailTab('details')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeDetailTab === 'details'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Claim Details
              </button>
              <button
                onClick={() => setActiveDetailTab('ai-review')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeDetailTab === 'ai-review'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                AI Review
              </button>
              <button
                onClick={() => setActiveDetailTab('clinical')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeDetailTab === 'clinical'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Clinical Details
              </button>
              <button
                onClick={() => setActiveDetailTab('submission')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeDetailTab === 'submission'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Submission
              </button>
              <button
                onClick={() => setActiveDetailTab('activity')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeDetailTab === 'activity'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            <div className={detailPanelExpanded ? 'max-w-4xl mx-auto' : ''}>
            {/* Tab 1: Claim Details */}
            {activeDetailTab === 'details' && (
              <div className="p-6 space-y-6">
                {/* Patient Information */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Patient Information</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Name</span>
                      <span className="text-gray-900 font-medium">{selectedClaim.patient}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="text-gray-900">{selectedClaim.dob}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Member ID</span>
                      <span className="text-gray-900 font-mono">{selectedClaim.memberId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phone</span>
                      <span className="text-gray-900">{selectedClaim.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Insurance Information</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payer</span>
                      <span className="text-gray-900 font-medium">{selectedClaim.payer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Member ID</span>
                      <span className="text-gray-900 font-mono">{selectedClaim.memberId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Group Number</span>
                      <span className="text-gray-900">GRP-12345</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Plan Type</span>
                      <span className="text-gray-900">PPO</span>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Service Details</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date of Service</span>
                      <span className="text-gray-900 font-medium">{selectedClaim.serviceDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Provider</span>
                      <span className="text-gray-900">{selectedClaim.provider}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Place of Service</span>
                      <span className="text-gray-900">11 - Office</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service Type</span>
                      <span className="text-gray-900">Individual Therapy - Telehealth</span>
                    </div>
                  </div>
                </div>

                {/* Billing Codes */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Billing Codes</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">CPT Code</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-900">{selectedClaim.cpt[0]}</span>
                        <span className="text-sm text-gray-600">Psychotherapy, 45 minutes</span>
                      </div>
                      {selectedClaim.cpt.length > 1 && selectedClaim.cpt.slice(1).map((code, i) => (
                        <div key={i} className="flex items-center justify-between mt-2">
                          <span className="text-sm font-mono text-gray-900">{code}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">ICD-10 Code</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-900">{selectedClaim.icd10[0]}</span>
                        <span className="text-sm text-gray-600">Generalized Anxiety Disorder</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Modifiers</p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">-GT</span>
                      <span className="text-xs text-gray-500 ml-2">Telehealth</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Units</span>
                      <span className="text-gray-900">1</span>
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Financial</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Billed Amount</span>
                      <span className="text-gray-900 font-semibold">${selectedClaim.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expected Reimbursement</span>
                      <span className="text-gray-900">$120</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Patient Responsibility</span>
                      <span className="text-gray-900">$30 copay</span>
                    </div>
                  </div>
                </div>

                {/* Authorization */}
                {selectedClaim.needsApproval && (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase">Authorization</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Auth Number</span>
                        <span className="text-gray-900 font-mono">AUTH-2024-12345</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sessions Remaining</span>
                        <span className="text-gray-900">8 of 12</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Full CMS 1500 */}
                <button 
                  onClick={() => setShowFullCMS1500(!showFullCMS1500)}
                  className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {showFullCMS1500 ? 'Hide' : 'View'} Full CMS 1500 Form
                </button>

                {showFullCMS1500 && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs space-y-2">
                    <p className="text-gray-600 italic">Complete CMS 1500 form with all 33 boxes would be displayed here, including:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Secondary insurance details (boxes 9-9d)</li>
                      <li>Employment/accident related fields (10a-c)</li>
                      <li>Referring provider information (box 17)</li>
                      <li>Outside lab charges (box 20)</li>
                      <li>Federal Tax ID, SSN/EIN (box 25)</li>
                      <li>Patient account number (box 26)</li>
                      <li>All service line details (box 24)</li>
                      <li>Complete billing provider info (boxes 31-33)</li>
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    Edit Claim
                  </button>
                  <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    Export as PDF
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: AI Review */}
            {activeDetailTab === 'ai-review' && (
              <div className="p-6">
                {selectedClaim.stage === 'ai-review' && selectedClaim.status === 'Analyzing...' && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">AI Analyzing Claim...</p>
                    <p className="text-sm text-gray-500 mt-1">This usually takes 10-15 seconds</p>
                  </div>
                )}

                {selectedClaim.aiSuggestions && !selectedClaim.approvedBy && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedClaim.aiSuggestions.length} Suggestions Identified</p>
                        <p className="text-xs text-gray-500 mt-0.5">Select which changes to apply</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (selectedSuggestions.length === selectedClaim.aiSuggestions.length) {
                            setSelectedSuggestions([]);
                          } else {
                            setSelectedSuggestions(selectedClaim.aiSuggestions.map((_, i) => i));
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {selectedSuggestions.length === selectedClaim.aiSuggestions.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedClaim.aiSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <input 
                              type="checkbox" 
                              checked={selectedSuggestions.includes(idx)}
                              onChange={() => {
                                setSelectedSuggestions(prev =>
                                  prev.includes(idx) 
                                    ? prev.filter(i => i !== idx)
                                    : [...prev, idx]
                                );
                              }}
                              className="mt-0.5 rounded border-gray-300" 
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {suggestion.type === 'cpt' && `CPT Code Change`}
                                  {suggestion.type === 'modifier' && `Missing Modifier`}
                                  {suggestion.type === 'icd10' && `ICD-10 Update`}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                                  High Confidence
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 mb-2">
                                {suggestion.type === 'cpt' && `Change: ${suggestion.from} → ${suggestion.to}`}
                                {suggestion.type === 'modifier' && `Add modifier: ${suggestion.add}`}
                                {suggestion.type === 'icd10' && `Update: ${suggestion.from} → ${suggestion.to}`}
                              </p>
                              <p className="text-xs text-gray-600">{suggestion.reason}</p>
                              {suggestion.type === 'cpt' && (
                                <p className="text-xs text-emerald-600 mt-2">Impact: +$50 reimbursement</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <button className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                        Approve All Suggestions
                      </button>
                      <button 
                        disabled={selectedSuggestions.length === 0}
                        className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve Selected ({selectedSuggestions.length})
                      </button>
                      <button className="w-full py-2 px-4 text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                        Reject All
                      </button>
                      <button className="w-full py-2 px-4 text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                        Request Expert Review
                      </button>
                    </div>
                  </div>
                )}

                {selectedClaim.aiSuggestions && selectedClaim.approvedBy && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm font-medium text-emerald-900">Changes Approved</p>
                      </div>
                      <p className="text-xs text-emerald-700">Approved by {selectedClaim.approvedBy} at {selectedClaim.approvedAt}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-3">Applied Changes</p>
                      <div className="space-y-3">
                        {selectedClaim.aiSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {suggestion.approved !== false ? (
                                  <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    {suggestion.type === 'cpt' && `CPT Code Change`}
                                    {suggestion.type === 'modifier' && `Missing Modifier`}
                                    {suggestion.type === 'icd10' && `ICD-10 Update`}
                                  </p>
                                  {suggestion.approved !== false && (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                                      Applied
                                    </span>
                                  )}
                                  {suggestion.approved === false && (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                      Not Applied
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900 mb-2">
                                  {suggestion.type === 'cpt' && `Change: ${suggestion.from} → ${suggestion.to}`}
                                  {suggestion.type === 'modifier' && `Add modifier: ${suggestion.add}`}
                                  {suggestion.type === 'icd10' && `Update: ${suggestion.from} → ${suggestion.to}`}
                                </p>
                                <p className="text-xs text-gray-600">{suggestion.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                        Push Changes to EHR & Submit
                      </button>
                    </div>
                  </div>
                )}

                {!selectedClaim.aiSuggestions && selectedClaim.stage !== 'ai-review' && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">No AI Review Available</p>
                    <p className="text-sm text-gray-500 mt-1">AI analysis has not been run on this claim yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Clinical Details */}
            {activeDetailTab === 'clinical' && (
              <div className="p-6 space-y-6">
                {/* Session Quick Facts - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Chief Complaint</p>
                    <p className="text-sm text-gray-900">Patient reports increased anxiety and difficulty sleeping over past 2 weeks...</p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                      Expand ▼
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Session Duration</p>
                    <p className="text-xl font-semibold text-gray-900">52 minutes</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Primary Focus</p>
                    <p className="text-sm text-gray-900">Anxiety management, sleep hygiene</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Session Type</p>
                    <p className="text-sm text-gray-900">Individual psychotherapy</p>
                  </div>
                </div>

                {/* Progress Note - Hero Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">Progress Note</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>Generated by</span>
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 50'%3E%3Ctext x='10' y='35' font-family='Arial, sans-serif' font-size='24' fill='%23000'%3Esupanote.ai%3C/text%3E%3C/svg%3E" alt="SuperNote" className="h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-gray-700">
                    {/* SUBJECTIVE */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">SUBJECTIVE</h4>
                      <p className="leading-relaxed">
                        Patient reports increased anxiety over the past week, particularly related to work-related stress and upcoming project deadlines. States sleep has been disrupted, with difficulty falling asleep and early morning awakening. Denies current suicidal ideation. Reports compliance with previously prescribed coping strategies but notes they have been less effective recently.
                      </p>
                    </div>

                    {/* OBJECTIVE */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">OBJECTIVE</h4>
                      <p className="leading-relaxed">
                        Patient appeared anxious but engaged throughout session. Good eye contact maintained. Speech was coherent and goal-directed. Thought process was logical and organized. Mood reported as "stressed" with anxious affect noted. No evidence of psychosis. Insight and judgment appear intact.
                      </p>
                    </div>

                    {/* ASSESSMENT */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">ASSESSMENT</h4>
                      <p className="leading-relaxed">
                        Generalized Anxiety Disorder (F41.1) - Patient experiencing acute exacerbation of anxiety symptoms in context of work stressors. Sleep disturbance secondary to anxiety. Patient demonstrates good insight and engagement with treatment. Responding well to cognitive-behavioral interventions overall, though requires additional support during current stressor period.
                      </p>
                    </div>

                    {/* PLAN */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">PLAN</h4>
                      <p className="leading-relaxed">
                        Continue weekly individual psychotherapy sessions focusing on anxiety management and stress reduction. Reviewed and reinforced sleep hygiene techniques. Introduced progressive muscle relaxation exercise for bedtime routine. Patient to practice daily and report back next session. Will monitor sleep patterns and anxiety levels. Consider medication consultation if symptoms persist or worsen. Follow up in one week.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                      View in SuperNote
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Diagnosis Details */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Diagnosis Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">F33.1 - Major Depressive Disorder, Recurrent, Moderate</p>
                          <p className="text-sm text-gray-600 mt-1">Clinical context: Patient has history of MDD, currently in partial remission with ongoing therapy and medication management.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">F41.1 - Generalized Anxiety Disorder</p>
                          <p className="text-sm text-gray-600 mt-1">Clinical context: Primary presenting concern, experiencing acute exacerbation in context of work-related stressors.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Documents</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">PCP Referral - Dr. Jennifer Smith</p>
                          <p className="text-xs text-gray-500">Jan 15, 2025</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View PDF
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Treatment Plan</p>
                          <p className="text-xs text-gray-500">Updated Dec 20, 2024</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Initial Assessment</p>
                          <p className="text-xs text-gray-500">Dec 1, 2024</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View
                      </button>
                    </div>
                  </div>
                </div>

                {/* View Full Chart in EHR - Bottom CTA */}
                <div className="pt-4">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    View Full Patient Chart in EHR
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Submission */}
            {activeDetailTab === 'submission' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Last synced with EHR: 2 min ago</p>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Refresh from EHR
                  </button>
                </div>

                {selectedClaim.stage !== 'submitted' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Claim Not Yet Submitted</p>
                        <p className="text-xs text-gray-500">Ready to submit via EHR</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">Codes validated</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">Authorization verified</span>
                      </div>
                      {selectedClaim.approvedBy && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">Changes applied</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {selectedClaim.approvedBy && (
                        <button className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                          Push Changes to EHR
                        </button>
                      )}
                      <button className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                        Submit via EHR
                      </button>
                    </div>
                  </div>
                )}

                {selectedClaim.stage === 'submitted' && selectedClaim.status === 'In transit' && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Submission In Transit</p>
                        <p className="text-xs text-gray-500">Awaiting acknowledgment from clearinghouse</p>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Submitted</span>
                        <span className="text-gray-900">{selectedClaim.submittedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Via</span>
                        <span className="text-gray-900">EHR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Clearinghouse</span>
                        <span className="text-gray-900">{selectedClaim.clearinghouse}</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                      View in EHR
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                )}

                {selectedClaim.stage === 'submitted' && selectedClaim.status === 'Accepted' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Claim Accepted</p>
                        <p className="text-xs text-gray-500">Forwarded to payer for adjudication</p>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-lg p-4 space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Accepted</span>
                        <span className="text-gray-900">{selectedClaim.acceptedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Submitted via</span>
                        <span className="text-gray-900">EHR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Clearinghouse</span>
                        <span className="text-gray-900">{selectedClaim.clearinghouse}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <button className="w-full py-2 px-3 text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download 999 Acknowledgment
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button className="w-full py-2 px-3 text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download 837 File
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs text-blue-900 font-medium">Next Step</p>
                      <p className="text-xs text-blue-700 mt-1">Track payment in AR module →</p>
                    </div>
                  </div>
                )}

                {selectedClaim.stage === 'submitted' && selectedClaim.status === 'Rejected' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Claim Rejected</p>
                        <p className="text-xs text-gray-500">Requires correction and resubmission</p>
                      </div>
                    </div>

                    <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-red-900 mb-2">Error {selectedClaim.rejectionCode}</p>
                      <p className="text-sm text-red-800 mb-3">{selectedClaim.rejectionReason}</p>
                      
                      <div className="text-xs text-red-700 space-y-1 mb-3">
                        <p>Clearinghouse: {selectedClaim.clearinghouse} (via EHR)</p>
                        <p>Rejected: {selectedClaim.rejectedAt}</p>
                      </div>

                      <div className="bg-white border border-red-200 rounded p-3">
                        <p className="text-xs font-medium text-gray-900 mb-2">Suggested Fix:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                          <li>Verify secondary insurance information</li>
                          <li>Add coordination of benefits details</li>
                          <li>Check boxes 9-9d in CMS 1500</li>
                        </ul>
                      </div>
                    </div>

                    {selectedClaim.isResubmission && (
                      <div className="border border-gray-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Submission History</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Attempt 2 - Rejected (Current)</span>
                            <span className="text-gray-500">{selectedClaim.rejectedAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Attempt 1 - Rejected</span>
                            <span className="text-gray-500">Dec 23, 2:15 PM</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <button className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                        Correct & Resubmit
                      </button>
                      <button className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        Download Rejection Report
                      </button>
                      <button className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                        View in EHR
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Activity Timeline */}
            {activeDetailTab === 'activity' && (
              <div className="p-6">
                <div className="space-y-6">
                  {selectedClaim.stage === 'submitted' && selectedClaim.status === 'Accepted' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">Claim Accepted</p>
                          <span className="text-xs text-gray-400">{selectedClaim.acceptedAt}</span>
                        </div>
                        <p className="text-sm text-gray-600">Accepted by {selectedClaim.clearinghouse}</p>
                        <p className="text-xs text-gray-500 mt-1">999 ACK received</p>
                      </div>
                    </div>
                  )}

                  {selectedClaim.submittedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">Claim Submitted</p>
                          <span className="text-xs text-gray-400">{selectedClaim.submittedAt}</span>
                        </div>
                        <p className="text-sm text-gray-600">Submitted via EHR to {selectedClaim.clearinghouse}</p>
                      </div>
                    </div>
                  )}

                  {selectedClaim.approvedBy && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">Changes Approved</p>
                          <span className="text-xs text-gray-400">{selectedClaim.approvedAt}</span>
                        </div>
                        <p className="text-sm text-gray-600">{selectedClaim.approvedBy} approved AI suggestions</p>
                        {selectedClaim.aiSuggestions && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">View Details →</button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedClaim.aiSuggestions && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                          </svg>
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">AI Review Complete</p>
                          <span className="text-xs text-gray-400">2:34 PM</span>
                        </div>
                        <p className="text-sm text-gray-600">Analyzed claim and identified {selectedClaim.aiSuggestions.length} suggestions</p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-0.5 list-disc list-inside">
                          {selectedClaim.aiSuggestions.slice(0, 3).map((s, i) => (
                            <li key={i}>
                              {s.type === 'cpt' && 'CPT code change recommended'}
                              {s.type === 'modifier' && 'Missing modifier identified'}
                              {s.type === 'icd10' && 'ICD-10 specificity improvement'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">AI Review Started</p>
                        <span className="text-xs text-gray-400">2:28 PM</span>
                      </div>
                      <p className="text-sm text-gray-600">Analyzing codes, modifiers, and documentation</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">Claim Received</p>
                        <span className="text-xs text-gray-400">2:27 PM</span>
                      </div>
                      <p className="text-sm text-gray-600">Imported from EHR</p>
                      <p className="text-xs text-gray-500 mt-1">DOS: {selectedClaim.serviceDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    Export Timeline
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">Powered by Supa</p>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ClaimsModule;
