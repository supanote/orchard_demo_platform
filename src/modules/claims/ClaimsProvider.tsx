import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { claims as seedClaims, ehrSyncClaims, stages as seedStages, tasks as seedTasks, teamMembers } from './data';
import type { ActiveTab, ClaimsUIState, Claim, DetailTab, WorkflowView } from './types';
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
  | { type: 'toggleAllTasks' }
  | { type: 'clearSelectedTasks' }
  | { type: 'setAssignDropdownOpen'; value: string | null }
  | { type: 'setSelectedTimePeriod'; value: string }
  | { type: 'startEhrSync' }
  | { type: 'finishEhrSync' };

const initialState: ClaimsUIState = {
  activeTab: 'workflow',
  selectedClaim: null,
  workflowView: 'kanban',
  expandedRows: [],
  selectedClaims: [],
  detailPanelExpanded: false,
  activeDetailTab: 'details',
  showFullCMS1500: false,
  selectedSuggestions: [],
  selectedTasks: [],
  assignDropdownOpen: null,
  selectedTimePeriod: 'Last 7 days',
  isSyncingFromEhr: false,
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
        activeDetailTab: 'details',
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
      const allIds = seedTasks.map((task) => task.id);
      const isAllSelected = state.selectedTasks.length === allIds.length;
      return { ...state, selectedTasks: isAllSelected ? [] : allIds };
    }
    case 'clearSelectedTasks':
      return { ...state, selectedTasks: [] };
    case 'setAssignDropdownOpen':
      return { ...state, assignDropdownOpen: action.value };
    case 'setSelectedTimePeriod':
      return { ...state, selectedTimePeriod: action.value };
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
    tasks: typeof seedTasks;
    stages: typeof seedStages;
    teamMembers: typeof teamMembers;
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
    syncFromEhr: () => void;
    approveSuggestions: (claimId: number, suggestionIndices: number[] | null, approvedBy?: string) => void;
  };
}

const ClaimsContext = createContext<ClaimsContextValue | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>(seedClaims);
  const [state, dispatch] = useReducer(claimsReducer, initialState);

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
      toggleAllTasks: () => dispatch({ type: 'toggleAllTasks' }),
      clearSelectedTasks: () => dispatch({ type: 'clearSelectedTasks' }),
      setAssignDropdownOpen: (value: string | null) => dispatch({ type: 'setAssignDropdownOpen', value }),
      setSelectedTimePeriod: (value: string) => dispatch({ type: 'setSelectedTimePeriod', value }),
      syncFromEhr: () => {
        if (state.isSyncingFromEhr) return;
        dispatch({ type: 'startEhrSync' });

        setTimeout(() => {
          const incoming = ehrSyncClaims.filter((claim) => !claims.some((c) => c.id === claim.id));
          if (incoming.length === 0) {
            dispatch({ type: 'finishEhrSync' });
            return;
          }

          const incomingWithSyncState = incoming.map((claim) => ({
            ...claim,
            stage: 'new' as const,
            status: 'Syncing from EHR...',
            timeInStage: 'Just now',
          }));

          setClaims((prev) => [...prev, ...incomingWithSyncState]);

          incomingWithSyncState.forEach((claim) => {
            // After sync completes, show "Queued for AI review" (still in 'new' stage)
            setTimeout(() => {
              setClaims((prev) =>
                prev.map((c) =>
                  c.id === claim.id
                    ? { ...c, status: 'Queued for AI review', timeInStage: 'Just now' }
                    : c,
                ),
              );
            }, 2000);

            // Then move to AI review stage
            setTimeout(() => {
              setClaims((prev) =>
                prev.map((c) =>
                  c.id === claim.id
                    ? { ...c, stage: 'ai-review', status: 'Analyzing...', timeInStage: 'Just now' }
                    : c,
                ),
              );
            }, 4000);

            // Finally, show review complete
            setTimeout(() => {
              setClaims((prev) =>
                prev.map((c) => (c.id === claim.id ? { ...c, status: 'Review Complete' } : c)),
              );
            }, 14000);
          });

          dispatch({ type: 'finishEhrSync' });
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

            // Check if all suggestions are approved
            const allApproved = updatedSuggestions.every((suggestion) => suggestion.approved === true);

            return {
              ...claim,
              aiSuggestions: updatedSuggestions,
              approvedBy,
              approvedAt: timeString,
              status: 'Changes Applied',
              // Move to 'pending' stage (Human Approval) if all suggestions are approved
              stage: allApproved ? ('pending' as const) : claim.stage,
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
    }),
    [claims, state.isSyncingFromEhr, state.selectedClaim],
  );

  const value = useMemo<ClaimsContextValue>(
    () => ({
      data: { claims, tasks: seedTasks, stages: seedStages, teamMembers },
      state,
      actions,
    }),
    [claims, state, actions],
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

