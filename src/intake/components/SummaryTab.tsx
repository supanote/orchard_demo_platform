import React, { useState, useEffect } from 'react';
import type { Patient, Task, Agent, ActivityItem } from '../types';

// Pool of possible agent activities for dynamic updates
const activityPool = [
  { agent: 'Supa Intake', action: 'extracted patient info', patients: ['Fax #4821', 'Fax #4822', 'Fax #4823', 'Email #1892'] },
  { agent: 'Supa Intake', action: 'initiated outbound call', patients: ['James Liu', 'Sarah Chen', 'Michael Park', 'Lisa Wong'] },
  { agent: 'Supa Verify', action: 'verified benefits', patients: ['Thomas Anderson', 'Rachel Green', 'Kevin Wright', 'Maria Garcia'] },
  { agent: 'Supa Intake', action: 'left voicemail', patients: ['Amanda Foster', 'Robert Kim', 'Jennifer Park', 'David Brown'] },
  { agent: 'Supa Verify', action: 'confirmed coverage', patients: ['Sophie Turner', 'Chris Evans', 'Daniel Lee', 'Emily Watson'] },
  { agent: 'Supa Intake', action: 'scheduled appointment', patients: ['Nancy Drew', 'Peter Parker', 'Mary Jane', 'Bruce Banner'] },
  { agent: 'Supa Intake', action: 'sent intake forms', patients: ['Tony Stark', 'Steve Rogers', 'Natasha Romanoff', 'Clint Barton'] },
  { agent: 'Supa Verify', action: 'checked eligibility', patients: ['Diana Prince', 'Clark Kent', 'Barry Allen', 'Arthur Curry'] },
  { agent: 'Supa Intake', action: 'completed data extraction', patients: ['Referral #2891', 'Referral #2892', 'Form #1023', 'Form #1024'] },
  { agent: 'Supa Verify', action: 'submitted prior auth', patients: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sam Wilson'] },
];

interface SummaryTabProps {
  summaryTimePeriod: string;
  setSummaryTimePeriod: (v: string) => void;
  summarySource: string;
  setSummarySource: (v: string) => void;
  summaryPayer: string;
  setSummaryPayer: (v: string) => void;
  compareToPreview: boolean;
  setCompareToPreview: (v: boolean) => void;
  animatedCounts: { total: number; booked: number; inProgress: number; avgTime: number; escalated: number };
  tasks: Task[];
  agents: Agent[];
  activityFeed: ActivityItem[];
  patients: Patient[];
  setActiveTab: (tab: string) => void;
  openPatientDetail: (patient: Patient, mode: string) => void;
}

const SummaryTab: React.FC<SummaryTabProps> = ({
  summaryTimePeriod, setSummaryTimePeriod,
  summarySource, setSummarySource,
  summaryPayer, setSummaryPayer,
  compareToPreview, setCompareToPreview,
  animatedCounts, tasks, agents, activityFeed, patients,
  setActiveTab, openPatientDetail
}) => {
  // Dynamic activity feed state
  const [liveActivities, setLiveActivities] = useState<ActivityItem[]>(activityFeed);
  const [nextId, setNextId] = useState(activityFeed.length + 1);

  // Add new activities periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomActivity = activityPool[Math.floor(Math.random() * activityPool.length)];
      const randomPatient = randomActivity.patients[Math.floor(Math.random() * randomActivity.patients.length)];
      
      const newActivity: ActivityItem = {
        id: nextId,
        agent: randomActivity.agent,
        action: randomActivity.action,
        patient: randomPatient,
        time: 'Just now',
      };

      setLiveActivities(prev => {
        // Update times for existing activities
        const updated = prev.map((item, index) => ({
          ...item,
          time: index === 0 ? '5s ago' : 
                index === 1 ? '15s ago' : 
                index === 2 ? '30s ago' : 
                index === 3 ? '1m ago' : 
                `${index + 1}m ago`
        }));
        // Add new activity at the beginning, keep only last 6
        return [newActivity, ...updated].slice(0, 6);
      });
      setNextId(prev => prev + 1);
    }, 4000); // New activity every 4 seconds

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="p-6">
      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Time Period:</span>
            <select value={summaryTimePeriod} onChange={(e) => setSummaryTimePeriod(e.target.value)} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Source:</span>
            <select value={summarySource} onChange={(e) => setSummarySource(e.target.value)} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700">
              <option value="all">All Sources</option>
              <option value="fax">Fax</option>
              <option value="call">Phone</option>
              <option value="email">Email</option>
              <option value="form">Web Form</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Payer:</span>
            <select value={summaryPayer} onChange={(e) => setSummaryPayer(e.target.value)} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700">
              <option value="all">All Payers</option>
              <option value="commercial">Commercial</option>
              <option value="medicaid">Medicaid</option>
              <option value="medicare">Medicare</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <span>Compare to Previous Period</span>
          <button onClick={() => setCompareToPreview(!compareToPreview)} className={`relative w-10 h-5 rounded-full transition-colors ${compareToPreview ? 'bg-gray-900' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${compareToPreview ? 'translate-x-5' : ''}`}></span>
          </button>
        </label>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <span className="text-sm text-gray-500">Total Inbound</span>
          <p className="text-4xl font-bold text-gray-900 mt-2">1,053</p>
          <p className="text-sm text-gray-500 mt-2">+12% vs prev period</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Booked</span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">40% conversion</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mt-2">420</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-400 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <span className="text-sm text-gray-500">Avg. Time to Book</span>
          <p className="text-4xl font-bold text-gray-900 mt-2">2.3<span className="text-2xl font-normal text-gray-400">h</span></p>
          <p className="text-sm text-gray-500 mt-2">18% faster than prev</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <span className="text-sm text-gray-500">Escalated</span>
          <p className="text-4xl font-bold text-gray-900 mt-2">{animatedCounts.escalated}</p>
          <button onClick={() => setActiveTab('tasks')} className="text-sm text-gray-500 mt-2 hover:text-gray-700">View tasks →</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Funnel & Drop-off */}
        <div className="col-span-2 space-y-6">
          {/* Drop-off Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Drop-off Analysis</h3>
            <p className="text-xs text-gray-500 mb-5">Identify where patients are leaving the funnel</p>
            <div className="grid grid-cols-2 gap-8">
              {/* Conversion Funnel */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Conversion Funnel</h4>
                <div className="space-y-1">
                  {[
                    { stage: 'Received', count: 1053, pct: 100 },
                    { stage: 'Contacted', count: 892, pct: 85 },
                    { stage: 'Matched', count: 567, pct: 54 },
                    { stage: 'Booked', count: 420, pct: 40 },
                  ].map((item, index) => (
                    <div key={item.stage}>
                      {index > 0 && <div className="flex justify-center py-0.5"><svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div>}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20">{item.stage}</span>
                        <div className="flex-1 h-7 bg-gray-50 rounded overflow-hidden">
                          <div className="h-full bg-gray-300 rounded flex items-center px-3" style={{ width: `${item.pct}%` }}>
                            <span className="text-xs font-semibold text-gray-700">{item.count.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop-off Reasons */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Top Drop-off Reasons</h4>
                <div className="space-y-3">
                  {[
                    { reason: 'Unable to contact patient', count: 161, pct: 38 },
                    { reason: 'Payer not accepted', count: 98, pct: 23 },
                    { reason: 'No provider availability', count: 72, pct: 17 },
                    { reason: 'Patient declined', count: 54, pct: 13 },
                    { reason: 'Verification failed', count: 38, pct: 9 },
                  ].map((item) => (
                    <div key={item.reason}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.reason}</span>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-16">{item.pct}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Channel Performance</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Conversion</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                  <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { source: 'Provider Referral', volume: 320, conversion: '55%', time: '1.8h', trend: '+5%', up: true },
                  { source: 'Web Self-Referral', volume: 280, conversion: '45%', time: '2.1h', trend: '-2%', up: false },
                  { source: 'Insurance Referral', volume: 210, conversion: '38%', time: '2.8h', trend: '+1%', up: true },
                  { source: 'Phone', volume: 150, conversion: '32%', time: '1.5h', trend: '-3%', up: false },
                  { source: 'Fax', volume: 93, conversion: '28%', time: '3.2h', trend: '+2%', up: true },
                ].map((row) => (
                  <tr key={row.source} className="border-b border-gray-50">
                    <td className="py-3 text-sm text-gray-900">{row.source}</td>
                    <td className="py-3 text-sm text-gray-600">{row.volume}</td>
                    <td className="py-3 text-sm text-gray-600">{row.conversion}</td>
                    <td className="py-3 text-sm text-gray-600">{row.time}</td>
                    <td className={`py-3 text-sm text-right font-medium ${row.up ? 'text-emerald-600' : 'text-red-500'}`}>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Needs Attention</h3>
              <button onClick={() => setActiveTab('tasks')} className="text-xs text-gray-500 hover:text-gray-700">View all →</button>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.slaStatus === 'breached' || t.priority === 'P1').slice(0, 4).map(task => (
                <div key={task.id} onClick={() => { const p = patients.find(x => x.id === task.patientId); if (p) openPatientDetail(p, 'panel'); }} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${task.priority === 'P1' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>{task.priority}</span>
                    <div><p className="text-sm font-medium text-gray-900">{task.patientName}</p><p className="text-xs text-gray-500">{task.reason}</p></div>
                  </div>
                  <div className="text-right"><p className={`text-xs font-medium ${task.slaStatus === 'breached' ? 'text-red-600' : 'text-gray-500'}`}>{task.waitingSince}</p>{task.slaStatus === 'breached' && <p className="text-xs text-red-600">SLA breached</p>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - SLAs, AI Agents, Activity */}
        <div className="space-y-6">
          {/* SLA Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">SLA Performance</h3>
            <div className="space-y-4">
              {[
                { metric: 'First Contact', target: '< 15 min', value: 92, status: 'good' },
                { metric: 'Benefits Verified', target: '< 4 hrs', value: 88, status: 'warning' },
                { metric: 'Appointment Scheduled', target: '< 6 hrs', value: 78, status: 'bad' },
              ].map((sla) => (
                <div key={sla.metric}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm text-gray-700">{sla.metric}</span>
                      <span className="text-xs text-gray-400 ml-2">{sla.target}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{sla.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gray-900" style={{ width: `${sla.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">AI Agents</h3>
            {agents.map(agent => (
              <div key={agent.id} className="p-4 bg-gray-50 rounded-lg mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{agent.name}</span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{agent.currentTask}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{agent.processed}</span> today</span>
                      <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{agent.successRate}%</span> success</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
            {/* Animated background pulse for "live" effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/50 to-emerald-50/0 animate-shimmer"></div>
            
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Live Activity</h3>
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                LIVE
              </span>
            </div>
            <div className="relative space-y-2 overflow-hidden">
              {liveActivities.map((a, index) => (
                <div 
                  key={a.id} 
                  className={`flex items-start gap-3 p-2 rounded-lg transition-all duration-700 ${
                    index === 0 
                      ? 'bg-emerald-50 border border-emerald-200 animate-slideIn shadow-sm' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{ 
                    opacity: index === 0 ? 1 : 1 - (index * 0.15),
                  }}
                >
                  <div className="relative mt-1 flex-shrink-0">
                    {index === 0 ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                        <div className="absolute -inset-1 w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                      </>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-0.5"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${index === 0 ? 'text-emerald-900' : 'text-gray-700'}`}>
                      <span className={`font-bold ${index === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>{a.agent}</span>{' '}
                      {a.action}
                    </p>
                    <p className={`text-xs ${index === 0 ? 'text-emerald-600' : 'text-gray-500'}`}>{a.patient} · {a.time}</p>
                  </div>
                  {index === 0 && (
                    <span className="flex-shrink-0 text-[10px] px-2 py-1 bg-emerald-500 text-white rounded-full font-bold animate-pulse shadow-lg shadow-emerald-500/30">
                      ● NOW
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Processing indicator - more prominent */}
            <div className="relative mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }}></span>
                  </div>
                  <span className="font-medium">Agents actively processing...</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold tabular-nums animate-pulse">
                  {Math.floor(Math.random() * 3) + 2} in queue
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;

