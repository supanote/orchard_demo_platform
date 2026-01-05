import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { claims as seedClaims, ehrSyncBatches, rules as seedRules, stages as seedStages, teamMembers } from './data';
import type { ActiveTab, ClaimsUIState, Claim, ClaimActivity, DetailTab, Rule, Task, WorkflowView } from './types';
import { toggleItem } from './utils';

type ClaimsAction =
  | { type: 'setActiveTab'; value: ActiveTab }
  | { type: 'setWorkflowView'; value: WorkflowView }
  | { type: 'toggleClaimSelection'; claimId: number }
  | { type: 'toggleAllClaims'; allIds: number[] }
  | { type: 'clearSelectedClaims' }
  | { type: 'toggleRowExpansion'; claimId: number }
  | { type: 'setSelectedClaim'; claim: Claim | null }
  | { type: 'updateSelectedClaim'; claim: Claim }
  | { type: 'setDetailPanelExpanded'; value: boolean }
  | { type: 'setActiveDetailTab'; value: DetailTab }
  | { type: 'setShowFullCMS1500'; value: boolean }
  | { type: 'setSelectedSuggestions'; value: number[] }
  | { type: 'toggleTaskSelection'; taskId: string }
  | { type: 'toggleAllTasks'; taskIds: string[] }
  | { type: 'clearSelectedTasks' }
  | { type: 'setAssignDropdownOpen'; value: string | null }
  | { type: 'setSelectedTimePeriod'; value: string }
  | { type: 'setFilter'; filter: 'payer' | 'provider' | 'serviceType' | 'location' | 'stage' | 'dateRange'; value: string }
  | { type: 'clearFilters' }
  | { type: 'startEhrSync' }
  | { type: 'finishEhrSync' };

const initialState: ClaimsUIState = {
  activeTab: 'workflow',
  selectedClaim: null,
  workflowView: 'kanban',
  expandedRows: [],
  selectedClaims: [],
  detailPanelExpanded: false,
  activeDetailTab: 'ai-review',
  showFullCMS1500: false,
  selectedSuggestions: [],
  selectedTasks: [],
  assignDropdownOpen: null,
  selectedTimePeriod: 'Last 7 days',
  isSyncingFromEhr: false,
  filters: {
    payer: 'All Payers',
    provider: 'All Providers',
    serviceType: 'All Service Types',
    location: 'All Locations',
    stage: 'All Stages',
    dateRange: 'All Dates',
  },
};

const claimsReducer = (state: ClaimsUIState, action: ClaimsAction): ClaimsUIState => {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTab: action.value };
    case 'setWorkflowView':
      return { ...state, workflowView: action.value };
    case 'toggleClaimSelection':
      return { ...state, selectedClaims: toggleItem(state.selectedClaims, action.claimId) };
    case 'toggleAllClaims': {
      const allIds = action.allIds;
      const isAllSelected = state.selectedClaims.length === allIds.length;
      return { ...state, selectedClaims: isAllSelected ? [] : allIds };
    }
    case 'clearSelectedClaims':
      return { ...state, selectedClaims: [] };
    case 'toggleRowExpansion':
      return { ...state, expandedRows: toggleItem(state.expandedRows, action.claimId) };
    case 'setSelectedClaim':
      return {
        ...state,
        selectedClaim: action.claim,
        activeDetailTab: action.claim?.stage === 'submitted' ? 'submission' : 'ai-review',
        selectedSuggestions: [],
        showFullCMS1500: false,
      };
    case 'updateSelectedClaim':
      return {
        ...state,
        selectedClaim: action.claim,
      };
    case 'setDetailPanelExpanded':
      return { ...state, detailPanelExpanded: action.value };
    case 'setActiveDetailTab':
      return { ...state, activeDetailTab: action.value };
    case 'setShowFullCMS1500':
      return { ...state, showFullCMS1500: action.value };
    case 'setSelectedSuggestions':
      return { ...state, selectedSuggestions: action.value };
    case 'toggleTaskSelection':
      return { ...state, selectedTasks: toggleItem(state.selectedTasks, action.taskId) };
    case 'toggleAllTasks': {
      const allIds = action.taskIds;
      const isAllSelected = state.selectedTasks.length === allIds.length;
      return { ...state, selectedTasks: isAllSelected ? [] : allIds };
    }
    case 'clearSelectedTasks':
      return { ...state, selectedTasks: [] };
    case 'setAssignDropdownOpen':
      return { ...state, assignDropdownOpen: action.value };
    case 'setSelectedTimePeriod':
      return { ...state, selectedTimePeriod: action.value };
    case 'setFilter':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filter]: action.value,
        },
      };
    case 'clearFilters':
      return {
        ...state,
        filters: {
          payer: 'All Payers',
          provider: 'All Providers',
          serviceType: 'All Service Types',
          location: 'All Locations',
          stage: 'All Stages',
          dateRange: 'All Dates',
        },
      };
    case 'startEhrSync':
      return { ...state, isSyncingFromEhr: true };
    case 'finishEhrSync':
      return { ...state, isSyncingFromEhr: false };
    default:
      return state;
  }
};

