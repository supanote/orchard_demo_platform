import React from 'react';
import { useClaims } from '../ClaimsProvider';
import { formatCurrency } from '../utils';

export const TasksTab: React.FC = () => {
  const {
    data: { tasks, claims, teamMembers },
    state: { selectedTasks, assignDropdownOpen },
    actions: {
      toggleTaskSelection,
      toggleAllTasks,
      clearSelectedTasks,
      setAssignDropdownOpen,
      setSelectedClaim,
    },
  } = useClaims();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedTasks.length > 0 ? (
              <>
                <span className="text-sm text-gray-600">✓ {selectedTasks.length} selected</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Assign to:</span>
                  <select className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900">
                    <option value="">Select team member</option>
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={clearSelectedTasks}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <h2 className="text-base font-semibold text-gray-900">Action Required ({tasks.length})</h2>
            )}
          </div>

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
            {tasks.map((task) => {
              const claim = claims.find((c) => c.id === task.claimId) || null;
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
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(task.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.type === 'human-review'
                          ? 'bg-amber-50 text-amber-700'
                          : task.type === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : task.type === 'expert-review'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {task.type === 'human-review' && 'Human Review'}
                      {task.type === 'rejected' && 'Rejected'}
                      {task.type === 'expert-review' && 'Expert Review'}
                      {task.type === 'ready-submit' && 'Ready to Submit'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{task.stage}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{task.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        task.priority === 'P1' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
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
                            {teamMembers.map((member) => (
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
  );
};

