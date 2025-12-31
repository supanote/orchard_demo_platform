import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import Icon, { type IconName } from './components/Icon';

const ControlTowerDashboard = () => {
  const [timePeriod, setTimePeriod] = useState('Last 7 days');
  const [selectedPayer, setSelectedPayer] = useState('All Payers');
  const [selectedFacility, setSelectedFacility] = useState('All Facilities');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(true);
  const [activityFilter, setActivityFilter] = useState('All Modules');
  
  // Dropdown states
  const [timePeriodOpen, setTimePeriodOpen] = useState(false);
  const [payerOpen, setPayerOpen] = useState(false);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [activityFilterOpen, setActivityFilterOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setTimePeriodOpen(false);
      setPayerOpen(false);
      setFacilityOpen(false);
      setActivityFilterOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const timePeriodOptions = ['Last 7 days', 'Last 30 days', 'This month', 'Last month', 'Custom range'];
  const payerOptions = ['All Payers', 'Aetna', 'Blue Cross Blue Shield', 'United Healthcare', 'Cigna', 'Medicare', 'Medicaid'];
  const facilityOptions = ['All Facilities', 'Main Office', 'Downtown Clinic', 'North Campus', 'Telehealth'];
  const activityFilterOptions = ['All Modules', 'Intake', 'Benefits', 'Claims', 'Payments', 'Denials'];

  type MetricTrend = 'up' | 'down';
  type Metric = {
    label: string;
    value: string;
    sublabel: string;
    comparison: string;
    trend: MetricTrend;
    progressPercent?: number;
  };

  type ModuleCard = {
    id: string;
    name: string;
    icon: IconName;
    aiConfidence: number;
    confidenceTrend: MetricTrend;
    confidenceChange: string;
    metrics: Metric[];
  };

  const moduleCards: ModuleCard[] = [
    {
      id: 'intake',
      name: 'Intake',
      icon: 'user-plus',
      aiConfidence: 96,
      confidenceTrend: 'up',
      confidenceChange: '+3%',
      metrics: [
        {
          label: 'Contacted',
          value: '1,000',
          sublabel: '95% of all inbound',
          comparison: '+12%',
          trend: 'up',
        },
        {
          label: 'Booked',
          value: '420',
          sublabel: '40% conversion',
          comparison: '+8%',
          trend: 'up',
          progressPercent: 40,
        },
      ],
    },
    {
      id: 'benefits',
      name: 'Benefits',
      icon: 'shield-check',
      aiConfidence: 98,
      confidenceTrend: 'up',
      confidenceChange: '+2%',
      metrics: [
        {
          label: 'Verifications Completed',
          value: '1,247',
          sublabel: 'This month',
          comparison: '+15%',
          trend: 'up',
        },
        {
          label: 'Active Coverage Rate',
          value: '94%',
          sublabel: 'In-network, no issues',
          comparison: '+3%',
          trend: 'up',
        },
      ],
    },
    {
      id: 'claims',
      name: 'Claims',
      icon: 'document',
      aiConfidence: 99,
      confidenceTrend: 'up',
      confidenceChange: '+1%',
      metrics: [
        {
          label: 'Timely Filing',
          value: '98%',
          sublabel: 'On-time submission',
          comparison: '+2%',
          trend: 'up',
        },
        {
          label: 'Clean Claims Rate',
          value: '99%',
          sublabel: 'First-pass accuracy',
          comparison: '+1%',
          trend: 'up',
        },
      ],
    },
    {
      id: 'payments',
      name: 'Payment Posting',
      icon: 'credit-card',
      aiConfidence: 97,
      confidenceTrend: 'up',
      confidenceChange: '+4%',
      metrics: [
        {
          label: 'Posted This Month',
          value: '$847K',
          sublabel: 'Across all payers',
          comparison: '+18%',
          trend: 'up',
        },
        {
          label: 'Auto-Match Rate',
          value: '96%',
          sublabel: 'No manual intervention',
          comparison: '+5%',
          trend: 'up',
        },
      ],
    },
    {
      id: 'denials',
      name: 'Denials & AR',
      icon: 'alert',
      aiConfidence: 94,
      confidenceTrend: 'down',
      confidenceChange: '-1%',
      metrics: [
        {
          label: 'Outstanding AR',
          value: '$172K',
          sublabel: 'Across all payers',
          comparison: '-8%',
          trend: 'down',
        },
        {
          label: 'Denial Rate',
          value: '8%',
          sublabel: '227 claims this month',
          comparison: '-2%',
          trend: 'down',
        },
      ],
    },
  ];

  const aiAgents = [
    { id: 'intake', name: 'Intake', status: 'active', current: 'Processing Sarah Chen', queue: 8, processed: 47, success: 94 },
    { id: 'benefits', name: 'Benefits Verification', status: 'active', current: 'Checking benefits for James Liu', queue: 3, processed: 38, success: 97 },
    { id: 'claims', name: 'Claims', status: 'active', current: 'Reviewing charges', queue: 12, processed: 124, success: 99 },
    { id: 'payments', name: 'Payment Posting', status: 'active', current: 'Auto-matching payment', queue: 5, processed: 89, success: 96 },
    { id: 'denials', name: 'Denials & AR', status: 'idle', current: 'Waiting for new tasks', queue: 0, processed: 15, success: 92 },
  ];

  const activityFeed = [
    { id: 1, module: 'Intake', agent: 'Supa Intake', action: 'extracted patient info', detail: 'Fax #4821', time: 'Just now', status: 'success' },
    { id: 2, module: 'Intake', agent: 'Supa Intake', action: 'initiated outbound call', detail: 'James Liu', time: '30s ago', status: 'in-progress' },
    { id: 3, module: 'Benefits', agent: 'Supa Verify', action: 'verified benefits', detail: 'Thomas Anderson', time: '1m ago', status: 'success' },
    { id: 4, module: 'Intake', agent: 'Supa Intake', action: 'left voicemail', detail: 'Amanda Foster', time: '2m ago', status: 'success' },
    { id: 5, module: 'Claims', agent: 'Supa Claims', action: 'reviewed charge', detail: 'Sarah Chen', time: '3m ago', status: 'success' },
    { id: 6, module: 'Benefits', agent: 'Supa Verify', action: 'detected carve-out', detail: 'Lisa Martinez', time: '4m ago', status: 'warning' },
    { id: 7, module: 'Payments', agent: 'Supa Pay', action: 'auto-matched payment', detail: 'Claim #84721', time: '5m ago', status: 'success' },
    { id: 8, module: 'Denials', agent: 'Supa AR', action: 'working denial', detail: 'Robert Kim', time: '6m ago', status: 'in-progress' },
  ];

  const filteredActivity = activityFilter === 'All Modules' 
    ? activityFeed 
    : activityFeed.filter(item => item.module === activityFilter);

  type DropdownProps = {
    label: string;
    value: string;
    options: string[];
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    onSelect: (value: string) => void;
  };

  const Dropdown = ({ label, value, options, isOpen, setIsOpen, onSelect }: DropdownProps) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
      >
        <span className="text-slate-500 font-medium">{label}:</span>
        <span className="font-medium">{value}</span>
        <Icon name="chevron-down" className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          {options.map((option: string) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                value === option ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Control Tower</h1>
          <div className="flex items-center gap-4">
            {/* System Health Indicator */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors group"
              title="4 agents active • 28 items in queue • 96% avg confidence"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              <span className="text-xs font-medium text-emerald-700">AI Systems Operational</span>
            </div>

            {/* EHR Sync Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
              <Icon name="sync" className="w-4 h-4" />
              <span>EHR Sync</span>
            </button>

            <span className="text-sm text-slate-500 font-medium">Orchard Mental Health</span>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dropdown
              label="Time Period"
              value={timePeriod}
              options={timePeriodOptions}
              isOpen={timePeriodOpen}
              setIsOpen={setTimePeriodOpen}
              onSelect={setTimePeriod}
            />

            <Dropdown
              label="Payer"
              value={selectedPayer}
              options={payerOptions}
              isOpen={payerOpen}
              setIsOpen={setPayerOpen}
              onSelect={setSelectedPayer}
            />

            <Dropdown
              label="Facility"
              value={selectedFacility}
              options={facilityOptions}
              isOpen={facilityOpen}
              setIsOpen={setFacilityOpen}
              onSelect={setSelectedFacility}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients, claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
              />
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Comparison Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-slate-600 font-medium">Compare to Previous Period</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-slate-900 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
              </div>
            </label>

            {/* Copilot Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm hover:shadow">
              <Icon name="sparkles" className="w-4 h-4" />
              <span>Tell Supa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Module Cards - Single Row */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-5">
            {moduleCards.map((card) => {
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-slate-900 transition-colors">
                        <Icon name={card.icon} className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{card.name}</h3>
                    </div>
                  </div>

                  {/* AI Confidence Badge with Trend */}
                  <div className="mb-4">
                    <div
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded cursor-help"
                      title={`Improved ${card.confidenceChange} this week from user feedback`}
                    >
                      <span>AI: {card.aiConfidence}%</span>
                      {card.confidenceTrend === 'up' && <Icon name="arrow-up" className="w-3 h-3 text-emerald-600" />}
                      {card.confidenceTrend === 'down' && <Icon name="arrow-down" className="w-3 h-3 text-slate-400" />}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    {card.metrics.map((metric, idx) => (
                      <div key={idx}>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{metric.label}</p>
                        <p className="text-2xl font-semibold text-slate-900 mb-1">{metric.value}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-slate-600">{metric.sublabel}</p>
                          {showComparison && (
                            <div className="flex items-center gap-0.5">
                              <Icon
                                name={metric.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                                className={`w-3 h-3 ${metric.trend === 'up' ? 'text-emerald-600' : 'text-slate-600'}`}
                              />
                              <span
                                className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-slate-600'}`}
                              >
                                {metric.comparison}
                              </span>
                            </div>
                          )}
                        </div>
                        {metric.progressPercent && (
                          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full" style={{ width: `${metric.progressPercent}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Agents Status Bar */}
        <div className="mb-6 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">AI Agents</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
              <span className="text-xs text-slate-500 font-medium">Live</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {aiAgents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.status === 'active' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-sm font-semibold text-slate-900">{agent.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">{agent.queue} queue</span>
                </div>
                <p className="text-xs text-slate-600 mb-2 truncate">{agent.current}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{agent.processed} today</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">{agent.success}% success</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Feed Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Live Activity</h3>

                {/* Module Filter */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setActivityFilterOpen(!activityFilterOpen)}
                    className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium"
                  >
                    <span>{activityFilter}</span>
                    <Icon name="chevron-down" className={`w-3 h-3 text-slate-400 transition-transform ${activityFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {activityFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                      {activityFilterOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setActivityFilter(option);
                            setActivityFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${
                            activityFilter === option ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Indicator */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
                <span className="text-xs text-slate-500 font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredActivity.map((item) => (
              <div key={item.id} className="px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'success' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{item.agent}</span>
                      <span className="text-slate-600"> {item.action}</span>
                      <span className="text-slate-500"> - {item.detail}</span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                </div>
              </div>
            ))}

            {filteredActivity.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">No activity in this module</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTowerDashboard;