interface ClaimsContextValue {
  data: {
    claims: typeof seedClaims;
    tasks: Task[];
    stages: typeof seedStages;
    teamMembers: typeof teamMembers;
    rules: Rule[];
    newlyAddedClaimIds: Set<number>;
  };
  state: ClaimsUIState;
  actions: {
    setActiveTab: (value: ActiveTab) => void;
    setWorkflowView: (value: WorkflowView) => void;
    toggleClaimSelection: (claimId: number) => void;
    toggleAllClaims: () => void;
    clearSelectedClaims: () => void;
    toggleRowExpansion: (claimId: number) => void;
    setSelectedClaim: (claim: Claim | null) => void;
    setDetailPanelExpanded: (value: boolean) => void;
    setActiveDetailTab: (value: DetailTab) => void;
    setShowFullCMS1500: (value: boolean) => void;
    setSelectedSuggestions: (value: number[]) => void;
    toggleTaskSelection: (taskId: string) => void;
    toggleAllTasks: () => void;
    clearSelectedTasks: () => void;
    setAssignDropdownOpen: (value: string | null) => void;
    setSelectedTimePeriod: (value: string) => void;
    setFilter: (filter: 'payer' | 'provider' | 'serviceType' | 'location' | 'stage' | 'dateRange', value: string) => void;
    clearFilters: () => void;
    addRule: (name: string, description: string) => void;
    removeRule: (id: string) => void;
    syncFromEhr: () => void;
    approveSuggestions: (claimId: number, suggestionIndices: number[] | null, approvedBy?: string) => void;
    approveSuggestion: (claimId: number, suggestionIndex: number, approvedBy?: string) => void;
    rejectSuggestion: (claimId: number, suggestionIndex: number) => void;
    rejectSuggestions: (claimId: number) => void;
    submitClaims: (claimIds?: number[]) => void;
  };
}

const ClaimsContext = createContext<ClaimsContextValue | undefined>(undefined);

