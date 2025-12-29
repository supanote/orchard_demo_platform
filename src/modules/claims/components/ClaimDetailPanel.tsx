import React from 'react';
import { useClaims } from '../ClaimsProvider';
import { findStage, formatCurrency } from '../utils';

export const ClaimDetailPanel: React.FC = () => {
  const {
    data: { stages },
    state: {
      selectedClaim,
      detailPanelExpanded,
      activeDetailTab,
      showFullCMS1500,
      selectedSuggestions,
    },
    actions: {
      setSelectedClaim,
      setDetailPanelExpanded,
      setActiveDetailTab,
      setShowFullCMS1500,
      setSelectedSuggestions,
      approveSuggestions,
    },
  } = useClaims();

  if (!selectedClaim) return null;

  const stage = findStage(stages, selectedClaim.stage);
  const placeOfServiceDisplay = selectedClaim.placeOfServiceCode
    ? `${selectedClaim.placeOfServiceCode}${selectedClaim.placeOfServiceDescription ? ` - ${selectedClaim.placeOfServiceDescription}` : ''}`
    : '11 - Office';
  const expectedPlaceOfServiceDisplay = selectedClaim.expectedPlaceOfServiceCode
    ? `${selectedClaim.expectedPlaceOfServiceCode}${
        selectedClaim.expectedPlaceOfServiceDescription ? ` - ${selectedClaim.expectedPlaceOfServiceDescription}` : ''
      }`
    : undefined;
  const serviceTypeDisplay =
    selectedClaim.serviceType || (selectedClaim.mode === 'Telehealth' ? 'Individual Therapy - Telehealth' : 'Individual Therapy - In-Person');
  const locationDisplay = selectedClaim.location || selectedClaim.facility;
  const quickFacts = selectedClaim.clinicalQuickFacts || [
    { title: 'Chief Complaint', value: 'Patient reports increased anxiety and difficulty sleeping over past 2 weeks...', showAction: true },
    { title: 'Session Duration', value: '52 minutes', prominent: true },
    { title: 'Primary Focus', value: 'Anxiety management, sleep hygiene' },
    { title: 'Session Type', value: 'Individual psychotherapy' },
  ];
  const clinicalNoteSections =
    selectedClaim.clinicalNoteSections ||
    [
      {
        label: 'SUBJECTIVE',
        text:
          'Patient reports increased anxiety over the past week, particularly related to work-related stress and upcoming project deadlines. States sleep has been disrupted, with difficulty falling asleep and early morning awakening. Denies current suicidal ideation. Reports compliance with previously prescribed coping strategies but notes they have been less effective recently.',
      },
      {
        label: 'OBJECTIVE',
        text:
          'Patient appeared anxious but engaged throughout session. Good eye contact maintained. Speech was coherent and goal-directed. Thought process was logical and organized. Mood reported as "stressed" with anxious affect noted. No evidence of psychosis. Insight and judgment appear intact.',
      },
      {
        label: 'ASSESSMENT',
        text:
          'Generalized Anxiety Disorder (F41.1) - Patient experiencing acute exacerbation of anxiety symptoms in context of work stressors. Sleep disturbance secondary to anxiety. Patient demonstrates good insight and engagement with treatment. Responding well to cognitive-behavioral interventions overall, though requires additional support during current stressor period.',
      },
      {
        label: 'PLAN',
        text:
          'Continue weekly individual psychotherapy sessions focusing on anxiety management and stress reduction. Reviewed and reinforced sleep hygiene techniques. Introduced progressive muscle relaxation exercise for bedtime routine. Patient to practice daily and report back next session. Will monitor sleep patterns and anxiety levels. Consider medication consultation if symptoms persist or worsen. Follow up in one week.',
      },
    ];
  const relatedDocuments =
    selectedClaim.relatedDocuments ||
    [
      { title: 'PCP Referral - Dr. Jennifer Smith', date: 'Jan 15, 2025', cta: 'View PDF' },
      { title: 'Treatment Plan', date: 'Updated Dec 20, 2024', cta: 'View' },
      { title: 'Initial Assessment', date: 'Dec 1, 2024', cta: 'View' },
    ];
  const hasPosMismatch =
    selectedClaim.placeOfServiceCode &&
    selectedClaim.expectedPlaceOfServiceCode &&
    selectedClaim.placeOfServiceCode !== selectedClaim.expectedPlaceOfServiceCode;
  const telehealthMissing95 = selectedClaim.mode === 'Telehealth' && !selectedClaim.modifiers.includes('-95');

  return (
    <aside
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col transition-all ${
        detailPanelExpanded ? 'w-full' : 'w-[680px]'
      }`}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {stage && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    stage.id === 'new'
                      ? 'bg-gray-100 text-gray-700'
                      : stage.id === 'ai-review'
                      ? 'bg-blue-50 text-blue-700'
                      : stage.id === 'pending'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {stage.name}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{selectedClaim.patient}</h2>
              <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedClaim.amount)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <span>{selectedClaim.payer}</span>
              <span className="text-gray-300">•</span>
              <span>DOS {selectedClaim.serviceDate}</span>
              <span className="text-gray-300">•</span>
              <span className="font-mono">CPT {selectedClaim.cpt[0]}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedClaim.stage === 'pending' && selectedClaim.aiSuggestions && !selectedClaim.approvedBy
                ? `${selectedClaim.aiSuggestions.length} AI suggestions awaiting approval`
                : null}
              {selectedClaim.stage === 'pending' && selectedClaim.approvedBy ? 'Changes approved - Ready to submit' : null}
              {selectedClaim.stage === 'ai-review' ? selectedClaim.status : null}
              {selectedClaim.stage === 'new' ? 'Ready for AI review' : null}
              {selectedClaim.stage === 'submitted' ? selectedClaim.status : null}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setDetailPanelExpanded(!detailPanelExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              title={detailPanelExpanded ? 'Collapse' : 'Expand to full page'}
            >
              {detailPanelExpanded ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
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
      </div>

      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {(['details', 'ai-review', 'clinical', 'submission', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDetailTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeDetailTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'details' && 'Claim Details'}
              {tab === 'ai-review' && 'AI Review'}
              {tab === 'clinical' && 'Clinical Details'}
              {tab === 'submission' && 'Submission'}
              {tab === 'activity' && 'Activity'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className={detailPanelExpanded ? 'max-w-4xl mx-auto' : ''}>
          {activeDetailTab === 'details' && (
            <div className="p-6 space-y-6">
              <InfoBlock
                title="Patient Information"
                rows={[
                  ['Name', selectedClaim.patient],
                  ['Date of Birth', selectedClaim.dob],
                  ['Member ID', selectedClaim.memberId || '—'],
                  ['Phone', selectedClaim.phone || '—'],
                ]}
              />
              <InfoBlock
                title="Insurance Information"
                rows={[
                  ['Payer', selectedClaim.payer],
                  ['Member ID', selectedClaim.memberId || '—'],
                  ['Group Number', 'GRP-12345'],
                  ['Plan Type', 'PPO'],
                ]}
              />
              <InfoBlock
                title="Service Details"
                rows={[
                  ['Date of Service', selectedClaim.serviceDate],
                  ['Provider', selectedClaim.provider],
                  ['Place of Service', placeOfServiceDisplay],
                  ['Expected POS', expectedPlaceOfServiceDisplay || '—'],
                  ['Service Type', serviceTypeDisplay],
                  ['Location', locationDisplay],
                ]}
              />
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
                    {selectedClaim.cpt.length > 1 &&
                      selectedClaim.cpt.slice(1).map((code) => (
                        <div key={code} className="flex items-center justify-between mt-2">
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
                    {selectedClaim.modifiers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedClaim.modifiers.map((modifier) => (
                          <span key={modifier} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                            {modifier}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-mono rounded">None</span>
                    )}
                    {telehealthMissing95 && (
                      <p className="text-xs text-amber-600 mt-1">Telehealth visit billed without required modifier 95.</p>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Units</span>
                    <span className="text-gray-900">1</span>
                  </div>
                </div>
              </div>
              <InfoBlock
                title="Financial"
                rows={[
                  ['Billed Amount', formatCurrency(selectedClaim.amount)],
                  ['Expected Reimbursement', '$120'],
                  ['Patient Responsibility', '$30 copay'],
                ]}
              />

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
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sessions Remaining</span>
                      <span className="text-gray-900">8 of 12</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowFullCMS1500(!showFullCMS1500)}
                className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {showFullCMS1500 ? 'Hide' : 'View'} Full CMS 1500 Form
              </button>

              {showFullCMS1500 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs space-y-2">
                  <p className="text-gray-600 italic">
                    Complete CMS 1500 form with all 33 boxes would be displayed here, including:
                  </p>
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

          {activeDetailTab === 'ai-review' && (
            <div className="p-6">
              {selectedClaim.stage === 'ai-review' && selectedClaim.status === 'Analyzing...' && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                      onClick={() =>
                        setSelectedSuggestions(
                          selectedSuggestions.length === selectedClaim.aiSuggestions?.length
                            ? []
                            : selectedClaim.aiSuggestions.map((_, i) => i),
                        )
                      }
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
                            onChange={() =>
                              setSelectedSuggestions(
                                selectedSuggestions.includes(idx)
                                  ? selectedSuggestions.filter((i) => i !== idx)
                                  : [...selectedSuggestions, idx],
                              )
                            }
                            className="mt-0.5 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {suggestion.type === 'cpt' && 'CPT Code Change'}
                                {suggestion.type === 'modifier' && 'Missing Modifier'}
                                {suggestion.type === 'pos' && 'Place of Service Correction'}
                                {suggestion.type === 'icd10' && 'ICD-10 Update'}
                              </p>
                              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                                High Confidence
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">
                              {suggestion.type === 'cpt' && `Change: ${suggestion.from} → ${suggestion.to}`}
                              {suggestion.type === 'modifier' && `Add modifier: ${suggestion.add}`}
                                {suggestion.type === 'pos' && `Update POS: ${suggestion.from || '11 - Office'} → ${suggestion.to || '02 - Telehealth'}`}
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
                    <button
                      onClick={() => {
                        if (selectedClaim) {
                          approveSuggestions(selectedClaim.id, null);
                        }
                      }}
                      className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                    >
                      Approve All Suggestions
                    </button>
                    <button
                      onClick={() => {
                        if (selectedClaim && selectedSuggestions.length > 0) {
                          approveSuggestions(selectedClaim.id, selectedSuggestions);
                        }
                      }}
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
                                  {suggestion.type === 'cpt' && 'CPT Code Change'}
                                  {suggestion.type === 'modifier' && 'Missing Modifier'}
                                  {suggestion.type === 'pos' && 'Place of Service Correction'}
                                  {suggestion.type === 'icd10' && 'ICD-10 Update'}
                                </p>
                                {suggestion.approved !== false ? (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                                    Applied
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                    Not Applied
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 mb-2">
                                {suggestion.type === 'cpt' && `Change: ${suggestion.from} → ${suggestion.to}`}
                                {suggestion.type === 'modifier' && `Add modifier: ${suggestion.add}`}
                                {suggestion.type === 'pos' && `Update POS: ${suggestion.from || '11 - Office'} → ${suggestion.to || '02 - Telehealth'}`}
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

          {activeDetailTab === 'clinical' && (
            <div className="p-6 space-y-6">
              {(hasPosMismatch || telehealthMissing95) && (
                <div className="space-y-3">
                  {hasPosMismatch && (
                    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-900">Place of service mismatch</p>
                      <p className="text-xs text-amber-800 mt-1">
                        Billed POS {placeOfServiceDisplay} but documentation suggests {expectedPlaceOfServiceDisplay || '02 - Telehealth'}.
                        Encounter location: {locationDisplay}.
                      </p>
                    </div>
                  )}
                  {telehealthMissing95 && (
                    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-900">Telehealth modifier 95 missing</p>
                      <p className="text-xs text-amber-800 mt-1">AI flagged missing 95 modifier for this telehealth visit.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {quickFacts.map((fact) => (
                  <QuickFact key={fact.title} title={fact.title} value={fact.value} prominent={fact.prominent} showAction={fact.showAction} />
                ))}
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Progress Note</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>Generated by</span>
                      <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 50'%3E%3Ctext x='10' y='35' font-family='Arial, sans-serif' font-size='24' fill='%23000'%3Esupanote.ai%3C/text%3E%3C/svg%3E"
                        alt="SuperNote"
                        className="h-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  {clinicalNoteSections.map((section) => (
                    <div key={section.label}>
                      <h4 className="font-semibold text-gray-900 mb-2">{section.label}</h4>
                      <p className="leading-relaxed">{section.text}</p>
                    </div>
                  ))}
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

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Diagnosis Information</h3>
                <div className="space-y-3">
                  {[
                    {
                      code: 'F33.1 - Major Depressive Disorder, Recurrent, Moderate',
                      context:
                        'Clinical context: Patient has history of MDD, currently in partial remission with ongoing therapy and medication management.',
                    },
                    {
                      code: 'F41.1 - Generalized Anxiety Disorder',
                      context:
                        'Clinical context: Primary presenting concern, experiencing acute exacerbation in context of work-related stressors.',
                    },
                  ].map((diagnosis) => (
                    <div key={diagnosis.code}>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{diagnosis.code}</p>
                          <p className="text-sm text-gray-600 mt-1">{diagnosis.context}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Documents</h3>
                <div className="space-y-2">
                  {relatedDocuments.map((doc) => (
                    <div key={doc.title} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.date}</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">{doc.cta}</button>
                    </div>
                  ))}
                </div>
              </div>

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

          {activeDetailTab === 'submission' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500">Last synced with EHR: 2 min ago</p>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Refresh from EHR</button>
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
                    <ChecklistRow label="Codes validated" />
                    <ChecklistRow label="Authorization verified" />
                    {selectedClaim.approvedBy && <ChecklistRow label="Changes applied" />}
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
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submission In Transit</p>
                      <p className="text-xs text-gray-500">Awaiting acknowledgment from clearinghouse</p>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
                    <InfoRow label="Submitted" value={selectedClaim.submittedAt || '—'} />
                    <InfoRow label="Via" value="EHR" />
                    <InfoRow label="Clearinghouse" value={selectedClaim.clearinghouse || '—'} />
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
                    <InfoRow label="Accepted" value={selectedClaim.acceptedAt || '—'} />
                    <InfoRow label="Submitted via" value="EHR" />
                    <InfoRow label="Clearinghouse" value={selectedClaim.clearinghouse || '—'} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <DownloadRow label="Download 999 Acknowledgment" />
                    <DownloadRow label="Download 837 File" />
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
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

          {activeDetailTab === 'activity' && (
            <div className="p-6">
              <div className="space-y-6">
                {selectedClaim.stage === 'submitted' && selectedClaim.status === 'Accepted' && (
                  <TimelineItem
                    icon={
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    }
                    title="Claim Accepted"
                    timestamp={selectedClaim.acceptedAt || ''}
                    body={
                      <>
                        <p className="text-sm text-gray-600">Accepted by {selectedClaim.clearinghouse}</p>
                        <p className="text-xs text-gray-500 mt-1">999 ACK received</p>
                      </>
                    }
                  />
                )}

                {selectedClaim.submittedAt && (
                  <TimelineItem
                    icon={
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                      </div>
                    }
                    title="Claim Submitted"
                    timestamp={selectedClaim.submittedAt}
                    body={<p className="text-sm text-gray-600">Submitted via EHR to {selectedClaim.clearinghouse}</p>}
                  />
                )}

                {selectedClaim.approvedBy && (
                  <TimelineItem
                    icon={
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      </div>
                    }
                    title="Changes Approved"
                    timestamp={selectedClaim.approvedAt || ''}
                    body={
                      <>
                        <p className="text-sm text-gray-600">{selectedClaim.approvedBy} approved AI suggestions</p>
                        {selectedClaim.aiSuggestions && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">View Details →</button>
                        )}
                      </>
                    }
                  />
                )}

                {selectedClaim.aiSuggestions && (
                  <>
                    <TimelineItem
                      icon={
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            <path d="M16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                          </svg>
                        </div>
                      }
                      title="AI Review Complete"
                      timestamp="2:34 PM"
                      body={
                        <>
                          <p className="text-sm text-gray-600">
                            Analyzed claim and identified {selectedClaim.aiSuggestions.length} suggestions
                          </p>
                          <ul className="text-xs text-gray-500 mt-2 space-y-0.5 list-disc list-inside">
                            {selectedClaim.aiSuggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index}>
                                {suggestion.type === 'cpt' && 'CPT code change recommended'}
                                {suggestion.type === 'modifier' && 'Missing modifier identified'}
                                {suggestion.type === 'icd10' && 'ICD-10 specificity improvement'}
                              </li>
                            ))}
                          </ul>
                        </>
                      }
                    />
                    <TimelineItem
                      icon={
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                            />
                          </svg>
                        </div>
                      }
                      title="AI Review Started"
                      timestamp="2:28 PM"
                      body={<p className="text-sm text-gray-600">Analyzing codes, modifiers, and documentation</p>}
                    />
                  </>
                )}

                <TimelineItem
                  icon={
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                        />
                      </svg>
                    </div>
                  }
                  title="Claim Received"
                  timestamp="2:27 PM"
                  body={
                    <>
                      <p className="text-sm text-gray-600">Imported from EHR</p>
                      <p className="text-xs text-gray-500 mt-1">DOS: {selectedClaim.serviceDate}</p>
                    </>
                  }
                />
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

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">Powered by Supa</p>
      </div>
    </aside>
  );
};

const InfoBlock: React.FC<{ title: string; rows: [string, string][] }> = ({ title, rows }) => (
  <div className="border border-gray-100 rounded-lg overflow-hidden">
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
    </div>
    <div className="p-4 space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between text-sm">
          <span className="text-gray-500">{label}</span>
          <span className="text-gray-900 font-medium">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const QuickFact: React.FC<{ title: string; value: string; prominent?: boolean; showAction?: boolean }> = ({
  title,
  value,
  prominent,
  showAction,
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <p className="text-xs text-gray-500 mb-2">{title}</p>
    <p className={prominent ? 'text-xl font-semibold text-gray-900' : 'text-sm text-gray-900'}>{value}</p>
    {showAction && (
      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
        Expand ▼
      </button>
    )}
  </div>
);

const ChecklistRow: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 text-sm">
    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span className="text-gray-600">{label}</span>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

const DownloadRow: React.FC<{ label: string }> = ({ label }) => (
  <button className="w-full py-2 px-3 text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between">
    <span className="flex items-center gap-2">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </span>
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  </button>
);

const TimelineItem: React.FC<{ icon: React.ReactNode; title: string; timestamp: string; body: React.ReactNode }> = ({
  icon,
  title,
  timestamp,
  body,
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      {icon}
      <div className="w-0.5 h-full bg-gray-200 mt-2" />
    </div>
    <div className="flex-1 pb-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <span className="text-xs text-gray-400">{timestamp}</span>
      </div>
      {body}
    </div>
  </div>
);

