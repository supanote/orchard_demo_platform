export type ClaimStage = 'new' | 'ai-review' | 'pending' | 'submitted';

export type WorkflowView = 'kanban' | 'table';

export type ActiveTab = 'summary' | 'workflow' | 'tasks';

export type DetailTab = 'details' | 'ai-review' | 'clinical' | 'submission' | 'activity';

export type TaskType = 'rejected' | 'human-review' | 'expert-review' | 'ready-submit';

export interface Stage {
  id: ClaimStage;
  name: string;
  color: string;
  bgColor: string;
}

export interface AISuggestion {
  type: 'cpt' | 'modifier' | 'icd10' | 'pos';
  from?: string;
  to?: string;
  add?: string;
  reason: string;
  approved?: boolean;
}

export interface ClinicalQuickFact {
  title: string;
  value: string;
  prominent?: boolean;
  showAction?: boolean;
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
}

