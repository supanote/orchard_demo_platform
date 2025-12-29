import React from 'react';
import { useClaims } from '../ClaimsProvider';
import { findStage, formatCurrency } from '../utils';
import type { Claim } from '../types';

export const WorkflowTab: React.FC = () => {
  const {
    data: { claims, stages },
    state: { workflowView, selectedClaims, expandedRows, isSyncingFromEhr },
    actions: {
      setWorkflowView,
      toggleClaimSelection,
      toggleAllClaims,
      clearSelectedClaims,
      toggleRowExpansion,
      setSelectedClaim,
      syncFromEhr,
    },
  } = useClaims();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
                  onClick={clearSelectedClaims}
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={syncFromEhr}
              disabled={isSyncingFromEhr}
              className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSyncingFromEhr && (
                <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" aria-hidden />
              )}
              {isSyncingFromEhr ? 'Syncing…' : 'Sync from EHR'}
            </button>
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

      {workflowView === 'kanban' && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => {
              const stageClaims = claims.filter((claim) => claim.stage === stage.id);
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
                    {stageClaims.map((claim) => (
                      <KanbanCard key={claim.id} claim={claim} onSelect={() => setSelectedClaim(claim)} />
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
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white">
              {claims.map((claim) => (
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(claim.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{claim.provider}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{claim.facility}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          claim.mode === 'Telehealth' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {claim.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{claim.cpt.join(', ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {claim.modifiers.length > 0 ? claim.modifiers.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{claim.icd10.join(', ')}</td>
                    <td className="px-4 py-3">
                      <StageBadge stageId={claim.stage} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusCell claim={claim} expanded={expandedRows.includes(claim.id)} onToggle={() => toggleRowExpansion(claim.id)} />
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

                  {expandedRows.includes(claim.id) && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={12} className="px-4 py-4">
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
                              <p className="text-sm font-medium text-red-900 mb-2">
                                Error {claim.rejectionCode}: {claim.rejectionReason}
                              </p>
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
  );
};

const StageBadge: React.FC<{ stageId: Claim['stage'] }> = ({ stageId }) => {
  const {
    data: { stages },
  } = useClaims();
  const stage = findStage(stages, stageId);

  if (!stage) return null;

  const styles =
    stage.id === 'new'
      ? 'bg-gray-100 text-gray-700'
      : stage.id === 'ai-review'
      ? 'bg-blue-50 text-blue-700'
      : stage.id === 'pending'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {stage.name}
    </span>
  );
};

const StatusCell: React.FC<{ claim: Claim; expanded: boolean; onToggle: () => void }> = ({
  claim,
  expanded,
  onToggle,
}) => {
  if (claim.isResubmission) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-700">
        ⚠️ Attempt {claim.resubmissionAttempt}
      </span>
    );
  }

  if (claim.stage === 'pending' && claim.aiSuggestions && !claim.approvedBy) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium hover:bg-amber-100"
      >
        {claim.aiSuggestions.length} AI suggestion{claim.aiSuggestions.length > 1 ? 's' : ''}
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    );
  }

  if (claim.stage === 'pending' && claim.approvedBy) {
    return <span className="text-xs text-emerald-600">Changes Applied</span>;
  }

  if (claim.stage === 'submitted' && claim.status === 'In transit') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        In transit
      </span>
    );
  }

  if (claim.stage === 'submitted' && claim.status === 'Accepted') {
    return <span className="text-xs text-emerald-600">✓ Accepted</span>;
  }

  if (claim.stage === 'submitted' && claim.status === 'Rejected') {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
      >
        ⚠️ Rejected - {claim.rejectionCode}
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    );
  }

  if (claim.stage === 'ai-review') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        {claim.status}
      </span>
    );
  }

  if (claim.stage === 'new' && claim.status?.toLowerCase().includes('sync')) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
        <div className="w-1.5 h-1.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        {claim.status}
      </span>
    );
  }

  return <span className="text-xs text-gray-500">{claim.status}</span>;
};

const KanbanCard: React.FC<{ claim: Claim; onSelect: () => void }> = ({ claim, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all min-h-[180px] flex flex-col"
  >
    <div className="flex items-start justify-between mb-2">
      <p className="text-sm font-medium text-gray-900">{claim.patient}</p>
      <span className="text-sm font-semibold text-gray-900">{formatCurrency(claim.amount)}</span>
    </div>

    <div className="space-y-1 mb-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">DOS {claim.serviceDate}</span>
        <span className="text-gray-900">{claim.payer}</span>
      </div>
      <div className="text-xs text-gray-500">CPT {claim.cpt[0]}</div>
    </div>

    {claim.isResubmission && (
      <div className="mb-2 flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-700">
        ⚠️ Attempt {claim.resubmissionAttempt}
      </div>
    )}

    <div className="mb-2 flex-grow">
      {claim.stage === 'pending' && claim.aiSuggestions && !claim.approvedBy && (
        <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
          {claim.aiSuggestions.length} AI suggestion{claim.aiSuggestions.length > 1 ? 's' : ''}
        </span>
      )}
      {claim.stage === 'pending' && claim.approvedBy && (
        <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Changes Applied</span>
      )}
      {claim.stage === 'submitted' && claim.status === 'In transit' && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span className="font-medium">Rejected - {claim.rejectionCode}</span>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded hover:bg-gray-50"
          >
            Correct & Resubmit
          </button>
        </div>
      )}
      {claim.stage === 'ai-review' && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span>{claim.status}</span>
        </div>
      )}
      {claim.stage === 'new' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-1.5 h-1.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>{claim.status}</span>
        </div>
      )}
    </div>

    <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 mt-auto">{claim.timeInStage} in stage</div>
  </div>
);