// Helper function to parse waiting time string to minutes
const parseWaitingTime = (timeStr: string): number => {
  const lower = timeStr.toLowerCase();
  if (lower.includes('just now') || lower.includes('min')) {
    const match = lower.match(/(\d+)\s*min/);
    return match ? parseInt(match[1], 10) : 0;
  }
  if (lower.includes('h')) {
    const match = lower.match(/(\d+)\s*h/);
    return match ? parseInt(match[1], 10) * 60 : 0;
  }
  if (lower.includes('d')) {
    const match = lower.match(/(\d+)\s*d/);
    return match ? parseInt(match[1], 10) * 1440 : 0;
  }
  return 0;
};

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>(seedClaims);
  const [rules, setRules] = useState<Rule[]>(seedRules);
  const [ehrBatchIndex, setEhrBatchIndex] = useState(0);
  const [newlyAddedClaimIds, setNewlyAddedClaimIds] = useState<Set<number>>(new Set());
  const [state, dispatch] = useReducer(claimsReducer, initialState);

  // Generate tasks dynamically from claims in "Human Approval" stage (pending)
  const generateTasksFromClaims = useMemo((): Task[] => {
    const pendingClaims = claims.filter((claim) => claim.stage === 'pending');

    return pendingClaims.map((claim) => {
      const aiSuggestions = claim.aiSuggestions ?? [];
      const pendingSuggestions = aiSuggestions.filter((s) => !s.approved && !s.rejected);
      const pendingCount = pendingSuggestions.length;

      // Determine task type based on claim state
      let taskType: Task['type'] = 'human-review';
      let reason = '';

      if (pendingCount > 0) {
        taskType = 'human-review';
        reason = `${pendingCount} AI suggestion${pendingCount > 1 ? 's' : ''} to review`;
      } else if (claim.status?.toLowerCase().includes('ready')) {
        taskType = 'ready-submit';
        reason = 'Changes approved - Ready to submit';
      } else {
        taskType = 'human-review';
        reason = 'Requires human review';
      }

      // Determine priority based on waiting time or claim characteristics
      const waitingMinutes = parseWaitingTime(claim.timeInStage);
      const priority: 'P1' | 'P2' = waitingMinutes > 1440 ? 'P1' : 'P2'; // P1 if waiting more than 1 day

      // Check if SLA is breached (more than 2 days)
      const slaBreached = waitingMinutes > 2880;

      return {
        id: `task-${claim.id}`,
        claimId: claim.id,
        patient: claim.patient,
        dob: claim.dob,
        payer: claim.payer,
        amount: claim.amount,
        type: taskType,
        stage: 'Human Approval',
        reason,
        priority,
        waiting: claim.timeInStage,
        waitingMinutes,
        assignedTo: claim.approvedBy && claim.approvedBy !== 'AI Auto-Approve' ? claim.approvedBy : null,
        slaBreached,
      };
    });
  }, [claims]);

  const hasLicensingRule = useMemo(
    () =>
      rules.some(
        (rule) =>
          rule.name.toLowerCase().includes('licensed') || rule.description.toLowerCase().includes('licensed in patient'),
      ),
    [rules],
  );

  type ClaimAISuggestion = NonNullable<Claim['aiSuggestions']>[number];

  const ensureSuggestionConfidence = (suggestion: ClaimAISuggestion): ClaimAISuggestion => ({
    ...suggestion,
    confidence: suggestion.confidence ?? 75,
  });

  const attachRuleSuggestions = (claim: Claim): Claim => {
    const suggestions = [...(claim.aiSuggestions ?? [])].map(ensureSuggestionConfidence);

    if (
      hasLicensingRule &&
      claim.mode === 'Telehealth' &&
      claim.providerState &&
      claim.patientState &&
      claim.providerState !== claim.patientState
    ) {
      suggestions.push({
        type: 'pos',
        from: `${claim.providerState} provider license`,
        to: `${claim.patientState} patient location`,
        reason: 'Provider must be licensed in the patient’s location for telehealth sessions.',
        confidence: 78,
      });
    }

    return { ...claim, aiSuggestions: suggestions };
  };

  const buildActivity = (title: string, detail: string, level: ClaimActivity['level'] = 'info'): ClaimActivity => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      id: crypto.randomUUID(),
      title,
      timestamp,
      detail,
      level,
    };
  };

  const applyAutoApprovals = (claim: Claim): Claim => {
    if (!claim.aiSuggestions || claim.aiSuggestions.length === 0) {
      // No AI suggestions; move to Human Approval so the charge advances
      return claim;
    }

    const suggestionsWithConfidence = claim.aiSuggestions.map(ensureSuggestionConfidence);
    const highConfidenceIndices = suggestionsWithConfidence.reduce<number[]>(
      (acc, suggestion, idx) => (suggestion.confidence > 90 ? [...acc, idx] : acc),
      [],
    );

    if (highConfidenceIndices.length === 0) {
      return {
        ...claim,
        aiSuggestions: suggestionsWithConfidence,
        stage: 'pending',
        status: `${suggestionsWithConfidence.length} AI suggestion${suggestionsWithConfidence.length > 1 ? 's' : ''} awaiting approval`,
        timeInStage: 'Just now',
      };
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const updatedSuggestions = suggestionsWithConfidence.map((suggestion, idx) =>
      highConfidenceIndices.includes(idx)
        ? { ...suggestion, approved: true, autoApproved: true }
        : suggestion,
    );

    const autoApprovedCount = updatedSuggestions.filter((s) => s.autoApproved).length;
    const remainingCount = updatedSuggestions.length - autoApprovedCount;
    const allApproved = remainingCount === 0;

    const updatedActivities: ClaimActivity[] = [
      ...(claim.activities ?? []),
      buildActivity(
        'Auto-approved by AI',
        `${autoApprovedCount} high-confidence suggestion${autoApprovedCount > 1 ? 's' : ''} auto-applied${remainingCount > 0 ? `; ${remainingCount} awaiting human review` : ''}`,
        'success',
      ),
    ];

    const status = allApproved
      ? `Ready to submit (auto-approved ${autoApprovedCount}/${updatedSuggestions.length})`
      : `Auto-approved ${autoApprovedCount}/${updatedSuggestions.length}; ${remainingCount} need review`;

    return {
      ...claim,
      aiSuggestions: updatedSuggestions,
      stage: allApproved ? 'ready-to-submit' : 'pending',
      status,
      approvedBy: 'AI Auto-Approve',
      approvedAt: timeString,
      timeInStage: 'Just now',
      activities: updatedActivities,
    };
  };

  const actions = useMemo(
    () => ({
      setActiveTab: (value: ActiveTab) => dispatch({ type: 'setActiveTab', value }),
      setWorkflowView: (value: WorkflowView) => dispatch({ type: 'setWorkflowView', value }),
      toggleClaimSelection: (claimId: number) => dispatch({ type: 'toggleClaimSelection', claimId }),
      toggleAllClaims: () => dispatch({ type: 'toggleAllClaims', allIds: claims.map((claim) => claim.id) }),
      clearSelectedClaims: () => dispatch({ type: 'clearSelectedClaims' }),
      toggleRowExpansion: (claimId: number) => dispatch({ type: 'toggleRowExpansion', claimId }),
      setSelectedClaim: (claim: Claim | null) => dispatch({ type: 'setSelectedClaim', claim }),
      setDetailPanelExpanded: (value: boolean) => dispatch({ type: 'setDetailPanelExpanded', value }),
      setActiveDetailTab: (value: DetailTab) => dispatch({ type: 'setActiveDetailTab', value }),
      setShowFullCMS1500: (value: boolean) => dispatch({ type: 'setShowFullCMS1500', value }),
      setSelectedSuggestions: (value: number[]) => dispatch({ type: 'setSelectedSuggestions', value }),
      toggleTaskSelection: (taskId: string) => dispatch({ type: 'toggleTaskSelection', taskId }),
      toggleAllTasks: () => {
        const allTaskIds = generateTasksFromClaims.map((task) => task.id);
        dispatch({ type: 'toggleAllTasks', taskIds: allTaskIds });
      },
      clearSelectedTasks: () => dispatch({ type: 'clearSelectedTasks' }),
      setAssignDropdownOpen: (value: string | null) => dispatch({ type: 'setAssignDropdownOpen', value }),
      setSelectedTimePeriod: (value: string) => dispatch({ type: 'setSelectedTimePeriod', value }),
      setFilter: (filter: 'payer' | 'provider' | 'serviceType' | 'location' | 'stage' | 'dateRange', value: string) =>
        dispatch({ type: 'setFilter', filter, value }),
      clearFilters: () => dispatch({ type: 'clearFilters' }),
      addRule: (name: string, description: string) => {
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();
        if (!trimmedName || !trimmedDescription) return;

        setRules((prev) => [...prev, { id: crypto.randomUUID(), name: trimmedName, description: trimmedDescription }]);
      },
      removeRule: (id: string) => setRules((prev) => prev.filter((rule) => rule.id !== id)),
      syncFromEhr: () => {
        if (state.isSyncingFromEhr) return;
        dispatch({ type: 'startEhrSync' });

        setTimeout(() => {
          const batch = ehrSyncBatches[Math.min(ehrBatchIndex, ehrSyncBatches.length - 1)] ?? [];
          const incoming = batch
            .filter((claim) => !claims.some((c) => c.id === claim.id))
            .map((claim) => attachRuleSuggestions(claim));

          if (incoming.length === 0) {
            dispatch({ type: 'finishEhrSync' });
            return;
          }

          const incomingWithSyncState = incoming.map((claim) => ({
            ...claim,
            stage: 'ai-review' as const,
            status: 'Syncing from EHR...',
            timeInStage: 'Just now',
            aiSuggestions: claim.aiSuggestions?.map(ensureSuggestionConfidence),
          }));

          // Add charges one by one with a delay
          incomingWithSyncState.forEach((claim, index) => {
            setTimeout(() => {
              // Mark as newly added for animation
              setNewlyAddedClaimIds((prev) => new Set(prev).add(claim.id));
              setClaims((prev) => [...prev, claim]);

              // Remove from newly added set after animation completes
              setTimeout(() => {
                setNewlyAddedClaimIds((prev) => {
                  const next = new Set(prev);
                  next.delete(claim.id);
                  return next;
                });
              }, 600); // Slightly longer than animation duration

              // After sync completes, show "AI is reviewing" (already in AI Review stage)
              setTimeout(() => {
                setClaims((prev) =>
                  prev.map((c) =>
                    c.id === claim.id
                      ? { ...c, status: 'AI is reviewing', timeInStage: 'Just now' }
                      : c,
                  ),
                );
              }, 2000);

              // Then show deeper analysis state (stay in AI review stage)
              setTimeout(() => {
                setClaims((prev) =>
                  prev.map((c) =>
                    c.id === claim.id
                      ? { ...c, stage: 'ai-review', status: 'Analyzing...', timeInStage: 'Just now' }
                      : c,
                  ),
                );
              }, 4000);

              // Finally, show review complete - add staggered delay so charges don't all move to Human Approval at once
              setTimeout(() => {
                setClaims((prev) =>
                  prev.map((c) => (c.id === claim.id ? applyAutoApprovals({ ...c, status: 'Review Complete' }) : c)),
                );
              }, 14000 + index * 1000); // 1 second delay between each charge moving to Human Approval
            }, index * 400); // 400ms delay between each charge
          });

          setEhrBatchIndex((prev) => Math.min(prev + 1, ehrSyncBatches.length - 1));

          // Finish sync after all charges have been added (with a small buffer)
          setTimeout(() => {
            dispatch({ type: 'finishEhrSync' });
          }, incomingWithSyncState.length * 400 + 100);
        }, 7000);
      },
      approveSuggestions: (claimId: number, suggestionIndices: number[] | null, approvedBy = 'Sarah M.') => {
        setClaims((prev) => {
          const updated = prev.map((claim) => {
            if (claim.id !== claimId || !claim.aiSuggestions) return claim;

            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            const indicesToApprove =
              suggestionIndices === null
                ? claim.aiSuggestions.map((_, idx) => idx)
                : suggestionIndices;

            const updatedSuggestions = claim.aiSuggestions.map((suggestion, idx) =>
              indicesToApprove.includes(idx) ? { ...suggestion, approved: true } : suggestion,
            );

            // Check if all suggestions are resolved (either approved or rejected)
            const allResolved = updatedSuggestions.every((suggestion) => suggestion.approved === true || suggestion.rejected === true);
            const remainingCount = updatedSuggestions.filter((s) => !s.approved && !s.rejected).length;
            const nextStage = allResolved ? ('ready-to-submit' as const) : claim.stage;
            const status = allResolved ? 'Ready to submit' : remainingCount > 0 ? `${remainingCount} suggestion${remainingCount > 1 ? 's' : ''} awaiting review` : claim.status;

            return {
              ...claim,
              aiSuggestions: updatedSuggestions,
              approvedBy,
              approvedAt: timeString,
              status,
              // Move to 'ready-to-submit' when all suggestions are resolved (approved or rejected)
              stage: nextStage,
              timeInStage: allResolved ? 'Just now' : claim.timeInStage,
            };
          });

          // Update selected claim if it's the one being approved
          const updatedClaim = updated.find((c) => c.id === claimId);
          if (updatedClaim && state.selectedClaim?.id === claimId) {
            dispatch({ type: 'updateSelectedClaim', claim: updatedClaim });
          }

          return updated;
        });
      },
      approveSuggestion: (claimId: number, suggestionIndex: number, approvedBy = 'Sarah M.') => {
        setClaims((prev) => {
          const updated = prev.map((claim) => {
            if (claim.id !== claimId || !claim.aiSuggestions) return claim;

            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            const updatedSuggestions = claim.aiSuggestions.map((suggestion, idx) =>
              idx === suggestionIndex ? { ...suggestion, approved: true, rejected: false } : suggestion,
            );

            // Check if all suggestions are resolved (either approved or rejected)
            const allResolved = updatedSuggestions.every((suggestion) => suggestion.approved === true || suggestion.rejected === true);
            const remainingCount = updatedSuggestions.filter((s) => !s.approved && !s.rejected).length;
            const nextStage = allResolved ? ('ready-to-submit' as const) : claim.stage;
            const status = allResolved ? 'Ready to submit' : remainingCount > 0 ? `${remainingCount} suggestion${remainingCount > 1 ? 's' : ''} awaiting review` : claim.status;

            return {
              ...claim,
              aiSuggestions: updatedSuggestions,
              approvedBy: allResolved ? approvedBy : claim.approvedBy || approvedBy,
              approvedAt: allResolved ? timeString : claim.approvedAt || timeString,
              status,
              stage: nextStage,
              timeInStage: allResolved ? 'Just now' : claim.timeInStage,
            };
          });

          // Update selected claim if it's the one being approved
          const updatedClaim = updated.find((c) => c.id === claimId);
          if (updatedClaim && state.selectedClaim?.id === claimId) {
            dispatch({ type: 'updateSelectedClaim', claim: updatedClaim });
          }

          return updated;
        });
      },
      rejectSuggestion: (claimId: number, suggestionIndex: number) => {
        setClaims((prev) => {
          const updated = prev.map((claim) => {
            if (claim.id !== claimId || !claim.aiSuggestions) return claim;

            const updatedSuggestions = claim.aiSuggestions.map((suggestion, idx) =>
              idx === suggestionIndex ? { ...suggestion, rejected: true, approved: false } : suggestion,
            );

            // Check if all suggestions are resolved (either approved or rejected)
            const allResolved = updatedSuggestions.every((suggestion) => suggestion.approved === true || suggestion.rejected === true);
            const rejectedCount = updatedSuggestions.filter((s) => s.rejected).length;
            const approvedCount = updatedSuggestions.filter((s) => s.approved).length;
            const remainingCount = updatedSuggestions.length - rejectedCount - approvedCount;

            let status = claim.status;
            if (allResolved) {
              status = 'Ready to submit';
            } else if (remainingCount > 0) {
              status = `${remainingCount} suggestion${remainingCount > 1 ? 's' : ''} awaiting review`;
            } else if (approvedCount > 0) {
              status = `${approvedCount} approved, ${rejectedCount} rejected`;
            } else {
              status = 'All suggestions rejected';
            }

            return {
              ...claim,
              aiSuggestions: updatedSuggestions,
              status,
              // Move to 'ready-to-submit' when all suggestions are resolved (approved or rejected)
              stage: allResolved ? ('ready-to-submit' as const) : claim.stage,
              timeInStage: allResolved ? 'Just now' : claim.timeInStage,
            };
          });

          // Update selected claim if it's the one being rejected
          const updatedClaim = updated.find((c) => c.id === claimId);
          if (updatedClaim && state.selectedClaim?.id === claimId) {
            dispatch({ type: 'updateSelectedClaim', claim: updatedClaim });
          }

          return updated;
        });
      },
      rejectSuggestions: (claimId: number) => {
        setClaims((prev) => {
          const updated = prev.map((claim) => {
            if (claim.id !== claimId || !claim.aiSuggestions) return claim;

            const updatedSuggestions = claim.aiSuggestions.map((suggestion) =>
              !suggestion.approved && !suggestion.rejected ? { ...suggestion, rejected: true, approved: false } : suggestion,
            );

            // Check if all suggestions are resolved (either approved or rejected)
            const allResolved = updatedSuggestions.every((suggestion) => suggestion.approved === true || suggestion.rejected === true);
            const rejectedCount = updatedSuggestions.filter((s) => s.rejected).length;
            const approvedCount = updatedSuggestions.filter((s) => s.approved).length;
            const remainingCount = updatedSuggestions.length - rejectedCount - approvedCount;

            let status = claim.status;
            if (allResolved) {
              status = 'Ready to submit';
            } else if (remainingCount > 0) {
              status = `${remainingCount} suggestion${remainingCount > 1 ? 's' : ''} awaiting review`;
            } else if (approvedCount > 0) {
              status = `${approvedCount} approved, ${rejectedCount} rejected`;
            } else {
              status = 'All suggestions rejected';
            }

            return {
              ...claim,
              aiSuggestions: updatedSuggestions,
              status,
              // Move to 'ready-to-submit' when all suggestions are resolved (approved or rejected)
              stage: allResolved ? ('ready-to-submit' as const) : claim.stage,
              timeInStage: allResolved ? 'Just now' : claim.timeInStage,
            };
          });

          // Update selected claim if it's the one being rejected
          const updatedClaim = updated.find((c) => c.id === claimId);
          if (updatedClaim && state.selectedClaim?.id === claimId) {
            dispatch({ type: 'updateSelectedClaim', claim: updatedClaim });
          }

          return updated;
        });
      },
      submitClaims: (claimIds?: number[]) => {
        setClaims((prev) => {
          const now = new Date();
          const dateString = now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          const idsToSubmit = claimIds || prev.filter((c) => c.stage === 'ready-to-submit').map((c) => c.id);

          const updated = prev.map((claim) => {
            if (!idsToSubmit.includes(claim.id) || claim.stage !== 'ready-to-submit') {
              return claim;
            }

            return {
              ...claim,
              stage: 'submitted' as const,
              status: 'In transit',
              submittedAt: dateString,
              clearinghouse: claim.clearinghouse || 'EHR',
              timeInStage: 'Just now',
            };
          });

          // Update selected claim if it's one of the submitted claims
          const updatedClaim = updated.find((c) => idsToSubmit.includes(c.id) && state.selectedClaim?.id === c.id);
          if (updatedClaim && state.selectedClaim) {
            dispatch({ type: 'updateSelectedClaim', claim: updatedClaim });
          }

          return updated;
        });
      },
    }),
    [attachRuleSuggestions, claims, ehrBatchIndex, rules, state.isSyncingFromEhr, state.selectedClaim, generateTasksFromClaims],
  );

  // Filter claims based on filter state
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (state.filters.payer !== 'All Payers' && claim.payer !== state.filters.payer) {
        return false;
      }
      if (state.filters.provider !== 'All Providers' && claim.provider !== state.filters.provider) {
        return false;
      }
      if (state.filters.serviceType !== 'All Service Types' && claim.serviceType !== state.filters.serviceType) {
        return false;
      }
      if (state.filters.location !== 'All Locations' && claim.facility !== state.filters.location) {
        return false;
      }
      if (state.filters.stage !== 'All Stages') {
        const stageMap: Record<string, Claim['stage']> = {
          'AI Review': 'ai-review',
          'Human Approval': 'pending',
          'Ready To Submit': 'ready-to-submit',
          'Claim Submitted': 'submitted',
        };
        const stageId = stageMap[state.filters.stage];
        if (stageId && claim.stage !== stageId) {
          return false;
        }
      }
      return true;
    });
  }, [claims, state.filters]);

  // Filter tasks based on filtered claims
  const filteredTasks = useMemo(() => {
    const filteredClaimIds = new Set(filteredClaims.map((c) => c.id));
    return generateTasksFromClaims.filter((task) => filteredClaimIds.has(task.claimId));
  }, [generateTasksFromClaims, filteredClaims]);

  const value = useMemo<ClaimsContextValue>(
    () => ({
      data: {
        claims: filteredClaims,
        tasks: filteredTasks,
        stages: seedStages,
        teamMembers,
        rules,
        newlyAddedClaimIds,
      },
      state,
      actions,
    }),
    [filteredClaims, filteredTasks, rules, state, actions, newlyAddedClaimIds],
  );

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};

