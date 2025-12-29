import React from 'react';
import { useClaims } from '../ClaimsProvider';
import { TabNavigation } from './TabNavigation';
import { SummaryTab } from './SummaryTab';
import { WorkflowTab } from './WorkflowTab';
import { TasksTab } from './TasksTab';
import { ClaimDetailPanel } from './ClaimDetailPanel';

export const ClaimsPage: React.FC = () => {
  const {
    state: { activeTab },
  } = useClaims();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Claims & Charge Review</h1>
            <p className="text-sm text-gray-500 mt-0.5">Automated charge review and claims submission</p>
          </div>
        </div>
      </header>

      <TabNavigation />

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'summary' && <SummaryTab />}
        {activeTab === 'workflow' && <WorkflowTab />}
        {activeTab === 'tasks' && <TasksTab />}
        <ClaimDetailPanel />
      </main>
    </div>
  );
};

