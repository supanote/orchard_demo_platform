export type ClaimStage = 'ai-review' | 'pending' | 'ready-to-submit' | 'submitted';

export type WorkflowView = 'kanban' | 'table';

export type ActiveTab = 'summary' | 'workflow' | 'tasks' | 'rules';

export type DetailTab = 'details' | 'ai-review' | 'clinical' | 'submission' | 'activity';

export type TaskType = 'rejected' | 'human-review' | 'expert-review' | 'ready-submit';

export interface Stage {
  id: ClaimStage;
  name: string;
  color: string;
  bgColor: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
}

export interface AISuggestion {
  type: 'cpt' | 'modifier' | 'icd10' | 'pos';
  from?: string;
  to?: string;
  add?: string;
  reason: string;
  approved?: boolean;
  rejected?: boolean;
  confidence: number;
  autoApproved?: boolean;
}

export interface ClaimActivity {
  id: string;
  title: string;
  timestamp: string;
  detail?: string;
  level?: 'info' | 'success' | 'warning';
}

export interface ClinicalQuickFact {
  title: string;
  value: string;
  prominent?: boolean;
  showAction?: boolean;
  details?: string;
}

export interface ClinicalNoteSection {
  label: string;
  text: string;
}

export interface RelatedDocument {
  title: string;
  date: string;
  cta: string;
}

export interface Claim {
  id: number;
  patient: string;
  dob: string;
  serviceDate: string;
  provider: string;
  facility: string;
  mode: 'Telehealth' | 'In-Person';
  providerState?: string;
  patientState?: string;
  cpt: string[];
  modifiers: string[];
  icd10: string[];
  amount: number;
  payer: string;
  stage: ClaimStage;
  status: string;
  timeInStage: string;
  isResubmission: boolean;
  resubmissionAttempt?: number;
  previousRejection?: string;
  aiSuggestions?: AISuggestion[];
  approvedBy?: string;
  approvedAt?: string;
  submittedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  rejectionCode?: string;
  clearinghouse?: string;
  needsApproval?: boolean;
  memberId?: string;
  phone?: string;
  placeOfServiceCode?: string;
  placeOfServiceDescription?: string;
  expectedPlaceOfServiceCode?: string;
  expectedPlaceOfServiceDescription?: string;
  serviceType?: string;
  location?: string;
  clinicalQuickFacts?: ClinicalQuickFact[];
  clinicalNoteSections?: ClinicalNoteSection[];
  relatedDocuments?: RelatedDocument[];
  telehealthPlatform?: string;
  activities?: ClaimActivity[];
}

export interface Task {
  id: string;
  claimId: number;
  patient: string;
  dob: string;
  payer: string;
  amount: number;
  type: TaskType;
  stage: string;
  reason: string;
  priority: 'P1' | 'P2';
  waiting: string;
  waitingMinutes: number;
  assignedTo: string | null;
  slaBreached: boolean;
}

export interface ClaimsUIState {
  activeTab: ActiveTab;
  selectedClaim: Claim | null;
  workflowView: WorkflowView;
  expandedRows: number[];
  selectedClaims: number[];
  detailPanelExpanded: boolean;
  activeDetailTab: DetailTab;
  showFullCMS1500: boolean;
  selectedSuggestions: number[];
  selectedTasks: string[];
  assignDropdownOpen: string | null;
  selectedTimePeriod: string;
  isSyncingFromEhr: boolean;
  filters: {
    payer: string;
    provider: string;
    serviceType: string;
    location: string;
    stage: string;
    dateRange: string;
  };
}

