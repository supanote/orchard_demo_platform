import React from 'react';
import { useClaims } from '../ClaimsProvider';
import { formatCurrency } from '../utils';

export const SummaryTab: React.FC = () => {
  const {
    data: { tasks, claims },
    state: { selectedTimePeriod },
    actions: { setSelectedTimePeriod, setActiveTab, setSelectedClaim },
  } = useClaims();

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div />
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
            <div className="h-4 w-px bg-gray-200" />
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
            <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Clear Filters</button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{selectedTimePeriod}</p>
          <button className="text-xs text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Total Claims</p>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-gray-900">147</p>
              <p className="text-sm text-gray-600">{formatCurrency(22050)}</p>
            </div>
            <p className="text-xs text-emerald-600 mt-2">↑ 12% vs last week</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Clean Claims Rate</p>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-2xl font-semibold text-gray-900">96%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }} />
            </div>
            <p className="text-xs text-gray-500">4% rejection rate</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Timely Filing Rate</p>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-2xl font-semibold text-gray-900">98%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }} />
            </div>
            <p className="text-xs text-emerald-600">↑ 3% vs last week</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Avg. Processing Time</p>
            <div className="flex items-baseline gap-1 mb-2">
              <p className="text-2xl font-semibold text-gray-900">2.1</p>
              <p className="text-sm text-gray-500">h</p>
            </div>
            <p className="text-xs text-emerald-600 mt-2">↓ 18% faster</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Claims Enhanced by AI</p>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-gray-900">38%</p>
              <p className="text-sm text-gray-600">{formatCurrency(3450)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Revenue impact</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-900">Top Rejection Reasons</h3>
                <p className="text-xs text-gray-500">{selectedTimePeriod}</p>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-6">
                {[
                  { label: 'COB Issues', count: 12, width: '100%' },
                  { label: 'Invalid Modifiers', count: 9, width: '75%' },
                  { label: 'Missing Authorization', count: 6, width: '50%' },
                  { label: 'Coding Errors', count: 3, width: '25%' },
                  { label: 'Documentation Issues', count: 2, width: '17%' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-40 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full h-10 flex items-center px-4" style={{ width: item.width }}>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                {tasks.slice(0, 5).map((task) => {
                  const claim = claims.find((c) => c.id === task.claimId) || null;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedClaim(claim)}
                      className="flex items-center justify-between py-3 px-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                            task.priority === 'P1' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{task.patient}</p>
                          <p className="text-xs text-gray-500 truncate">{task.reason}</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm flex-shrink-0 ml-4 ${task.slaBreached ? 'text-red-600 font-medium' : 'text-gray-500'}`}
                      >
                        {task.waiting}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-[400px] flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex-shrink-0">AI Agents</h3>
              <div className="space-y-3 overflow-auto flex-1">
                {[
                  {
                    title: 'Claims Coordinator',
                    subtitle: 'Orchestrating claim #C-2847',
                    metrics: ['147 today', '98% success'],
                  },
                  {
                    title: 'Charge Review',
                    subtitle: 'Analyzing Amanda Foster',
                    metrics: ['56 today', '94% accuracy'],
                  },
                  {
                    title: 'Claims Filer',
                    subtitle: 'Submitting batch CH-001',
                    metrics: ['23 today', '96% clean'],
                  },
                ].map((agent) => (
                  <div key={agent.title} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{agent.title}</p>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{agent.subtitle}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-900 font-medium">{agent.metrics[0]}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-emerald-600">{agent.metrics[1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 h-[340px] flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-900">Live Activity</h3>
                <button className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </button>
              </div>

              <div className="flex-1 overflow-auto space-y-3">
                {[
                  { actor: 'Charge Review', detail: 'identified 3 suggestions', subject: 'Amanda Foster', time: 'Just now' },
                  { actor: 'Claims Filer', detail: 'submitted claim', subject: 'Claim #C-2845', time: '45s ago' },
                  { actor: 'Claims Coordinator', detail: 'routed to AI review', subject: 'Lisa Martinez', time: '1m ago' },
                  { actor: 'Charge Review', detail: 'validated CPT codes', subject: 'Robert Kim', time: '2m ago' },
                  { actor: 'Claims Filer', detail: 'received 999 ACK', subject: 'Claim #C-2841', time: '3m ago' },
                  { actor: 'Claims Coordinator', detail: 'approved changes', subject: 'Sarah Chen', time: '4m ago' },
                  { actor: 'Charge Review', detail: 'flagged modifier issue', subject: 'James Liu', time: '5m ago' },
                  { actor: 'Claims Filer', detail: 'batch submitted', subject: 'Batch CH-001', time: '6m ago' },
                ].map((activity) => (
                  <div key={`${activity.actor}-${activity.subject}`} className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="text-xs flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.actor}</span> {activity.detail}
                      </p>
                      <p className="text-gray-500">
                        {activity.subject} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

